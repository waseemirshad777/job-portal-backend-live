const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwtSeceretKey = "wasim@467";

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const authController = {
    async register(req, res) {
        try {
            const { email, password, confirmPassword, role, username } = req.body;
            const profilePhoto = req.file ? req.file.path : ''; 
            // Collect missing fields messages
            const missingFields = {};
            if (!email) missingFields.email = "Email field is required.";
            if (!password) missingFields.password = "Password field is required.";
            if (!confirmPassword) missingFields.confirmPassword = "Confirm password field is required.";
            if (!username) missingFields.username = "Username field is required.";
            if (!role) missingFields.role = "Role field is required.";

            // If there are missing fields, return all error messages
            if (Object.keys(missingFields).length > 0) {
                return res.status(200).json({ message: missingFields, status: 422 });
            }
            if( password !== confirmPassword) {
                return res.status(200).json({ message: {password: "Both Passwords should be same." }, status: 401 });
            }

            // Check if the email is already registered
            let user = await User.findOne({ email });
            if (user)  return res.status(200).json({ message: {email: "Email already exists." }, status: 401 });

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            const confirm_hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            user = new User({
                email,
                password: hashedPassword,
                confirmPassword: confirm_hashedPassword,
                role: role ,
                username: username
            });
            await user.save();

            res.status(200).json({ message: "User registered successfully", user, status: 201 });
        } catch (err) {
            console.error("Error in user registration:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const missingFields = {};
            if (!email) missingFields.email = "Email field is required.";
            if (!password) missingFields.password = "Password field is required.";
            if (Object.keys(missingFields).length > 0) {
                return res.status(422).json({ message: missingFields, });
            }

            const user = await User.findOne({ email });
            if (!user)  return res.status(200).json({ message: { email: "Invalid email"}, status: 401 });

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) return res.status(200).json({ message: {password: "Invalid password" }, status: 401 });

            
            const token = jwt.sign({ userId: user._id }, jwtSeceretKey, { expiresIn: '1h' });

            res.status(200).json({
                message: "Login successful",
                status: 201,
                token,
                user: {
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                    profilePhoto: user.profilePhoto || "",
                    username: user.username || ""
                }
            });
        } catch (err) {
            console.error("Error in user login:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(200).json({ message: { email: "Email field is required." }, status: 422 });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(200).json({ message: { email: "Invalid email" }, status: 401 });
            }

            const token = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();

            const mailOptions = {
                to: user.email,
                from: 'your-email@gmail.com',
                subject: 'Password Reset',
                text: `You are receiving this because you have requested the reset of the password for your account.\n\n` +
                      `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                      `http://localhost:5173/reset-password/${token}\n\n` +
                      `If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };

            await transporter.sendMail(mailOptions);

            res.status(200).json({ message: "Password reset link sent to email", status: 200 });
        } catch (err) {
            console.error("Error in forgot password:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;

            if (!token) {
                return res.status(200).json({ message: { token: "Token is required." }, status: 422 });
            }

            if (!password) {
                return res.status(200).json({ message: { password: "Password field is required." }, status: 422 });
            }

            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(200).json({ message: { token: "Password reset token is invalid or has expired." }, status: 401 });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save(); 
            res.status(200).json({ message: "Password has been reset successfully", status: 200 });
        } catch (err) {
            console.error("Error in reset password:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};

module.exports = authController;
