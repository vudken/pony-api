const fs = require("fs");
const path = require("path");
const apiController = require("./apiController");
const stagesPath = path.join(__dirname, "../services/stages.json");
const { STAGE_COLORS } = require("../config/constants");
const Stage = require("../models/stageModel");
const mongoose = require("mongoose");

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
        const stages = await Stage.find({ active: true }).sort({ position: 1 });

        if (!Array.isArray(stages)) {
            console.error("Error: MongoDB query did not return an array", stages);
            return [];
        }

        return stages.map(stage => ({
            id: stage._id.toString(),
            name: stage.name,
            duration: stage.duration,
            color: stage.color,
            pumps: {
                pumpA: stage.pumps.pumpA,
                pumpB: stage.pumps.pumpB,
                pumpC: stage.pumps.pumpC
            },
            position: stage.position,
            active: stage.active,
            startDate: stage.startDate
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
        const data = await apiController.getApiData(); // Fetch data from API
        // const stages = getStagesJSON(); // Load stages from JSON
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

exports.getHome2 = async (req, res) => {
    try {
        res.render("partials/home", { layout: "layout", title: "Home", data: null }); // 🚀 Send the page with no data first
    } catch (error) {
        console.error("Error rendering home page:", error.message);
        res.render("partials/home", { layout: "layout", title: "Home", data: null });
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
        const stages = await Stage.find({ active: true }).sort({ position: 1 }); // ✅ Only active stages
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





    /* try {
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
    } */



    try {
        const { name, duration, color, pumps } = req.body;

        if (!name || !duration || isNaN(duration) || !/^#[0-9A-F]{6}$/i.test(color)) {
            return res.status(400).json({ error: "Invalid stage data" });
        }

        // ✅ Find the highest position in the database
        const lastStage = await Stage.findOne({}, {}, { sort: { position: -1 } });

        // ✅ Assign position dynamically (increment last position)
        const newPosition = lastStage ? lastStage.position + 1 : 1;

        const newStage = new Stage({
            name,
            duration,
            color,
            pumps,
            position: newPosition,  // ✅ No duplicate positions
            active: true  // ✅ Ensure it's active
        });

        await newStage.save();
        res.json({ success: true, stage: newStage });
    } catch (error) {
        console.error("Error adding stage:", error);
        res.status(500).json({ error: "Failed to add stage" });
    }
};


// ✅ API-Like Route: Delete Stage
exports.removeStage = async (req, res) => {
    // const id = parseInt(req.params.id);
    // console.log(id);

    // try {
    //     const index = parseInt(req.params.index);
    //     if (isNaN(index)) return res.status(400).json({ error: "Invalid index" });

    //     let stages = getStagesJSON();

    //     // ✅ Ensure index exists before removing
    //     if (index < 0 || index >= stages.length) {
    //         return res.status(404).json({ error: "Stage not found" });
    //     }

    //     stages.splice(index, 1);  // ✅ Remove the stage from array
    //     saveStagesJSON(stages);   // ✅ Save updated stages.json

    //     res.json({ success: true, stages });
    // } catch (error) {
    //     console.error("Error removing stage:", error);
    //     res.status(500).json({ error: "Failed to delete stage" });
    // }


    // console.log("I GOT HERE");

    // try {
    //     const { id } = req.params;
    //     console.log("Received ID for deletion:", id); // ✅ Debugging output

    //     if (!id) {
    //         return res.status(400).json({ error: "Stage ID is missing in request" });
    //     }

    //     if (!mongoose.Types.ObjectId.isValid(id)) {
    //         return res.status(400).json({ error: "Invalid MongoDB ObjectId" });
    //     }

    //     const deletedStage = await Stage.findByIdAndDelete(id);
    //     if (!deletedStage) {
    //         return res.status(404).json({ error: "Stage not found in database" });
    //     }

    //     res.json({ success: true, message: "Stage removed successfully!" });
    // } catch (error) {
    //     console.error("Error removing stage:", error);
    //     res.status(500).json({ error: "Failed to delete stage" });
    // }

    try {
        const stageId = req.params.id;
        const stage = await Stage.findById(stageId);

        if (!stage) {
            return res.status(404).json({ error: "Stage not found" });
        }

        // ✅ Instead of deleting, just mark it as inactive
        stage.active = false;
        await stage.save();

        res.json({ success: true, message: "Stage deactivated successfully!" });
    } catch (error) {
        console.error("Error deactivating stage:", error);
        res.status(500).json({ error: "Failed to deactivate stage" });
    }

};

exports.removeAllStages = async (req, res) => {
    // try {
    //     saveStagesJSON([]); // Clears the JSON file
    //     res.json({ success: true, message: "All stages removed successfully!" });
    // } catch (error) {
    //     console.error("Error removing all stages:", error);
    //     res.status(500).json({ error: "Failed to remove all stages" });
    // }

    try {
        await Stage.updateMany({}, { active: false }); // ✅ Soft delete all stages
        res.json({ success: true, message: "All stages deactivated successfully!" });
    } catch (error) {
        console.error("Error deactivating all stages:", error);
        res.status(500).json({ error: "Failed to deactivate all stages" });
    }
};



exports.reorderStages = async (req, res) => {
    // try {
    //     const { oldIndex, newIndex } = req.body;
    //     let stages = getStagesJSON();

    //     if (oldIndex < 0 || newIndex < 0 || oldIndex >= stages.length || newIndex >= stages.length) {
    //         return res.status(400).json({ error: "Invalid indices" });
    //     }

    //     // Move the stage in the array
    //     const [movedStage] = stages.splice(oldIndex, 1);
    //     stages.splice(newIndex, 0, movedStage);

    //     saveStagesJSON(stages);
    //     res.json({ success: true, stages });
    // } catch (error) {
    //     console.error("Error reordering stages:", error);
    //     res.status(500).json({ error: "Failed to reorder stages" });
    // }

    exports.reorderStages = async (req, res) => {
        try {
            const { fromPosition, toPosition } = req.body;

            if (fromPosition === undefined || toPosition === undefined) {
                return res.status(400).json({ error: "Positions are required" });
            }

            // ✅ Find the two stages
            const fromStage = await Stage.findOne({ position: fromPosition });
            const toStage = await Stage.findOne({ position: toPosition });

            if (!fromStage || !toStage) {
                return res.status(404).json({ error: "One or both positions not found" });
            }

            // ✅ Swap positions
            await Stage.updateOne({ _id: fromStage._id }, { position: toPosition });
            await Stage.updateOne({ _id: toStage._id }, { position: fromPosition });

            res.json({ success: true, message: "Stages swapped successfully" });
        } catch (error) {
            console.error("Error swapping stages:", error);
            res.status(500).json({ error: "Failed to swap stages" });
        }
    };
};


// exports.setStartDate = async (req, res) => {
//     try {
//         const { startDate } = req.body;
//         if (!startDate) {
//             return res.status(400).json({ error: "Start date is required" });
//         }

//         // ✅ Convert start date to moment.js format
//         const moment = require("moment");
//         const newStartDate = moment(startDate, "YYYY-MM-DD");

//         // ✅ Get all stages sorted by position
//         let stages = await Stage.find().sort({ position: 1 });

//         // ✅ Update each stage with a new calculated start date
//         let cumulativeDays = 0;
//         for (let stage of stages) {
//             stage.startDate = newStartDate.clone().add(cumulativeDays, "days").format("YYYY-MM-DD");
//             cumulativeDays += stage.duration;
//             await stage.save();
//         }

//         res.json({ success: true, message: "Start date updated and stages recalculated" });

//     } catch (error) {
//         console.error("Error updating start date:", error);
//         res.status(500).json({ error: "Failed to update start date" });
//     }
// };

// ✅ Get the current start date
exports.startDate = async (req, res) => {
    try {
        let startDateRecord = await StartDate.findOne();
        if (!startDateRecord) {
            startDateRecord = new StartDate({ startDate: "2025-02-01" });
            await startDateRecord.save();
        }
        res.json({ startDate: startDateRecord.startDate });
    } catch (error) {
        console.error("Error fetching start date:", error);
        res.status(500).json({ error: "Failed to fetch start date" });
    }
};

// ✅ Update the start date
exports.setStartDate = async (req, res) => {
    try {
        console.log("Received Request:", req.body); // Debugging line

        const { startDate, selectedStage } = req.body;

        if (!startDate || !selectedStage) {
            return res.status(400).json({ error: "Start date and stage selection are required" });
        }

        // ✅ Ensure startDate is in the correct format
        if (!moment(startDate, "YYYY-MM-DD", true).isValid()) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        // ✅ Update the stage's start date in the database
        const updatedStage = await Stage.findByIdAndUpdate(
            selectedStage,
            { startDate: startDate },
            { new: true }
        );

        if (!updatedStage) {
            return res.status(404).json({ error: "Stage not found" });
        }

        console.log("Stage updated successfully:", updatedStage);
        res.json({ success: true, message: "Start date updated", stage: updatedStage });

    } catch (error) {
        console.error("Error updating start date:", error);
        res.status(500).json({ error: "Failed to update start date" });
    }
};