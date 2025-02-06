const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/api/data', apiController.getApiData);
router.get("/api/stages", (req, res) => {
    res.json(stageService.getAllStages());
});

// // Add a new stage
// router.post("/api/stages", express.json(), (req, res) => {
//     const { name, duration, color } = req.body;
//     if (!name || !duration || isNaN(duration)) {
//         return res.status(400).json({ error: "Invalid stage data" });
//     }

//     const newStages = stageService.addStage({ name, duration, color });
//     res.json({ success: true, stages: newStages });
// });

// // Delete a stage
// router.delete("/api/stages/:index", (req, res) => {
//     const index = parseInt(req.params.index);
//     if (isNaN(index)) return res.status(400).json({ error: "Invalid index" });

//     const newStages = stageService.removeStage(index);
//     res.json({ success: true, stages: newStages });
// });


module.exports = router;
