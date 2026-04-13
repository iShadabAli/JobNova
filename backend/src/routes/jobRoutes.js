const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const reviewController = require('../controllers/reviewController');
const { authenticateUser } = require('../middleware/authMiddleware'); // Assuming this exists

// Public-ish routes (Protected by login)
router.get('/', authenticateUser, jobController.getJobs);
router.get('/match', authenticateUser, jobController.getMatchedJobs); // New matching route
router.get('/nearby', authenticateUser, jobController.getNearbyJobs); // New map-based search
router.post('/', authenticateUser, jobController.createJob);
router.delete('/:id', authenticateUser, jobController.deleteJob);
router.post('/:id/apply', authenticateUser, jobController.applyForJob);

// Application Management
router.put('/applications/:id/status', authenticateUser, jobController.updateApplicationStatus);
router.get('/applications/my-applications', authenticateUser, jobController.getWorkerApplications);
router.get('/:id/applications', authenticateUser, jobController.getJobApplications);

// Employer specific
router.get('/my-jobs', authenticateUser, jobController.getMyJobs);

// Reviews
router.post('/reviews', authenticateUser, reviewController.createReview);
router.get('/reviews/:userId', authenticateUser, reviewController.getUserReviews);
router.get('/my-ratings', authenticateUser, reviewController.getMyRatings);

module.exports = router;
