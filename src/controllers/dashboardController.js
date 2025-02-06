const fs = require("fs");
const path = require("path");
const apiController = require("./apiController");
const stagesPath = path.join(__dirname, "../services/stages.json");
const { STAGE_COLORS } = require("../config/constants");

// 🔄 Helper Function: Load Stages
const getStagesJSON = () => {
    try {
        if (!fs.existsSync(stagesPath)) {
            fs.writeFileSync(stagesPath, "[]", "utf-8");
        }
        const data = fs.readFileSync(stagesPath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading stages.json:", error);
        return [];
    }
};

// 🔄 Helper Function: Save Stages
const saveStagesJSON = (stages) => {
    try {
        fs.writeFileSync(stagesPath, JSON.stringify(stages, null, 2), "utf-8");
    } catch (error) {
        console.error("Error saving stages.json:", error);
    }
};

// 🏠 Home Page Controller
// exports.getHome = async (req, res) => {
//     try {
//         const data = await apiController.getApiData();

//         const validatedData = data.map(item => ({
//             ...item,
//             ph: item.ph === "N/A" ? item.ph : parseFloat(item.ph).toFixed(2),
//             ec: item.ec === "N/A" ? item.ec : parseFloat(item.ec).toFixed(2),
//         }));

//         res.render('partials/home', { layout: 'layout', title: 'Home', data: validatedData });
//     } catch (error) {
//         console.error('Error fetching data:', error.message);
//         res.render('partials/home', { layout: 'layout', title: 'Home', data: [] });
//     }
// };
const moment = require("moment");
exports.getHome = async (req, res) => {
    try {
        const data = await apiController.getApiData();
        const stages = getStagesJSON(); // Load stages from JSON
        const today = moment(); // Get today's date
        let startDate = moment("2025-02-01"); // Define the starting date

        // Map each stage to its corresponding date range
        const stageTimeline = stages.map(stage => {
            const endDate = startDate.clone().add(stage.duration - 1, "days");
            const stageData = {
                name: stage.name,
                color: stage.color,
                start: startDate.clone(),
                end: endDate.clone()
            };
            startDate = endDate.clone().add(1, "day"); // Move to the next stage
            return stageData;
        });

        // Determine the current stage
        const currentStageIndex = stageTimeline.findIndex(stage =>
            today.isBetween(stage.start, stage.end, null, "[]")
        );

        let daysUntilNext = "--";
        let nextStageName = "Unknown";

        if (currentStageIndex !== -1 && currentStageIndex < stageTimeline.length - 1) {
            const nextStage = stageTimeline[currentStageIndex + 1];
            daysUntilNext = nextStage.start.diff(today, "days"); // Calculate days left
            nextStageName = nextStage.name;
        }

        // Assign the current stage and days until the next stage to each fertilizer tank
        const validatedData = data.map(item => ({
            ...item,
            ph: item.ph === "N/A" ? item.ph : parseFloat(item.ph).toFixed(2),
            ec: item.ec === "N/A" ? item.ec : parseFloat(item.ec).toFixed(2),
            stage: currentStageIndex !== -1 ? stageTimeline[currentStageIndex] : { name: "Unknown", color: "#6c757d" },
            description: `Next stage: ${nextStageName} in ${daysUntilNext} days`
        }));

        res.render("partials/home", { layout: "layout", title: "Home", data: validatedData });
    } catch (error) {
        console.error("Error fetching data:", error.message);
        res.render("partials/home", { layout: "layout", title: "Home", data: [] });
    }
};



// 📅 Calendar Page Controller
exports.getCalendar = (req, res) => {
    try {
        const stages = getStagesJSON();
        res.render("partials/calendar", { layout: "layout", title: "Calendar", stages });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error loading calendar");
    }
};

// 🔄 Stages Page Controller
exports.getStages = (req, res) => {
    try {
        const stages = getStagesJSON();
        res.render("partials/stages", { layout: "layout", title: "Stages", stages, colors: STAGE_COLORS });
    } catch (error) {
        console.error("Error loading stages:", error);
        res.status(500).send("Error loading stages");
    }
};

// 👤 Profile Page Controller
exports.getProfile = (req, res) => {
    try {
        console.log('Profile page accessed by:', req.user);
        res.render('partials/profile', { layout: 'layout', title: 'Profile', data: [] });
    } catch (error) {
        console.log(error);
    }
};

// ✅ API-Like Route: Fetch Stages Data
exports.fetchStages = (req, res) => {
    try {
        const stages = getStagesJSON();
        res.json(stages);
    } catch (error) {
        console.error("Error fetching stages:", error);
        res.status(500).json({ error: "Failed to fetch stages" });
    }
};

// exports.addStage = (req, res) => {
//     try {
//         const { name, duration, color } = req.body;
//         if (!name || !duration || isNaN(duration)) {
//             return res.status(400).json({ error: "Invalid stage data" });
//         }

//         let stages = getStagesJSON();
//         stages.push({ name, duration, color });
//         saveStagesJSON(stages);

//         res.json({ success: true, stages });
//     } catch (error) {
//         console.error("Error adding stage:", error);
//         res.status(500).json({ error: "Failed to add stage" });
//     }
// };

// ✅ API-Like Route: Add New Stage
// ✅ API-Like Route: Add New Stage
exports.addStage = (req, res) => {
    try {
        const { name, duration, color } = req.body;

        // Validate Inputs
        if (!name || !duration || isNaN(duration) || !/^#[0-9A-F]{6}$/i.test(color)) {
            return res.status(400).json({ error: "Invalid stage data" });
        }

        let stages = getStagesJSON();
        stages.push({ name, duration, color });
        saveStagesJSON(stages);

        res.json({ success: true, stages });
    } catch (error) {
        console.error("Error adding stage:", error);
        res.status(500).json({ error: "Failed to add stage" });
    }
};


// ✅ API-Like Route: Delete Stage
exports.removeStage = (req, res) => {
    try {
        const index = parseInt(req.params.index);
        if (isNaN(index)) return res.status(400).json({ error: "Invalid index" });

        let stages = getStagesJSON();

        // ✅ Ensure index exists before removing
        if (index < 0 || index >= stages.length) {
            return res.status(404).json({ error: "Stage not found" });
        }

        stages.splice(index, 1);  // ✅ Remove the stage from array
        saveStagesJSON(stages);   // ✅ Save updated stages.json

        res.json({ success: true, stages });
    } catch (error) {
        console.error("Error removing stage:", error);
        res.status(500).json({ error: "Failed to delete stage" });
    }
};

exports.removeAllStages = (req, res) => {
    try {
        saveStagesJSON([]); // Clears the JSON file
        res.json({ success: true, message: "All stages removed successfully!" });
    } catch (error) {
        console.error("Error removing all stages:", error);
        res.status(500).json({ error: "Failed to remove all stages" });
    }
};



exports.reorderStages = (req, res) => {
    try {
        const { oldIndex, newIndex } = req.body;
        let stages = getStagesJSON();

        if (oldIndex < 0 || newIndex < 0 || oldIndex >= stages.length || newIndex >= stages.length) {
            return res.status(400).json({ error: "Invalid indices" });
        }

        // Move the stage in the array
        const [movedStage] = stages.splice(oldIndex, 1);
        stages.splice(newIndex, 0, movedStage);

        saveStagesJSON(stages);
        res.json({ success: true, stages });
    } catch (error) {
        console.error("Error reordering stages:", error);
        res.status(500).json({ error: "Failed to reorder stages" });
    }
};
