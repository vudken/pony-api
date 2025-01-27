const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/', (req, res) => res.redirect('/login'));

router.get('/login', userController.getLoginPage);
router.post('/login', userController.loginUser);

router.get('/signup', userController.getSignupPage);
router.post('/signup', userController.signupUser);

router.get('/dashboard', userController.getDashboard);

module.exports = router;