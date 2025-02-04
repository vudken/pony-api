const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/home', async (req, res) => {
    try {
        const data = await apiController.getApiData();
        // const data = [
        //     { name: 'Tank 1', ph: 6.5, ec: 1.2, description: 'Main tank' },
        //     { name: 'Tank 2', ph: 'invalid', ec: null, description: 'Backup tank' },
        // ];

        const validatedData = data.map(item => ({
            ...item,
            ph: item.ph == "N/A" ? item.ph : parseFloat(item.ph),
            ec: item.ec == "N/A" ? item.ec : parseFloat(item.ec),
        }));

        res.render('dashboard', { section: 'home', data: validatedData });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.render('dashboard', { section: 'home', data: [] });
    }
});

router.get('/statistics', (req, res) => {
    res.render('dashboard', { section: 'statistics' });
});

router.get('/admin', (req, res) => {
    res.render('dashboard', { section: 'admin' });
});

router.get('/stages', (req, res) => {
    res.render('dashboard', { section: 'stages' });
});

router.get('/calendar', (req, res) => {
    res.render('dashboard', { section: 'calendar' });
});

router.get('/profile', isAuthenticated, (req, res) => {
    console.log('Profile page accessed by:', req.user);
    res.render('dashboard', { section: 'profile', data: [] });
});

// router.post('/profile/update', isAuthenticated, (req, res) => {
//     console.log("Profile Updated:", req.body);
//     res.redirect('/profile'); // Redirect back after saving
// });

module.exports = router;
