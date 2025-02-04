const fs = require("fs");
const path = require("path");
const apiController = require("./apiController");

const stagesPath = path.join(__dirname, "../services/stages.json");

// Load stages from JSON file
const getStagesJSON = () => {
    const data = fs.readFileSync(stagesPath, "utf8");
    console.log(data);
    // return JSON.parse(data);
};

exports.getHome = async (req, res) => {
    try {
        const data = await apiController.getApiData();
        // const data = [
        //     { name: 'Tank 1', ph: 6.5, ec: 1.2, description: 'Main tank' },
        //     { name: 'Tank 2', ph: 'invalid', ec: null, description: 'Backup tank' },
        // ];

        const validatedData = data.map(item => ({
            ...item,
            ph: item.ph == "N/A" ? item.ph : parseFloat(item.ph).toFixed(2),
            ec: item.ec == "N/A" ? item.ec : parseFloat(item.ec).toFixed(2),
        }));

        // const validatedData = data.map(item => ({
        //     ...item,
        //     ph: (typeof item.ph === "number" && !isNaN(item.ph)) ? item.ph : 
        //         (!isNaN(parseFloat(item.ph)) ? parseFloat(item.ph) : "N/A"),
        //     ec: (typeof item.ec === "number" && !isNaN(item.ec)) ? item.ec : 
        //         (!isNaN(parseFloat(item.ec)) ? parseFloat(item.ec) : "N/A"),
        // }));

        res.render('dashboard', { section: 'home', data: validatedData });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.render('dashboard', { section: 'home', data: [] });
    }
};

exports.getAdmin = (req, res) => {
    try {
        res.render('dashboard', { section: 'admin' });
    } catch (error) {
        console.log(error);
    }
};

exports.getCalendar = (req, res) => {
    try {
        res.render('dashboard', { section: 'calendar', stages: getStagesJSON() });
    } catch (error) {
        console.log(error);
    }
};

exports.getStages = (req, res) => {
    try {
        res.render('dashboard', { section: 'stages', stages: getStagesJSON() });
    } catch (error) {
        console.log(error);
    }
};

exports.getProfile = (req, res) => {
    try {
        console.log('Profile page accessed by:', req.user);
        res.render('dashboard', { section: 'profile', data: [] });
    } catch (error) {
        console.log(error);
    }
};

// router.post('/profile/update', isAuthenticated, (req, res) => {
//     console.log("Profile Updated:", req.body);
//     res.redirect('/profile'); // Redirect back after saving
// });


