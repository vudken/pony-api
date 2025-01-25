const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Login Routes
router.get('/login', userController.getLoginPage);
router.post('/login', userController.loginUser);

// Signup Routes
router.get('/signup', userController.getSignupPage);
router.post('/signup', userController.signupUser);

// Dashboard Route
router.get('/dashboard', userController.getDashboard);

module.exports = router;
