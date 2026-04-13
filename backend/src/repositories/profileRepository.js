const { supabaseAdmin: supabase } = require('../config/supabase');

const profileRepository = {
    findByUserId: async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    update: async (userId, updates) => {
        const { data, error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date() })
            .eq('user_id', userId)
            .select();

        if (error) throw error;
        return data ? data[0] : null;
    },

    create: async (userId, profileData) => {
        const { data, error } = await supabase
            .from('profiles')
            .insert([{ user_id: userId, ...profileData }])
            .select();

        if (error) throw error;
        return data ? data[0] : null;
    },

    markUserCompletedProfile: async (userId) => {
        const { error } = await supabase
            .from('users')
            .update({ is_profile_completed: true })
            .eq('id', userId);

        if (error) throw error;
    },

    getHiringHistoryApps: async () => {
        const { data, error } = await supabase
            .from('applications')
            .select(`
                id,
                status,
                created_at,
                job_id,
                applicant_id,
                jobs (
                    title,
                    type,
                    employer_id
                )
            `)
            .eq('status', 'Completed');

        if (error) throw error;
        return data;
    },

    // -----------------------------------------------------
    // STORAGE ABSTRACTIONS (Strict 3-Tier)
    // -----------------------------------------------------
    uploadFileToStorage: async (bucket, path, buffer, mimetype) => {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, buffer, {
                contentType: mimetype,
                upsert: true
            });

        if (error) throw error;
        return data;
    },

    getPublicUrl: (bucket, path) => {
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    },

    getPublicProfile: async (userId) => {
        // 1. Get profile data
        let profile = null;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();
            if (!error) profile = data;
        } catch (e) {
            console.error('Profile fetch error:', e);
        }

        // 2. Get reviews received by this user
        let reviews = [];
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*') // Simplify to all columns first to avoid join issues
                .eq('reviewee_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (error) {
                console.error(`[profileRepository] Error fetching reviews:`, error);
            } else if (data) {
                // Separately fetch reviewer names from profiles table
                for (let review of data) {
                    try {
                        const { data: reviewerProfile } = await supabase
                            .from('profiles')
                            .select('full_name')
                            .eq('user_id', review.reviewer_id)
                            .single();
                        review.reviewer_name = reviewerProfile?.full_name || 'Anonymous';
                        
                        // Fetch job title separately to avoid join complexity
                        if (review.job_id) {
                            const { data: jobData } = await supabase
                                .from('jobs')
                                .select('title')
                                .eq('id', review.job_id)
                                .single();
                            review.job_title = jobData?.title;
                        }
                    } catch (e) {
                        review.reviewer_name = 'Anonymous';
                    }
                }
                reviews = data;
            }
        } catch (e) {
            console.error('[profileRepository] Reviews fetch exception:', e);
            reviews = [];
        }

        // 3. Get jobs posted by this user
        let jobsPosted = [];
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('id, title, type, status, created_at')
                .eq('employer_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);
            if (!error && data) jobsPosted = data;
        } catch (e) {
            console.error('Jobs posted fetch error:', e);
        }

        // 4. Get completed jobs count
        let completedJobsCount = 0;
        try {
            const { count } = await supabase
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .eq('applicant_id', userId)
                .eq('status', 'Completed');
            completedJobsCount = count || 0;
        } catch (e) {
            console.error('Completed jobs count error:', e);
        }

        // 5. Get user info from users table
        let userData = {};
        try {
            const { data } = await supabase
                .from('users')
                .select('role, phone, first_name, last_name')
                .eq('id', userId)
                .single();
            if (data) userData = data;
        } catch (e) {
            console.error('User data fetch error:', e);
        }

        return {
            profile: profile || {},
            reviews: reviews,
            jobs_posted: jobsPosted,
            completed_jobs_count: completedJobsCount,
            user_info: userData
        };
    },

    getProfileNameRole: async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('user_id', userId)
            .single();

        return data;
    }
};

module.exports = profileRepository;
