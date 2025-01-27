const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/api/data', apiController.getApiData);

module.exports = router;
