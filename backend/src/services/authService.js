const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_123';

const authService = {
    registerUser: async ({ user_id, phone, password, role, first_name, last_name }) => {
        if (!user_id || !password || !role || !first_name || !last_name) {
            throw new Error('User ID, password, role, first name, and last name are required');
        }

        const VALID_ROLES = ['blue_collar', 'white_collar', 'employer', 'admin'];
        if (!VALID_ROLES.includes(role)) {
            throw new Error('Invalid role');
        }

        const existingUserId = await userRepository.findByUserId(user_id);
        if (existingUserId) {
            throw new Error('User ID already taken');
        }

        if (phone) {
            const existingPhone = await userRepository.findByPhone(phone);
            if (existingPhone) {
                throw new Error('Phone number already registered');
            }
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await userRepository.createUser({
            user_id,
            phone,
            password_hash: passwordHash,
            role,
            first_name,
            last_name
        });

        // Auto-create a profile so the user's name is immediately available
        try {
            const profileRepository = require('../repositories/profileRepository');
            await profileRepository.create(newUser.id, {
                full_name: `${first_name} ${last_name}`.trim()
            });
        } catch (profileErr) {
            console.error('Auto-create profile failed (non-fatal):', profileErr.message);
        }

        const token = jwt.sign(
            { id: newUser.id, role: newUser.role, user_id: newUser.user_id, phone: newUser.phone, first_name: newUser.first_name, last_name: newUser.last_name },
            JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return { user: newUser, token };
    },

    loginUser: async ({ identifier, password }) => {
        if (!identifier || !password) {
            throw new Error('User ID / Phone and password required');
        }

        // Identifier could be user_id or phone
        let user = await userRepository.findByPhone(identifier);
        if (!user) {
            user = await userRepository.findByUserId(identifier);
        }

        if (!user) {
            throw new Error('Invalid credentials');
        }

        if (!user.password_hash) {
            throw new Error('Invalid credentials - Please register a password');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Check if account is suspended
        if (user.is_suspended) {
            throw new Error('Your account has been suspended. Please contact the administrator.');
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, user_id: user.user_id, phone: user.phone, first_name: user.first_name, last_name: user.last_name },
            JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        const { password_hash, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    },

    getProfile: async (id) => {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
};

module.exports = authService;
