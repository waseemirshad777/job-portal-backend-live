const Saved = require('../models/SavedJobs');
const Job = require('../models/Job');

const savedJobController = {
    async savedJobAdd(req, res) {
        try {
            const { userId, jobId } = req.body;

            if (!userId || !jobId) {
                return res.status(400).json({ message: "userId and jobId are required", status: 400 });
            }

            const checkJob = await Saved.findOne({ jobId, userId });
            if (checkJob) {
                return res.status(409).json({ message: "Job already saved", status: 409 });
            }
            
            const savejob = new Saved({ jobId, userId });
            await savejob.save();

            // Update the job's saved status to true
            await Job.findByIdAndUpdate(jobId, { saved: true });

            res.status(201).json({ message: "Job saved successfully", status: 201 });
        } catch (err) {
            console.error("Error in adding job:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    async getSavedJobByUserId(req, res) {
        try {
            const { userId } = req.params;

            // Check if userId is provided
            if (!userId) {
                return res.status(400).json({ message: "userId is required", status: 400 });
            }

            // Get saved jobs by userId
            const savedJobs = await Saved.find({ userId }).populate('jobId'); // Changed to find by userId, and populate job details
            if (!savedJobs.length) {
                return res.status(404).json({ message: "No saved jobs found", status: 404 });
            }
            res.status(200).json(savedJobs);
        } catch (err) {
            console.error("Error in getting saved jobs:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    async savedJobs(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;

            const currentPage = Number(page) || 1;
            const perPage = Number(limit) || 10;

            const savedJobs = await Saved.find()
                .populate('jobId')
                .sort({ createdAt: -1 })
                .skip((currentPage - 1) * perPage)
                .limit(perPage);

            const totalSavedJobs = await Saved.countDocuments();
            const totalPages = Math.ceil(totalSavedJobs / perPage);

            res.status(200).json({
                savedJobs,
                pagination: {
                    totalSavedJobs,
                    totalPages,
                    currentPage,
                    perPage,
                },
            });
        } catch (err) {
            console.error("Error in getting all saved jobs:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    async unsavedJobRemove(req, res) {
        try {
            const { userId, jobId } = req.body;
    
            if (!userId || !jobId) {
                return res.status(400).json({ message: "userId and jobId are required", status: 400 });
            }
    
            // Find the saved job
            const savedJob = await Saved.findOne({ jobId, userId });
            if (!savedJob) {
                return res.status(404).json({ message: "Saved job not found", status: 404 });
            }
    
            // Remove the saved job
            await Saved.deleteOne({ jobId, userId });
    
            // Update the job's saved status to false
            await Job.findByIdAndUpdate(jobId, { saved: false });
    
            res.status(200).json({ message: "Job unsaved successfully", status: 200 });
        } catch (err) {
            console.error("Error in removing saved job:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    

    async deleteSavedJob(req, res) {
        try {
            const { id } = req.params;

            // Check if the saved job exists
            const savedJob = await Saved.findByIdAndDelete(id);
            if (!savedJob) {
                return res.status(404).json({ message: "Saved job not found", status: 404 });
            }
            // Update the job's saved status to false
            await Job.findByIdAndUpdate(savedJob.jobId, { saved: false });

            res.status(200).json({ message: "Saved job removed successfully", status: 200 });
        } catch (err) {
            console.error("Error in deleting saved job:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },
};

module.exports = savedJobController;
