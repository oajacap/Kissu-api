const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/profile', authenticateToken, AuthController.getProfile);

module.exports = router;