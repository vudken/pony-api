const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const dashboardController = require('../controllers/dashboardController');
const { getStagesPage } = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/home', dashboardController.getHome2);
router.get('/stages', dashboardController.getStages);
router.get('/calendar', dashboardController.getCalendar);

router.get("/stages/data", dashboardController.fetchStages);
router.post("/stages/add", express.json(), dashboardController.addStage);
router.delete("/stages/remove/:id", dashboardController.removeStage);
router.delete("/stages/remove-all", dashboardController.removeAllStages);
// router.post("/stages/reorder", express.json(), dashboardController.reorderStages);
router.put("/stages/reorder", dashboardController.reorderStages);
router.post("/stages/set-start-date", dashboardController.setStartDate); 




router.get('/profile', isAuthenticated, dashboardController.getProfile);

module.exports = router;