// controllers/statsController.js
const User = require('../models/User');
const Job = require('../models/Job');
const JobApplications = require('../models/JobApplications');
const Subscriber = require('../models/Subscriber');

const statsController = {
    async stats(req, res) {
        try {
            const totalEmployees = await User.countDocuments({ role: 'employee' });
            const totalEmployers = await User.countDocuments({ role: 'employer' });
            const totalUsers = await User.countDocuments();
            const totalJobs = await Job.countDocuments();
            const totalApplications = await JobApplications.countDocuments();
            const totalSubscribers = await Subscriber.countDocuments();
    
            res.status(200).json({
                totalUsers,
                totalJobs,
                totalApplications,
                totalEmployers,
                totalEmployees,
                totalSubscribers
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = statsController;
