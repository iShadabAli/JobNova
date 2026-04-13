const complaintService = require('../services/complaintService');

const complaintController = {
    // POST /api/complaints
    submitComplaint: async (req, res) => {
        try {
            const reporterId = req.user.id;
            const complaint = await complaintService.submitComplaint(reporterId, req.body);
            res.status(201).json({ success: true, data: complaint, message: 'Complaint submitted successfully.' });
        } catch (error) {
            console.error('Error in submitComplaint:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // GET /api/admin/complaints (Admin Route)
    getAllComplaints: async (req, res) => {
        try {
            const complaints = await complaintService.getAllComplaints();
            res.json({ success: true, data: complaints });
        } catch (error) {
            console.error('Error in getAllComplaints:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // PUT /api/admin/complaints/:id/status (Admin Route)
    updateComplaintStatus: async (req, res) => {
        try {
            const { status, adminNotes } = req.body;
            const complaint = await complaintService.updateComplaintStatus(req.params.id, status, adminNotes, req.user.id);
            res.json({ success: true, data: complaint, message: `Complaint marked as ${status}.` });
        } catch (error) {
            console.error('Error in updateComplaintStatus:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }
};

module.exports = complaintController;
