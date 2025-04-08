const { fetchData } = require('../services/apiService');

exports.getApiData = async (req, res) => {
    try {
        const data = await fetchData();
        // console.log(data);
        return data;
    } catch (error) {
        console.error("Error fetching API data:", error.message);
        res.status(500).json({ error: "Failed to load data." });
    }
};

// exports.getApiData = async (req, res) => {
//     try {
//         const data = await fetchData();
//         res.json(data);
//     } catch (error) {
//         console.error("Error fetching API data:", error.message);
//         res.status(500).json({ error: "Failed to load data." });
//     }
// };