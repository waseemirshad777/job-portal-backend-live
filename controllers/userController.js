const User = require('../models/User');
const bcrypt = require('bcryptjs');

const userController = {
    async listUsers(req, res) {
        try {
            const users = await User.find({});
            res.status(200).json(users);
        } catch (err) {
            console.error("Error in listing users:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    async getUser(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json(user);
        } catch (err) {
            console.error("Error in fetching user:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },


    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { email, username, fname, lname } = req.body;
            const profilePhoto = req.file ? req.file.path : null;

            // Check if user exists
            let user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            
            user.email = email;
            user.fname = fname;
            user.lname = lname;
            user.username = username;

            if (profilePhoto) {
                user.profilePhoto = profilePhoto;
            }

            await user.save();

            res.status(200).json({ message: "User updated successfully", user });
        } catch (err) {
            console.error("Error in updating user:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    async updatePassword(req, res) {
        try {
            const { id } = req.params;
            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                return res.status(200).json({ message: "Both feilds are required", status: 422 });
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Check if old password matches
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(200).json({ message: "Old password is incorrect", status: 401 });
            }

            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            user.password = hashedPassword;
            await user.save();

            res.status(200).json({ message: "Password updated successfully" });
        } catch (err) {
            console.error("Error in updating password:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByIdAndDelete(id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({ message: "User deleted successfully" });
        } catch (err) {
            console.error("Error in deleting user:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

};

module.exports = userController;
