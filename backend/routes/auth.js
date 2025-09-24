const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rotas públicas 
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Rotas protegidas 
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.post('/logout', AuthController.logout);

module.exports = router;