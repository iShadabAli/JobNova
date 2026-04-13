const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes require authentication + admin role
router.use(authenticateUser);
router.use(requireAdmin);

// Analytics
router.get('/stats', adminController.getStats);

// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:id/suspend', adminController.toggleSuspend);

// Job Moderation
router.get('/jobs', adminController.getJobs);
router.delete('/jobs/:id', adminController.deleteJob);

// System Logs
router.get('/logs', adminController.getLogs);

// Complaints Moderation
const complaintController = require('../controllers/complaintController');
router.get('/complaints', complaintController.getAllComplaints);
router.put('/complaints/:id/status', complaintController.updateComplaintStatus);

// Verifications
router.get('/verifications/pending', adminController.getPendingVerifications);
router.put('/verifications/:userId/status', adminController.updateVerificationStatus);

module.exports = router;
