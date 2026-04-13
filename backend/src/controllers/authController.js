const authService = require('../services/authService');

const authController = {
    // Register: User ID + Phone + Password + Role + Names
    register: async (req, res) => {
        try {
            const { user_id, phone, password, role, first_name, last_name } = req.body;

            const { user, token } = await authService.registerUser({
                user_id, phone, password, role, first_name, last_name
            });

            res.status(201).json({
                success: true,
                data: { user, token },
                message: 'Registration successful'
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // Login: User ID / Phone + Password
    login: async (req, res) => {
        try {
            const { identifier, password } = req.body; // identifier can be user_id or phone

            const { user, token } = await authService.loginUser({ identifier, password });

            res.json({
                success: true,
                data: { user, token },
                message: 'Login successful'
            });

        } catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    },

    // Get Profile (Protected)
    getProfile: async (req, res) => {
        try {
            // Usually req.user is populated by an authMiddleware
            const { user } = req;
            res.json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = authController;
