const { supabaseAdmin: supabase } = require('../config/supabase');

const complaintRepository = {
    // ---- USER ACTIONS ----
    createComplaint: async ({ reporterId, reportedUserId, reportedJobId, reason, description }) => {
        const { data, error } = await supabase
            .from('complaints')
            .insert([{
                reporter_id: reporterId,
                reported_user_id: reportedUserId || null,
                reported_job_id: reportedJobId || null,
                reason,
                description,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // ---- ADMIN ACTIONS ----
    getAllComplaints: async () => {
        const { data, error } = await supabase
            .from('complaints')
            .select(`
                *,
                reporter:users!complaints_reporter_id_fkey(id, first_name, last_name, user_id, role),
                reported_user:users!complaints_reported_user_id_fkey(id, first_name, last_name, user_id, role),
                reported_job:jobs(id, title)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    updateComplaintStatus: async (complaintId, status, adminNotes) => {
        const { data, error } = await supabase
            .from('complaints')
            .update({ status, admin_notes: adminNotes })
            .eq('id', complaintId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

module.exports = complaintRepository;
