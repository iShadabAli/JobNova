const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticateUser } = require('../middleware/authMiddleware');

// User route for submitting complaints
router.post('/', authenticateUser, complaintController.submitComplaint);

module.exports = router;
