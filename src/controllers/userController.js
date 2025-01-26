const userModel = require('../models/userModel');
const { fetchData } = require('../services/apiService');
const { isAuthenticated } = require('../middlewares/authMiddleware');

exports.getLoginPage = (req, res) => {
    const errorMessage = req.query.error || null;
    res.render('login', { errorMessage });
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
            req.session.user = { email: user.email }; // Log the user in
            res.redirect('/dashboard'); // Redirect immediately to dashboard
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

    res.render('signup', { errorMessage });
};

exports.signupUser = async (req, res) => {
    const newUser = new userModel(req.body);
    await newUser.save();
    res.send('Signup successful!');
};

exports.getDashboard = async (req, res) => {
    // try {
    // const data = await fetchData(); // Try fetching data
    res.render('dashboard'); // Pass data and null error
    // } catch (error) {
    //     console.error('Error fetching data:', error.message);
    //     res.render('dashboard', { data: [], error: 'Failed to fetch data. Please try again later.' }); // Pass empty data and error message
    // }
};
