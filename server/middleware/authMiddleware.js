/**
 * Authentication Middleware
 * Validates JWT Bearer tokens for protected endpoints
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_mca_dsa_jwt_key_2026';

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ?
        authHeader.split(' ')[1] :
        req.query.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No authentication token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.'
        });
    }
}

module.exports = {
    verifyToken,
    JWT_SECRET
};