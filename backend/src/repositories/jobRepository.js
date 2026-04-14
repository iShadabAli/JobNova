const { supabaseAdmin: supabase } = require('../config/supabase');

const jobRepository = {
    createJob: async (jobData) => {
        const { data, error } = await supabase
            .from('jobs')
            .insert([jobData])
            .select();

        if (error) throw error;
        return data[0];
    },

    deleteJob: async (jobId) => {
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', jobId);

        if (error) throw error;
        return true;
    },

    getJobs: async (type, searchWords = []) => {
        let query = supabase.from('jobs').select('*').eq('status', 'Active').order('created_at', { ascending: false });
        if (type) query = query.eq('type', type);

        if (searchWords && searchWords.length > 0) {
            // Apply a massive OR clause for each translated word on the title, location, description, and skills
            const orConditions = searchWords.map(word => 
                `title.ilike.%${word}%,location.ilike.%${word}%,description.ilike.%${word}%,skills.ilike.%${word}%`
            ).join(',');
            query = query.or(orConditions);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Fetch corresponding profiles manually
        if (data && data.length > 0) {
            const employerIds = [...new Set(data.map(job => job.employer_id).filter(Boolean))];
            if (employerIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('user_id, full_name, phone, company_name, bio, location, experience_years, skills')
                    .in('user_id', employerIds);
                
                if (profilesData) {
                    const profileMap = {};
                    profilesData.forEach(p => profileMap[p.user_id] = p);
                    data.forEach(job => {
                        job.profiles = profileMap[job.employer_id] || null;
                    });
                }
            }
        }
        return data;
    },


    findApplication: async (jobId, applicantId) => {
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('job_id', jobId)
            .eq('applicant_id', applicantId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    createApplication: async (applicationData) => {
        const { data, error } = await supabase
            .from('applications')
            .insert([applicationData])
            .select();

        if (error) throw error;
        return data[0];
    },

    getMyJobs: async (employerId) => {
        const { data, error } = await supabase
            .from('jobs')
            .select('*, applications(count)')
            .eq('employer_id', employerId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    getNearbyJobs: async (lat, lng, radius, searchWords = []) => {
        // Fetch all active jobs first
        let query = supabase
            .from('jobs')
            .select('*')
            .eq('status', 'Active')
            .eq('type', 'blue')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null);

        if (searchWords && searchWords.length > 0) {
            const orConditions = searchWords.map(word => 
                `title.ilike.%${word}%,location.ilike.%${word}%,description.ilike.%${word}%,skills.ilike.%${word}%`
            ).join(',');
            query = query.or(orConditions);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Haversine formula helper
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Earth radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c; // Distance in km
        };

        // Filter and attach distance
        const nearbyJobs = data.filter(job => {
            const distance = calculateDistance(lat, lng, job.latitude, job.longitude);
            if (distance <= radius) {
                job.distance = distance.toFixed(1);
                return true;
            }
            return false;
        }).sort((a, b) => a.distance - b.distance); // Sort by closest

        // Fetch corresponding profiles manually for the filtered nearby jobs
        if (nearbyJobs.length > 0) {
            const employerIds = [...new Set(nearbyJobs.map(job => job.employer_id).filter(Boolean))];
            if (employerIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('user_id, full_name, phone, company_name, bio, location, experience_years, skills')
                    .in('user_id', employerIds);
                
                if (profilesData) {
                    const profileMap = {};
                    profilesData.forEach(p => profileMap[p.user_id] = p);
                    nearbyJobs.forEach(job => {
                        job.profiles = profileMap[job.employer_id] || null;
                    });
                }
            }
        }
        
        return nearbyJobs;
    },

    getJobById: async (jobId) => {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    getJobApplications: async (jobId) => {
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('job_id', jobId);

        if (error) throw error;
        return data;
    },

    getApplicationById: async (applicationId) => {
        const { data, error } = await supabase
            .from('applications')
            .select('*, jobs(*)')
            .eq('id', applicationId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    updateApplicationStatus: async (applicationId, status) => {
        const { data, error } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', applicationId)
            .select();

        if (error) throw error;
        return data[0];
    },

    getWorkerApplications: async (userId) => {
        const { data, error } = await supabase
            .from('applications')
            .select('*, jobs(*)')
            .eq('applicant_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
};

module.exports = jobRepository;
