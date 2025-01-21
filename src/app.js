const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware for static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', apiRoutes);

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;