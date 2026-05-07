const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    confirmPassword: { type: String },
    role: { type: String, enum: ['admin', 'employee', 'employer'] },
    profilePhoto: { type: String },
    fname: { type: String },
    lname: { type: String },
    username: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
