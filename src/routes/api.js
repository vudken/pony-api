const express = require('express');
const { fetchData } = require('../services/dataService');
const router = express.Router();

router.get('/data', async (req, res) => {
    try {
        const result = await fetchData();
        res.json(result);
    } catch (error) {
        res.status(500).send('Error fetching data');
    }
});

module.exports = router;
