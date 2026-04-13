const { supabaseAdmin: supabase } = require('../config/supabase');

const notificationService = {
    /**
     * Create a new notification
     * @param {string} userId - ID of the user receiving the notification
     * @param {string} type - Notification type (e.g., 'JOB_OFFER', 'STATUS_UPDATE', 'NEW_APPLICANT')
     * @param {string} message - Notification text
     * @param {string} [relatedId=null] - ID of the related entity (e.g., job_id or application_id)
     */
    createNotification: async (userId, type, message, relatedId = null) => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .insert([{
                    user_id: userId,
                    type,
                    message,
                    related_id: relatedId
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating notification:', error);
            // We don't want to throw an error and crash the main flow (like applying for a job)
            // if just the notification fails, so we swallow it here.
            return null;
        }
    },

    /**
     * Fetch all notifications for a specific user
     * @param {string} userId 
     * @returns {Array} List of notifications
     */
    getUserNotifications: async (userId) => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Mark a specific notification as read
     * @param {string} notificationId 
     * @param {string} userId - To verify ownership
     */
    markAsRead: async (notificationId, userId) => {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Mark all notifications for a user as read
     * @param {string} userId 
     */
    markAllAsRead: async (userId) => {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false)
            .select();

        if (error) throw new Error(error.message);
        return data;
    }
};

module.exports = notificationService;
