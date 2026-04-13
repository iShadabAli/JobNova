const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser: authMiddleware } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Routes
router.get('/profile', authMiddleware, authController.getProfile); // Kept for AuthContext compatibility

module.exports = router;
