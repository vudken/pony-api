const fs = require("fs");
const path = require("path");
const apiController = require("./apiController");

const stagesPath = path.join(__dirname, "../services/stages.json");

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
exports.getHome = async (req, res) => {
    try {
        const data = await apiController.getApiData();

        const validatedData = data.map(item => ({
            ...item,
            ph: item.ph === "N/A" ? item.ph : parseFloat(item.ph).toFixed(2),
            ec: item.ec === "N/A" ? item.ec : parseFloat(item.ec).toFixed(2),
        }));

        res.render('partials/home', { layout: 'layout', title: 'Home', data: validatedData });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.render('partials/home', { layout: 'layout', title: 'Home', data: [] });
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
        res.render("partials/stages", { layout: "layout", title: "Stages", stages });
    } catch (error) {
        console.log(error);
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

// ✅ API-Like Route: Add New Stage
exports.addStage = (req, res) => {
    try {
        const { name, duration, color } = req.body;
        if (!name || !duration || isNaN(duration)) {
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
        stages.splice(index, 1);
        saveStagesJSON(stages);

        res.json({ success: true, stages });
    } catch (error) {
        console.error("Error removing stage:", error);
        res.status(500).json({ error: "Failed to delete stage" });
    }
};
