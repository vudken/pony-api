const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/api/data', apiController.getApiData);
router.get('/api/events', (req, res) => {
    const events = [
        { title: "Meeting", start: "2025-02-10" },
        { title: "Project Deadline", start: "2025-02-15" },
        { title: "Holiday", start: "2025-02-20" }
    ];
    res.json(events);
});

module.exports = router;
