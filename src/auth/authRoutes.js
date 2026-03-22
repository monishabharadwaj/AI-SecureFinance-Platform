const express = require('express');
const router = express.Router();
const authController = require('./authController');
const verifyToken = require('../middleware/jwtMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/me', verifyToken, authController.getMe);

module.exports = router;