const axios = require("axios");
const fs = require("fs");

const errHandler = (err) => {
    if (err.response) {
        console.error("Response error:", err.response.data);
        console.error("Status code:", err.response.status);
    } else if (err.request) {
        console.error("No response received:", err.request);
    } else {
        console.error("Error setting up request:", err.message);
    }
};
const resHandler = (resp, filePath) => {
    fs.writeFile(filePath, JSON.stringify(resp.data, null, 2), (err) => {
        if (err) {
            console.error("Error writing to file:", err);
        } else {
            console.log(`Response written to file: ${filePath}`);
        }
    });
};

const getData = async () => {
    try {
        const response = await axios.get(`http://212.93.127.226:9280/state`);
        console.log("API response:", response.data);

        const filePath = "getResp.json";
        resHandler(response, filePath);
    } catch (error) {
        console.error("Error fetching data:", error);
        errHandler(error);
    }
};

const updateData = async (config) => {
    console.log(config.url);
    try {
        const response = await axios.post(config.url, { jdata: JSON.stringify(config.payload.cmd) }, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        console.log("API response:", response.data);
    } catch (error) {
        console.error("Error updating data:", error);
        errHandler(error);
    }
};

module.exports = { getData, updateData };

// getData();
// updateData();