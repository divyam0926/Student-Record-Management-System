/**
 * Auth Routes
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', AuthController.login);
router.get('/verify', verifyToken, AuthController.verify);

module.exports = router;