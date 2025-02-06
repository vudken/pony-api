const fs = require("fs");
const path = require("path");

const STAGES_FILE = path.join(__dirname, "../data/stages.json");

// Ensure file exists
if (!fs.existsSync(STAGES_FILE)) {
    fs.writeFileSync(STAGES_FILE, "[]", "utf-8");
}

// Load stages safely
function getStages() {
    try {
        const data = fs.readFileSync(STAGES_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading stages.json:", error);
        return [];
    }
}

// Save stages safely
function saveStages(stages) {
    try {
        fs.writeFileSync(STAGES_FILE, JSON.stringify(stages, null, 2), "utf-8");
    } catch (error) {
        console.error("Error saving stages.json:", error);
    }
}

// API Methods
exports.getAllStages = () => getStages();
exports.addStage = (newStage) => {
    const stages = getStages();
    stages.push(newStage);
    saveStages(stages);
    return stages;
};
exports.removeStage = (index) => {
    const stages = getStages();
    if (index >= 0 && index < stages.length) {
        stages.splice(index, 1);
        saveStages(stages);
    }
    return stages;
};
