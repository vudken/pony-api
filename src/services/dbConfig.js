const mongoose = require('mongoose');
require('dotenv').config(); // Load .env variables

// MongoDB connection function
const connectDB = async () => {
    try {
        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Exit the process with failure code
    }
};

module.exports = connectDB;
