// const app = require('./app');
// const browserSync = require('browser-sync').create();

// const PORT = 3000;

// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);

//     // BrowserSync for hot-reloading
//     browserSync.init({
//         proxy: `http://localhost:${PORT}`,
//         files: ['./public/**/*', './public/index.html', './public/script.js'],
//         open: false,
//         port: 3001,
//     });
// });











const express = require('express');
const app = require('../app');
const browserSync = require('browser-sync').create();

const PORT = 3000;

const users = {
    user1: 'password1',
    user2: 'password2'
};

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username] === password) {
        req.session.user = username;
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);

    // BrowserSync for hot-reloading
    browserSync.init({
        proxy: `http://localhost:${PORT}`,
        files: ['./public/**/*', './public/index.html', './public/script.js'],
        open: false,
        port: 3001,
    });
});