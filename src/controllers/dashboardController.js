const fs = require("fs");
const path = require("path");
const apiController = require("./apiController");
const stagesPath = path.join(__dirname, "../services/stages.json");
const { STAGE_COLORS } = require("../config/constants");
const Stage = require("../models/stageModel");

// 🔄 Helper Function: Load Stages
// const getStagesJSON = async () => {
//     // try {
//     //     if (!fs.existsSync(stagesPath)) {
//     //         fs.writeFileSync(stagesPath, "[]", "utf-8");
//     //     }
//     //     const data = fs.readFileSync(stagesPath, "utf8");
//     //     return JSON.parse(data);
//     // } catch (error) {
//     //     console.error("Error reading stages.json:", error);
//     //     return [];
//     // }
//     // try {
//     //     const stages = await Stage.find({}, "name duration color pumps"); // ✅ Fetch only required fields

//     //     // ✅ Convert MongoDB format to simplified format (removes `_id`, `createdAt`, etc.)
//     //     const data = stages.map(stage => ({
//     //         name: stage.name,
//     //         duration: stage.duration,
//     //         color: stage.color
//     //     }));
//     //     console.log(data);
//     //     return JSON.parse(data);
//     // } catch (error) {
//     //     console.error("Error fetching stages from MongoDB:", error);
//     //     return []; // ✅ Return empty array on error
//     // }
//     try {
//         const stages = await Stage.find({}, "name duration color pumps"); // ✅ Fetch only required fields

//         // ✅ Convert MongoDB format to simplified format
//         const data = stages.map(stage => ({
//             name: stage.name,
//             duration: stage.duration,
//             color: stage.color
//         }));

//         console.log("Fetched Stages:", data); // ✅ Debugging output
//         return data; // ✅ No need for JSON.parse() here
//     } catch (error) {
//         console.error("Error fetching stages from MongoDB:", error);
//         return []; // ✅ Return empty array on error
//     }
// };

const getStagesJSON = async () => {
    try {
        const stages = await Stage.find({}, "name duration color"); // ✅ Fetch only required fields

        if (!Array.isArray(stages)) {
            console.error("Error: MongoDB query did not return an array", stages);
            return [];
        }

        return stages.map(stage => ({
            id: stage._id,
            name: stage.name,
            duration: stage.duration,
            color: stage.color,
            pumps: {
                pumpA: stage.pumps.pumpA,
                pumpB: stage.pumps.pumpB,
                pumpC: stage.pumps.pumpC
            }
        }));
    } catch (error) {
        console.error("Error fetching stages from MongoDB:", error);
        return []; // ✅ Return empty array on error
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
        const startDate = moment("2025-02-01"); // Define the start date

        let elapsedDays = today.diff(startDate, "days"); // Total days passed
        let cumulativeDays = 0;
        let currentStage = { name: "Unknown", color: "#6c757d" };
        let nextStage = null;
        let daysLeft = "--";

        for (let i = 0; i < stages.length; i++) {
            if (elapsedDays < cumulativeDays + stages[i].duration) {
                // ✅ Found current stage
                currentStage = {
                    name: stages[i].name,
                    color: stages[i].color,
                };

                // ✅ Calculate days left
                daysLeft = (cumulativeDays + stages[i].duration) - elapsedDays;

                // ✅ Assign next stage **only if it's NOT the last stage**
                if (i + 1 < stages.length) {
                    nextStage = stages[i + 1];
                } else {
                    nextStage = null; // No next stage exists
                }
                break;
            }
            cumulativeDays += stages[i].duration;
        }

        // ✅ Proper fallback for last stage
        let nextStageText = nextStage ? `${nextStage.name} in ${daysLeft} days` : "No upcoming stages";

        // ✅ Assign data to the fertilizer tank
        const validatedData = data.map(item => ({
            ...item,
            ph: item.ph === "N/A" ? item.ph : parseFloat(item.ph).toFixed(2),
            ec: item.ec === "N/A" ? item.ec : parseFloat(item.ec).toFixed(2),
            stage: currentStage,
            description: `Next stage: ${nextStageText}`
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
exports.getStages = async (req, res) => {
    try {
        // const stages = getStagesJSON();
        const stages = await getStagesJSON();

        res.render("partials/stages", { layout: "layout", title: "Stages", stages, colors: STAGE_COLORS });
    } catch (error) {
        console.error("Error loading stages:", error);
        res.status(500).send("Error loading stages");
    }

    // try {
    //     const stages = await getStagesJSON(); // ✅ Ensure we properly await data

    //     console.log("Fetched Stages:", stages); // ✅ Debugging output
    //     if (!Array.isArray(stages)) {
    //         console.error("Error: Fetched stages is not an array", stages);
    //         return res.status(500).json({ error: "Failed to fetch stages" });
    //     }

    //     res.render("partials/stages", { stages }); // ✅ Ensure stages is passed correctly
    // } catch (error) {
    //     console.error("Error fetching stages:", error);
    //     res.status(500).json({ error: "Failed to fetch stages" });
    // }

    // try {
    //     const stages = await getStagesJSON(); // ✅ Fetch transformed stage data

    //     const colors = ["#ffc107", "#6610f2", "#e83e8c", "#17a2b8", "#28a745"]; // ✅ Define color options

    //     res.render("partials/stages", { stages, colors }); // ✅ Pass colors to EJS template
    // } catch (error) {
    //     console.error("Error fetching stages:", error);
    //     res.status(500).json({ error: "Failed to fetch stages" });
    // }
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
exports.fetchStages = async (req, res) => {
    // try {
    //     const stages = getStagesJSON();
    //     res.json(stages);
    // } catch (error) {
    //     console.error("Error fetching stages:", error);
    //     res.status(500).json({ error: "Failed to fetch stages" });
    // }
    try {
        const stages = await Stage.find({}); // ✅ Fetch all stages from MongoDB
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
exports.addStage = async (req, res) => {
    // try {
    //     const { name, duration, color } = req.body;

    //     // Validate Inputs
    //     if (!name || !duration || isNaN(duration) || !/^#[0-9A-F]{6}$/i.test(color)) {
    //         return res.status(400).json({ error: "Invalid stage data" });
    //     }

    //     let stages = getStagesJSON();
    //     stages.push({ name, duration, color });
    //     saveStagesJSON(stages);

    //     res.json({ success: true, stages });
    // } catch (error) {
    //     console.error("Error adding stage:", error);
    //     res.status(500).json({ error: "Failed to add stage" });
    // }
    try {
        const { name, duration, color, pumps } = req.body;

        // Basic validation
        if (!name || !duration || isNaN(duration) || !/^#[0-9A-F]{6}$/i.test(color)) {
            return res.status(400).json({ error: "Invalid stage data" });
        }

        const parsedPumps = {
            pumpA: Number(pumps.pumpA) || 0,
            pumpB: Number(pumps.pumpB) || 0,
            pumpC: Number(pumps.pumpC) || 0
        };
        
        const newStage = new Stage({ name, duration, color, pumps: parsedPumps });

        await newStage.save();
        res.status(201).json({ success: true, stage: newStage });
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
