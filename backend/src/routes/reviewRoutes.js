const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateUser } = require('../middleware/authMiddleware');

// @route   POST /api/reviews
// @desc    Submit a review for a completed job
// @access  Private (Employer or Worker)
router.post('/', authenticateUser, reviewController.createReview);

// @route   GET /api/reviews/me
// @desc    Get reviews given to the currently logged in user
// @access  Private
router.get('/me', authenticateUser, reviewController.getMyRatings);

// @route   GET /api/reviews/user/:userId
// @desc    Get reviews for a specific user ID
// @access  Public or Private (depending on requirements, keeping private for safety)
router.get('/user/:userId', authenticateUser, reviewController.getUserReviews);

module.exports = router;
