const express = require('express');
const axios = require('axios');
const browserSync = require('browser-sync').create();
const app = express();
const PORT = 3000;
const url = `http://212.93.127.226:9280/state`;

app.use(express.static('public'));

app.get('/api/data', async (req, res) => {
    try {
        const response = await axios.get(url);
        const data = response.data;

        // Extract PH and EC values
        const phValue = data.values.find(item => item.v);
        const ecValue = data.raw_ec_msm;
        const description = data.description;  // Extract the description field

        // Prepare the result data including description
        const result = [{
            name: "Device 1",  // You can adjust this if the name is dynamic
            ph: phValue ? phValue.v : "N/A",
            ec: ecValue || "N/A",
            description: description || "No description available"
        }];

        res.json(result);  // Send the result as JSON
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    browserSync.init({
        proxy: `http://localhost:${PORT}`,
        files: ['./public/**/*', './index.html', './script.js', './styles.css'],
        open: false,
        port: 3001,
    });
});