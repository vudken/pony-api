// const express = require('express');
// const path = require('path');
// const bodyParser = require('body-parser');
// const session = require('express-session');
// const apiRoutes = require('./routes/api');

// const app = express();

// app.set(express.static(path.join(__dirname, 'views')));

// app.set('view engine', 'ejs');

// app.use(express.static(path.join(__dirname, '../public')));




// app.use(bodyParser.json());

// // Session management
// app.use(session({
//     secret: 'your_secret_key',
//     resave: false,
//     saveUninitialized: true
// }));

// // Authentication middleware
// app.use((req, res, next) => {
//     if (req.session.user || req.path === '/login' || req.path === '/check-auth') {
//         next();
//     } else {
//         res.redirect('/');
//     }
// });

// // API routes
// app.use('/api', apiRoutes);

// // Serve the main HTML file
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '../public/index.html'));
// });

// // Check authentication status
// app.get('/check-auth', (req, res) => {
//     res.json({ authenticated: !!req.session.user });
// });

// module.exports = app;




// const express = require('express');
// const bodyParser = require('body-parser');
// const path = require('path');

// const app = express();
// const PORT = 3000;

// // Middleware
// app.use(bodyParser.urlencoded({ extended: true })); // To parse form data

// // Set EJS as the view engine
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views')); // Set views folder

// // Serve static files (e.g., CSS, JS, images)
// app.use(express.static(path.join(__dirname, 'public')));

// // Routes
// app.get('/', (req, res) => {
//     res.redirect('/login'); // Redirect to login page by default
// });

// app.get('/login', (req, res) => {
//     const errorMessage = req.query.error || null; // Pass error if exists
//     res.render('login', { errorMessage });
// });

// app.post('/login', (req, res) => {
//     const { username, password } = req.body;

//     // Dummy authentication
//     if (username !== 'admin' || password !== 'password123') {
//         return res.redirect('/login?error=Invalid username or password');
//     }

//     // If successful, redirect to dashboard
//     res.redirect('/dashboard');
// });

// app.get('/dashboard', (req, res) => {
//     res.send('<h1>Welcome to the Dashboard!</h1>'); // Simple success page
// });

// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
// });





const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./src/services/dbConfig'); // Import DB config
const userRoutes = require('./src/routes/userRoute');

require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;
console.log('Mongo URI:', process.env.MONGO_URI);

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.redirect('/login'));
app.use('/', userRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});