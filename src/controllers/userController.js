const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { fetchData } = require('../services/apiService');
const { isAuthenticated } = require('../middlewares/authMiddleware');

exports.getLoginPage = (req, res) => {
    const errorMessage = req.query.error || null;
    res.render('login', { title: 'Login', layout: false, errorMessage });
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.redirect('/login?error=User not found');
        }

        const isMatch = await user.comparePassword(password);

        if (isMatch) {
            req.session.user = { email: user.email };
            res.redirect('/home');
        } else {
            res.redirect('/login?error=Invalid credentials');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/login?error=Something went wrong');
    }
};

exports.getSignupPage = (req, res) => {
    const errorMessage = req.session.error || null;
    req.session.error = null; // Clear the error after retrieving it

    res.render('signup', { title: 'Signup', layout: false, errorMessage });
};

exports.signupUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email is already in use.');
            return res.redirect('/signup'); // Redirect back to the signup page
        }

        // Create a new user (password will be hashed automatically by pre('save'))
        const newUser = new userModel({ email, password });
        await newUser.save();

        req.flash('success', 'User registered successfully! Please log in.');
        res.redirect('/login'); // Redirect to login page after successful signup
    } catch (error) {
        console.error('Error during user signup:', error);

        // Handle duplicate key error explicitly (just in case)
        if (error.code === 11000) {
            req.flash('error', 'Email is already in use.');
            return res.redirect('/signup');
        }

        req.flash('error', 'An error occurred during signup. Please try again.');
        res.redirect('/signup');
    }
};

exports.getDashboard = (req, res) => {
    res.redirect('/home');
};
