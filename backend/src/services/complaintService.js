const complaintRepository = require('../repositories/complaintRepository');
const adminRepository = require('../repositories/adminRepository'); // For system logging
const notificationService = require('./notificationService');

const complaintService = {
    // ---- USER ACTIONS ----
    submitComplaint: async (reporterId, payload) => {
        const { reportedUserId, reportedJobId, reason, description } = payload;
        
        if (!reason || !description) {
            throw new Error('Reason and description are required.');
        }

        return await complaintRepository.createComplaint({
            reporterId,
            reportedUserId,
            reportedJobId,
            reason,
            description
        });
    },

    // ---- ADMIN ACTIONS ----
    getAllComplaints: async () => {
        return await complaintRepository.getAllComplaints();
    },

    updateComplaintStatus: async (complaintId, status, adminNotes, adminId) => {
        const validStatuses = ['pending', 'resolved', 'dismissed'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status.');
        }

        const complaint = await complaintRepository.updateComplaintStatus(complaintId, status, adminNotes);
        
        // Log the admin action
        await adminRepository.createSystemLog(
            `COMPLAINT_${status.toUpperCase()}`,
            adminId,
            'complaint',
            complaintId,
            `Marked complaint ${complaintId} as ${status}. Notes: ${adminNotes || 'None'}`
        );

        // Notify the user who reported it
        if (complaint && complaint.reporter_id) {
            const formattedReason = complaint.reason.replace(/_/g, ' ');
            const message = `Your complaint regarding '${formattedReason}' has been marked as ${status}.${adminNotes ? ' Admin Feedback: ' + adminNotes : ''}`;
            
            await notificationService.createNotification(
                complaint.reporter_id,
                'COMPLAINT_UPDATE',
                message,
                complaintId
            );
        }

        return complaint;
    }
};

module.exports = complaintService;
