const axios = require('axios');

const url = `http://212.93.127.226:9280/state`;

const fetchData = async () => {
    try {
        const response = await axios.get(url);
        const data = response.data;

        // Extract PH and EC values
        const phValue = data.values.find(item => item.v);
        const ecValue = data.raw_ec_msm;
        const description = data.description; // Extract the description field

        // Prepare the result data
        const result = [{
            name: "Device 1", // Adjust if the name is dynamic
            ph: phValue ? phValue.v : "N/A",
            ec: ecValue || "N/A",
            description: description || "No description available"
        }];

        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
};

module.exports = { fetchData };
