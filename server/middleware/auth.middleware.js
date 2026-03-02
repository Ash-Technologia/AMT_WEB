const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Protect routes — verifies JWT token
 */
const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not found.' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
    }
};

/**
 * Admin-only route guard
 */
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
};

/**
 * Optional auth — attaches user if token present, but doesn't block
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        }
    } catch (_) {
        // silently ignore
    }
    next();
};

module.exports = { protect, adminOnly, optionalAuth };
