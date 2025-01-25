const express = require('express');
const { fetchData } = require('../services/dataService');
const router = express.Router();

// Endpoint to handle login
router.post('/', (req, res) => {
    const { username, password } = req.body;
    const users = {
        user1: 'password1',
        user2: 'password2'
    };

    if (users[username] && users[username] === password) {
        req.session.user = username;
        res.redirect('/api/data'); // Redirect to /data endpoint
    } else {
        res.status(401).send('Login failed');
    }
});

// Endpoint to fetch data
router.get('/data', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const result = await fetchData();
        res.json(result);
    } catch (error) {
        res.status(500).send('Error fetching data');
    }
});

// Endpoint to serve data.html
router.get('/data-page', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }

    res.sendFile(path.join(__dirname, '../../public/data.html'));
});

router.get('/check-auth', (req, res) => {
    res.json({ authenticated: !!req.session.user });
});

module.exports = router;