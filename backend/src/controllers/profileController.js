const profileService = require('../services/profileService');

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await profileService.getProfile(userId);
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;
        console.log(`[updateProfile] Received updates for user ${userId}:`, updates);

        const updatedProfile = await profileService.updateProfile(userId, updates);

        res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfile });
    } catch (error) {
        console.error("Profile update catch block error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.uploadCV = async (req, res) => {
    try {
        const userId = req.user.id;
        const file = req.file;

        const { resumeUrl, parsedData } = await profileService.uploadCV(userId, file);

        res.status(200).json({
            message: 'CV uploaded successfully',
            resume_url: resumeUrl,
            parsedData
        });
    } catch (error) {
        console.error("Upload CV error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        const file = req.file;

        const avatarUrl = await profileService.uploadAvatar(userId, file);

        res.status(200).json({
            message: 'Avatar uploaded successfully',
            avatar_url: avatarUrl
        });
    } catch (error) {
        console.error("Upload Avatar error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getHiringHistory = async (req, res) => {
    try {
        const employerId = req.user.id;

        const history = await profileService.getHiringHistory(employerId);
        res.status(200).json(history);
    } catch (error) {
        console.error("Hiring history error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getPublicProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const data = await profileService.getPublicProfile(userId);
        res.status(200).json(data);
    } catch (error) {
        console.error("Public profile error:", error);
        res.status(500).json({ error: error.message });
    }
};
