const userModel = require('../models/userModel');

// GET login page
exports.getLoginPage = (req, res) => {
    const errorMessage = req.query.error || null; // Example: Get error from query param
    res.render('login', { errorMessage });
};

// POST login data
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (user && user.password === password) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login?error=Invalid credentials');
    }
};

// GET signup page
exports.getSignupPage = (req, res) => {
    res.render('signup', { title: 'Signup' }); // Renders signup.ejs or signup.html
};

// POST signup data
exports.signupUser = async (req, res) => {
    const newUser = new userModel(req.body);
    await newUser.save();
    res.send('Signup successful!');
};

// GET dashboard
exports.getDashboard = (req, res) => {
    res.send('<h1>Welcome to the Dashboard!</h1>'); // Simple success page
};
