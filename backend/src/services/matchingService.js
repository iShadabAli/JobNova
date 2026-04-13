const { supabase } = require('../config/supabase');

/**
 * Matching Algorithm for JobNova
 * 
 * Blue-Collar Logic:
 * - Match Location (City/Area)
 * - Match Skills (At least one matching skill)
 * - Match Availability (if specified)
 * 
 * White-Collar Logic:
 * - Match Role in Job Title (Fuzzy match)
 * - Match Experience Level (Years of experience check)
 */

const matchJobs = async (userProfile, jobType, searchWords = []) => {
    // 1. Fetch all active jobs of the requested type
    let query = supabase
        .from('jobs')
        .select('*')
        .eq('status', 'Active')
        .eq('type', jobType);

    const isSearching = searchWords && searchWords.length > 0;

    if (isSearching) {
        // Expand the OR clause to search title, location, description, and skills for ANY of the search words
        const orConditions = searchWords.map(word => 
            `title.ilike.%${word}%,location.ilike.%${word}%,description.ilike.%${word}%,skills.ilike.%${word}%`
        ).join(',');
        query = query.or(orConditions);
    }

    const { data: jobs, error } = await query;

    if (error) throw new Error(`Error fetching jobs: ${error.message}`);

    // 2. If user is actively searching, SKIP strict profile matching and return all DB results.
    //    The database already filtered by keyword. No need to also require location/skill overlap.
    //    Only apply strict profile matching when browsing (no search term).
    let finalJobs;
    if (isSearching) {
        finalJobs = jobs; // Return all search-matched results directly
    } else {
        finalJobs = jobs.filter(job => {
            if (jobType === 'blue') {
                return matchBlueCollar(userProfile, job);
            } else {
                return matchWhiteCollar(userProfile, job);
            }
        });
    }

    // 3. Fetch employer profiles for the results
    if (finalJobs.length > 0) {
        const employerIds = [...new Set(finalJobs.map(j => j.employer_id).filter(Boolean))];
        if (employerIds.length > 0) {
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('user_id, full_name, phone, company_name, bio, location, experience_years, skills, avg_rating, total_reviews')
                .in('user_id', employerIds);

            if (profilesData) {
                const profileMap = {};
                profilesData.forEach(p => profileMap[p.user_id] = p);
                finalJobs.forEach(job => {
                    job.profiles = profileMap[job.employer_id] || null;
                });
            }
        }
    }

    return finalJobs;
};

// Helper: Blue Collar Matching (Soft matching — show more jobs, don't be too strict)
const matchBlueCollar = (profile, job) => {
    // For blue-collar, we show ALL active jobs.
    // Location and skills are treated as soft bonuses,
    // not hard filters (blue-collar workers travel for work).
    return true;
};

// Helper: White Collar Matching
const matchWhiteCollar = (profile, job) => {
    // 1. Role/Title Match
    // If user has a "Role" (e.g. Developer), check if Job Title contains it
    if (profile.role && typeof profile.role === 'string' && job.title) {
        const userRole = profile.role.toLowerCase();
        const jobTitle = String(job.title).toLowerCase();
        if (!jobTitle.includes(userRole)) {
            // If role mismatch, strictly filter out? Or allow partial matches?
            // Let's be semi-strict: if user defines a role, they probably want that role.
            return false;
        }
    }

    // 2. Experience Match
    // Map textual levels to years (Approximation)
    const minYears = getMinYearsForLevel(job.experience_level);
    if (profile.experience_years !== undefined && profile.experience_years !== null) {
        if (profile.experience_years < minYears) {
            return false;
        }
    }

    return true;
};

const getMinYearsForLevel = (level) => {
    if (!level) return 0;
    const l = level.toLowerCase();
    if (l.includes('entry') || l.includes('junior')) return 0;
    if (l.includes('mid')) return 2;
    if (l.includes('senior') || l.includes('lead')) return 5;
    if (l.includes('expert') || l.includes('manager')) return 8;
    return 0; // Default
};

module.exports = {
    matchJobs
};
