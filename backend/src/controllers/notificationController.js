const notificationService = require('../services/notificationService');
const jobRepository = require('../repositories/jobRepository');
const profileRepository = require('../repositories/profileRepository');

const notificationController = {
    // Get all notifications for the logged-in user
    getUserNotifications: async (req, res) => {
        try {
            const userId = req.user.id; // from auth middleware
            const notifications = await notificationService.getUserNotifications(userId);
            res.json(notifications);
        } catch (error) {
            console.error('Error in getUserNotifications:', error);
            res.status(500).json({ error: 'Failed to fetch notifications' });
        }
    },

    // Mark a specific notification as read
    markAsRead: async (req, res) => {
        try {
            const userId = req.user.id;
            const notificationId = req.params.id;
            const notification = await notificationService.markAsRead(notificationId, userId);
            res.json(notification);
        } catch (error) {
            console.error('Error in markAsRead:', error);
            res.status(500).json({ error: 'Failed to mark notification as read' });
        }
    },

    // Mark all as read
    markAllAsRead: async (req, res) => {
        try {
            const userId = req.user.id;
            await notificationService.markAllAsRead(userId);
            res.json({ message: 'All notifications marked as read' });
        } catch (error) {
            console.error('Error in markAllAsRead:', error);
            res.status(500).json({ error: 'Failed to mark all as read' });
        }
    },

    // Get application context for actionable notifications
    getApplicationContext: async (req, res) => {
        try {
            const applicationId = req.params.applicationId;
            const app = await jobRepository.getApplicationById(applicationId);
            if (!app) return res.status(404).json({ error: 'Application not found' });

            const profile = await profileRepository.findByUserId(app.applicant_id);
            res.json({
                application: app,
                applicant_profile: profile,
                job: app.jobs || null
            });
        } catch (error) {
            console.error('Error in getApplicationContext:', error);
            res.status(500).json({ error: 'Failed to fetch application context' });
        }
    }
};

module.exports = notificationController;
