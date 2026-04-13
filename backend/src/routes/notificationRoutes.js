const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Get all notifications for current user
router.get('/', authenticateUser, notificationController.getUserNotifications);

// Mark specific notification read
router.put('/:id/read', authenticateUser, notificationController.markAsRead);

// Mark all notifications read
router.put('/read-all', authenticateUser, notificationController.markAllAsRead);

// Get application context for actionable notification
router.get('/application-context/:applicationId', authenticateUser, notificationController.getApplicationContext);

module.exports = router;
