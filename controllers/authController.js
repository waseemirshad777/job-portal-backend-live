const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const emailService = require('../services/emailService');
const jwtSeceretKey = "wasim@467";

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
            
            if (password !== confirmPassword) {
                return res.status(200).json({ message: { password: "Both Passwords should be same." }, status: 401 });
            }

            // Check if the email is already registered
            let user = await User.findOne({ email });
            if (user) return res.status(200).json({ message: { email: "Email already exists." }, status: 401 });

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            const confirm_hashedPassword = await bcrypt.hash(password, 10);

            // Generate email verification token (valid for 24 hours)
            const emailVerificationToken = emailService.generateToken();
            const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            // Create a new user
            user = new User({
                email,
                password: hashedPassword,
                confirmPassword: confirm_hashedPassword,
                role: role,
                username: username,
                profilePhoto: profilePhoto,
                isEmailVerified: false,
                emailVerificationToken: emailVerificationToken,
                emailVerificationExpires: emailVerificationExpires
            });
            await user.save();

            // Send verification email
            const baseUrl = process.env.FRONTEND_URL;
            const emailResult = await emailService.sendVerificationEmail(
                email,
                username,
                emailVerificationToken,
                baseUrl
            );

            if (!emailResult.success) {
                // Email failed but user is created, inform the user
                console.warn('[Auth] Email sending failed but user was created:', emailResult.error);
            }

            res.status(200).json({
                message: "User registered successfully. Please check your email to verify your account.",
                user: {
                    _id: user._id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified
                },
                status: 201
            });
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
            if (!user) return res.status(200).json({ message: { email: "Invalid email" }, status: 401 });

            // Check if email is verified
            if (!user.isEmailVerified) {
                return res.status(200).json({
                    message: { email: "Please verify your email before logging in. Check your inbox for the verification link." },
                    status: 403,
                    isEmailVerified: false
                });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) return res.status(200).json({ message: { password: "Invalid password" }, status: 401 });

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
                    username: user.username || "",
                    isEmailVerified: user.isEmailVerified
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

            const resetToken = emailService.generateToken();
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
            await user.save();

            // Send password reset email using email service
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const emailResult = await emailService.sendPasswordResetEmail(
                user.email,
                user.username || user.email,
                resetToken,
                baseUrl
            );

            if (!emailResult.success) {
                console.error('[Auth] Password reset email sending failed:', emailResult.error);
                return res.status(500).json({ message: "Failed to send password reset email. Please try again." });
            }

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
    },

    /**
     * Verify user email using token
     */
    async verifyEmail(req, res) {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(200).json({
                    message: { token: "Verification token is required." },
                    status: 422
                });
            }

            // Find user with valid verification token
            const user = await User.findOne({
                emailVerificationToken: token,
                emailVerificationExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(200).json({
                    message: { token: "Email verification token is invalid or has expired." },
                    status: 401
                });
            }

            // Mark email as verified
            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save();

            res.status(200).json({
                message: "Email verified successfully. You can now log in.",
                status: 200
            });
        } catch (err) {
            console.error("Error in email verification:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    /**
     * Resend verification email
     */
    async resendVerificationEmail(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(200).json({
                    message: { email: "Email field is required." },
                    status: 422
                });
            }

            const user = await User.findOne({ email });

            if (!user) {
                return res.status(200).json({
                    message: { email: "No account found with this email." },
                    status: 401
                });
            }

            // If already verified, inform the user
            if (user.isEmailVerified) {
                return res.status(200).json({
                    message: { email: "This email is already verified. You can log in." },
                    status: 200
                });
            }

            // Generate new verification token
            const emailVerificationToken = emailService.generateToken();
            user.emailVerificationToken = emailVerificationToken;
            user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            await user.save();

            // Send verification email
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const emailResult = await emailService.sendVerificationEmail(
                user.email,
                user.username,
                emailVerificationToken,
                baseUrl
            );

            if (!emailResult.success) {
                console.error('[Auth] Verification email resend failed:', emailResult.error);
                return res.status(500).json({
                    message: "Failed to send verification email. Please try again."
                });
            }

            res.status(200).json({
                message: "Verification email has been resent. Please check your inbox.",
                status: 200
            });
        } catch (err) {
            console.error("Error in resend verification email:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};

module.exports = authController;
