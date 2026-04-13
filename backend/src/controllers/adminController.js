const adminService = require('../services/adminService');

const adminController = {
    // GET /api/admin/stats
    getStats: async (req, res) => {
        try {
            const stats = await adminService.getPlatformStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            console.error('Error in getStats:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /api/admin/users
    getUsers: async (req, res) => {
        try {
            const users = await adminService.getAllUsers();
            res.json({ success: true, data: users });
        } catch (error) {
            console.error('Error in getUsers:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // PUT /api/admin/users/:id/suspend
    toggleSuspend: async (req, res) => {
        try {
            const result = await adminService.toggleSuspendUser(req.params.id, req.user.id);
            res.json({ success: true, data: result });
        } catch (error) {
            console.error('Error in toggleSuspend:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // GET /api/admin/jobs
    getJobs: async (req, res) => {
        try {
            const jobs = await adminService.getAllJobs();
            res.json({ success: true, data: jobs });
        } catch (error) {
            console.error('Error in getJobs:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // DELETE /api/admin/jobs/:id
    deleteJob: async (req, res) => {
        try {
            await adminService.deleteJob(req.params.id, req.user.id);
            res.json({ success: true, message: 'Job deleted successfully' });
        } catch (error) {
            console.error('Error in deleteJob:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // GET /api/admin/logs
    getLogs: async (req, res) => {
        try {
            const logs = await adminService.getSystemLogs();
            res.json({ success: true, data: logs });
        } catch (error) {
            console.error('Error in getLogs:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /api/admin/verifications/pending
    getPendingVerifications: async (req, res) => {
        try {
            const verifications = await adminService.getPendingVerifications();
            res.json({ success: true, data: verifications });
        } catch (error) {
            console.error('Error in getPendingVerifications:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // PUT /api/admin/verifications/:userId/status
    updateVerificationStatus: async (req, res) => {
        try {
            const { userId } = req.params;
            const { status } = req.body;
            
            if (!['verified', 'rejected'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }

            const updated = await adminService.updateVerificationStatus(userId, status, req.user.id);
            res.json({ success: true, data: updated, message: `Verification status updated to ${status}` });
        } catch (error) {
            console.error('Error in updateVerificationStatus:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = adminController;
