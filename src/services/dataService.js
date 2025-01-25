const axios = require('axios');
const fs = require("fs");

const url = `http://212.93.127.226:9280/`;

const fetchData = async () => {
    try {
        const response = await axios.get(`${url}state`);
        const data = response.data;

        const phValue = data.values.find(item => item.v);
        const ecValue = data.raw_ec_msm;
        const description = data.description;

        const result = [{
            name: "Device 1",
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

const updateData = async (endpoint, payload) => {
    try {
        const response =
            await axios.post(
                `${url}${endpoint}`,
                { jdata: JSON.stringify(payload) },
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );
        console.log("API response:", response.data);
    } catch (error) {
        console.error("Error updating data:", error);
        errHandler(error);
    }
};

module.exports = { fetchData, updateData };