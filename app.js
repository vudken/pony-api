const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const browserSync = require('browser-sync').create();
const connectDB = require('./src/services/dbConfig');
const userRoutes = require('./src/routes/userRoute');
const apiRoutes = require('./src/routes/apiRoute');
const dashboardRoutes = require('./src/routes/dashboardRoute');
const flash = require('connect-flash');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Middleware Setup
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(flash());

// Flash Messages Middleware
app.use((req, res, next) => {
    res.locals.errorMessage = req.flash('error');
    res.locals.successMessage = req.flash('success');
    next();
});

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Load Routes
app.use('/', [userRoutes, apiRoutes, dashboardRoutes]);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);

    // Initialize BrowserSync for live reload
    browserSync.init({
        proxy: `http://localhost:${PORT}`,
        browser: ["chrome"],
        files: ["src/**/*.*", "public/**/*.*"],
        notify: true,
        open: false
    });
});
