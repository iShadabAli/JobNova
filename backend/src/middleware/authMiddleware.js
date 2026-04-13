const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_123';

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Contains id, role, phone
        next();
    } catch (e) {
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
};

module.exports = { authenticateUser: authMiddleware, requireAdmin };
