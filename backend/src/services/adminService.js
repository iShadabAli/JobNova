const adminRepository = require('../repositories/adminRepository');

const adminService = {
    // ---- ANALYTICS ----
    getPlatformStats: async () => {
        return await adminRepository.getPlatformStats();
    },

    // ---- USER MANAGEMENT ----
    getAllUsers: async () => {
        return await adminRepository.getAllUsers();
    },

    toggleSuspendUser: async (userId, adminId) => {
        // Get current user state
        const users = await adminRepository.getAllUsers();
        const targetUser = users.find(u => u.id === userId);
        if (!targetUser) throw new Error('User not found');

        if (targetUser.role === 'admin') {
            throw new Error('Cannot suspend another admin');
        }

        let result;
        if (targetUser.is_suspended) {
            result = await adminRepository.unsuspendUser(userId);
            await adminRepository.createSystemLog(
                'USER_UNSUSPENDED',
                adminId,
                'user',
                userId,
                `Unsuspended user: ${targetUser.first_name} ${targetUser.last_name} (${targetUser.user_id})`
            );
        } else {
            result = await adminRepository.suspendUser(userId);
            await adminRepository.createSystemLog(
                'USER_SUSPENDED',
                adminId,
                'user',
                userId,
                `Suspended user: ${targetUser.first_name} ${targetUser.last_name} (${targetUser.user_id})`
            );
        }

        return result;
    },

    // ---- JOB MODERATION ----
    getAllJobs: async () => {
        return await adminRepository.getAllJobs();
    },

    deleteJob: async (jobId, adminId) => {
        const jobs = await adminRepository.getAllJobs();
        const targetJob = jobs.find(j => j.id === jobId);
        if (!targetJob) throw new Error('Job not found');

        await adminRepository.deleteJob(jobId);
        await adminRepository.createSystemLog(
            'JOB_DELETED',
            adminId,
            'job',
            jobId,
            `Deleted job: "${targetJob.title}" (type: ${targetJob.type})`
        );

        return true;
    },

    // ---- SYSTEM LOGS ----
    getSystemLogs: async () => {
        return await adminRepository.getSystemLogs();
    }
};

module.exports = adminService;
