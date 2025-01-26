const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const browserSync = require('browser-sync').create();
const connectDB = require('./src/services/dbConfig');
const userRoutes = require('./src/routes/userRoute');
const flash = require('connect-flash');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.errorMessage = req.flash('error');
    res.locals.successMessage = req.flash('success');
    next();
});
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', userRoutes);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    browserSync.init({
        proxy: `http://localhost:${PORT}`,
        browser: ["chrome"],
        files: ["src/**/*.*", "public/**/*.*"],
        notify: true,
        open: false
    });
});