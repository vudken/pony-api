const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // For hashing passwords

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true, // Ensures email is unique in the collection
        },
        password: {
            type: String,
            required: true,
        },
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

// Hash password before saving to the database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Only hash if password is new/changed
    this.password = await bcrypt.hash(this.password, 10); // Hash password with salt rounds
    next();
});

// Add a method to compare passwords during authentication
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
