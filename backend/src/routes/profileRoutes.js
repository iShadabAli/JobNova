const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateUser } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Configure multer specifically for images
const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

// Public profile route (authenticated users only but any user can view any profile)
router.get('/public/:userId', authenticateUser, profileController.getPublicProfile);

// All routes below are protected
router.use(authenticateUser);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

// New Routes for Module 5
router.post('/upload-cv', upload.single('cv'), profileController.uploadCV);
router.post('/upload-avatar', uploadImage.single('avatar'), profileController.uploadAvatar);
router.post('/upload-verification', upload.single('document'), profileController.uploadVerificationDocument);
router.get('/hiring-history', profileController.getHiringHistory);

module.exports = router;
