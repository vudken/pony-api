const User = require('../models/userModel');

// Create a new user
const createUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

// Get a user by email
const getUserByEmail = async (email) => {
    return await User.findOne({ email });
};

// Update a user's data
const updateUser = async (userId, updateData) => {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

// Delete a user by ID
const deleteUser = async (userId) => {
    return await User.findByIdAndDelete(userId);
};

module.exports = {
    createUser,
    getUserByEmail,
    updateUser,
    deleteUser
};
