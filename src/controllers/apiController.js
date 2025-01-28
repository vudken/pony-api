const { fetchData } = require('../services/apiService');

exports.getApiData = async (req, res) => {
    try {
        const data = await fetchData();
        // console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.json({ error: 'Failed to fetch data. Please try again later.' });
    }
};