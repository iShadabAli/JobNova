const { supabaseAdmin: supabase } = require('../config/supabase');

const adminRepository = {
    // ---- USER MANAGEMENT ----
    getAllUsers: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('id, user_id, phone, role, first_name, last_name, is_profile_completed, is_suspended, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    suspendUser: async (userId) => {
        const { data, error } = await supabase
            .from('users')
            .update({ is_suspended: true })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    unsuspendUser: async (userId) => {
        const { data, error } = await supabase
            .from('users')
            .update({ is_suspended: false })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // ---- JOB MODERATION ----
    getAllJobs: async () => {
        const { data, error } = await supabase
            .from('jobs')
            .select('*, applications(count)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    deleteJob: async (jobId) => {
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', jobId);

        if (error) throw error;
        return true;
    },

    // ---- ANALYTICS ----
    getPlatformStats: async () => {
        const [usersRes, jobsRes, appsRes, reviewsRes] = await Promise.all([
            supabase.from('users').select('id, role', { count: 'exact' }),
            supabase.from('jobs').select('id, status', { count: 'exact' }),
            supabase.from('applications').select('id, status', { count: 'exact' }),
            supabase.from('reviews').select('id', { count: 'exact', head: true })
        ]);

        if (usersRes.error) throw usersRes.error;
        if (jobsRes.error) throw jobsRes.error;
        if (appsRes.error) throw appsRes.error;

        // Role distribution
        const users = usersRes.data || [];
        const roleCounts = { blue_collar: 0, white_collar: 0, employer: 0, admin: 0 };
        users.forEach(u => { if (roleCounts[u.role] !== undefined) roleCounts[u.role]++; });

        // Job status distribution
        const jobs = jobsRes.data || [];
        const activeJobs = jobs.filter(j => j.status === 'Active').length;
        const closedJobs = jobs.filter(j => j.status === 'Closed').length;

        // Application status distribution
        const apps = appsRes.data || [];
        const appStatusCounts = {};
        apps.forEach(a => { appStatusCounts[a.status] = (appStatusCounts[a.status] || 0) + 1; });

        return {
            totalUsers: users.length,
            totalJobs: jobs.length,
            totalApplications: apps.length,
            totalReviews: reviewsRes.count || 0,
            roleCounts,
            activeJobs,
            closedJobs,
            appStatusCounts
        };
    },

    // ---- SYSTEM LOGS ----
    getSystemLogs: async (limit = 50) => {
        const { data, error } = await supabase
            .from('system_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    createSystemLog: async (action, performedBy, targetType, targetId, details) => {
        const { data, error } = await supabase
            .from('system_logs')
            .insert([{
                action,
                performed_by: performedBy,
                target_type: targetType,
                target_id: targetId,
                details
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating system log:', error);
            return null;
        }
        return data;
    }
};

module.exports = adminRepository;
