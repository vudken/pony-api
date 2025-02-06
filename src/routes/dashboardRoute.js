const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const dashboardController = require('../controllers/dashboardController');
const { getStagesPage } = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/home', dashboardController.getHome);
router.get('/stages', dashboardController.getStages);
router.get('/calendar', dashboardController.getCalendar);

router.get("/stages/data", dashboardController.fetchStages);
router.post("/stages/add", express.json(), dashboardController.addStage);
router.delete("/stages/remove/:index", dashboardController.removeStage);




router.get('/profile', isAuthenticated, dashboardController.getProfile);

module.exports = router;