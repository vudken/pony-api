const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/', (req, res) => res.redirect('/login'));

router.get('/login', userController.getLoginPage);
router.post('/login', userController.loginUser);

router.get('/signup', userController.getSignupPage);
router.post('/signup', userController.signupUser);
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.redirect('/profile'); // Redirect back in case of an issue
        }
        res.redirect('/login'); // Redirect to login after logout
    });
});

// router.get('/home',isAuthenticated, userController.getDashboard);

module.exports = router;