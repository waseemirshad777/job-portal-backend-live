const nodemailer = require('nodemailer');
const Subscriber = require('../models/Subscriber');
const uploadHelper = require('../utils/uploadHelper');
const emailService = require('../services/emailService');
const Job = require('../models/Job');

const jobController = {
    async postJob(req, res) {
        try {
            const { title, applyEmail, employerId, jobType, jobCategory, jobTags, jobSkills, company, location, salaryFrom, salaryTo, salaryCurrency, experience, description, requirements, closingDate } = req.body;
            const jobImage = req.file ? req.file.path : null;

            // Validate required fields
            const missingFields = {};
            if (!title) missingFields.title = "Job title is required.";
            if (!applyEmail) missingFields.applyEmail = "Apply link email is required.";
            if (!employerId) missingFields.employerId = "Employer Id is required.";
            if (!jobType) missingFields.jobType = "Job type is required.";
            if (!jobCategory) missingFields.jobCategory = "Job category is required.";
            if (!jobSkills) missingFields.jobSkills = "Skills are required.";
            if (!jobTags) missingFields.jobTags = "Job tags are required.";
            if (!company) missingFields.company = "Company name is required.";
            if (!location) missingFields.location = "Location is required.";
            if (!description) missingFields.description = "Job description is required.";
            if (!requirements) missingFields.requirements = "Job requirements are required.";
            if (!jobImage) missingFields.jobImage = "Job Image are required.";

            // If there are missing fields, return all error messages
            if (Object.keys(missingFields).length > 0) {
                return res.status(200).json({ message: missingFields, status: 422});
            }

            // Create a new job
            const job = new Job({
                title,
                employerId,
                applyEmail,
                jobType,
                jobCategory,
                jobTags,
                jobSkills,
                company,
                location,
                salaryFrom,
                salaryTo,
                salaryCurrency,
                experience,
                description,
                requirements,
                jobImage,
                closingDate,
            });
            await job.save();


            // Send email to subscribers
            const subscribers = await Subscriber.find();
            const emailList = subscribers.map(subscriber => subscriber.email);

            if (emailList.length > 0) {
                await emailService.sendNewJobPostedEmail(
                    emailList,
                    {
                        title,
                        company,
                        location,
                        jobType,
                        jobCategory,
                        salaryFrom,
                        salaryTo,
                        salaryCurrency
                    },
                    // `${process.env.FRONTEND_URL}`
                    `${process.env.FRONTEND_URL}/job-detail/${job._id}`
                );
            }

            res.status(200).json({ message: "Job posted successfully", job, status: 201 });
        } catch (err) {
            console.error("Error in posting job:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    async updateJob(req, res) {
        try {
            const { id } = req.params;
            const { title, applyEmail, employerId, jobType, jobCategory, jobTags, jobSkills, company, location, salaryFrom, salaryTo, salaryCurrency, experience, description, requirements, closingDate } = req.body;
            const jobImage = req.file ? req.file.path : null;

            // Validate required fields
            const missingFields = {};
            // if (!title) missingFields.title = "Job title is required.";
            // if (!applyEmail) missingFields.applyEmail = "Apply link email is required.";
            // if (!employerId) missingFields.employerId = "Employer Id is required.";
            // if (!jobType) missingFields.jobType = "Job type is required.";
            // if (!jobCategory) missingFields.jobCategory = "Job category is required.";
            // if (!jobSkills) missingFields.jobSkills = "Skills are required.";
            // if (!jobTags) missingFields.jobTags = "Job tags are required.";
            // if (!company) missingFields.company = "Company name is required.";
            // if (!location) missingFields.location = "Location is required.";
            // if (!description) missingFields.description = "Job description is required.";
            // if (!requirements) missingFields.requirements = "Job requirements are required.";
            if (!jobImage) missingFields.jobImage = "Job Image is required.";

            // If there are missing fields, return all error messages
            if (Object.keys(missingFields).length > 0) {
                return res.status(200).json({ message: missingFields, status: 422 });
            }

            // Find the job by ID and update it
            const job = await Job.findById(id);
            if (!job) {
                return res.status(404).json({ message: "Job not found" });
            }
            
            job.title = title || job.title;
            job.applyEmail = applyEmail || job.applyEmail;
            job.employerId = employerId || job.employerId;
            job.jobType = jobType || job.jobType;
            job.jobCategory = job.jobCategory || job.jobCategory;
            job.jobSkills = jobSkills || job.jobSkills;  
            job.jobTags = jobTags || job.jobTags; 
            job.company = company || job.company;
            job.location = location || job.location;
            job.salaryFrom = salaryFrom || job.salaryFrom;
            job.salaryTo = salaryTo || job.salaryTo;
            job.salaryCurrency = salaryCurrency || job.salaryCurrency;
            job.experience = experience || job.experience;
            job.description = description || job.description;
            job.requirements = requirements || job.requirements;
            job.closingDate = closingDate || job.closingDate;

            if (jobImage) {
                await uploadHelper.handleImageReplacement(job.jobImage, jobImage);
                job.jobImage = jobImage;
            }
            
            await job.save();


            res.status(200).json({ message: "Job updated successfully", job, status: 200 });
        } catch (err) {
            console.error("Error in updating job:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    async getJobsByCompany (req, res) {
        try {
          const { companyId } = req.params;
      
          const jobs = await Job.find({ company: companyId }).populate('company jobCategory');
      
          if (jobs.length === 0) {
            return res.status(404).json({ message: 'No jobs found for this company' });
          }
      
          res.status(200).json(jobs);
        } catch (error) {
          console.error('Error fetching jobs by company:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
    },
    async getJobsByCategory (req, res) {
        try {
          const { categoryId } = req.params;
      
          const jobs = await Job.find({ jobCategory: categoryId }).populate('company');
      
          if (jobs.length === 0) {
            return res.status(404).json({ message: 'No job found for this Category' });
          }
      
          res.status(200).json(jobs);
        } catch (error) {
          console.error('Error fetching jobs by company:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
    },
    async getJobsByEmployer(req, res) {
        try {
            const { employerId } = req.params;

            const sortBy = { date: -1 };
            // const jobs = await Job.find(filter).populate([
            //     { path: 'company' },
            //     { path: 'employer' },
            //     { path: 'category' }
            //   ]);
            const jobs = await Job.find({ employerId: employerId }).populate('company').sort(sortBy);
            res.status(200).json(jobs);
        } catch (err) {
            console.error("Error in getting jobs:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    async getJobById(req, res) {
        try {
            const { jobId } = req.params;
            const job = await Job.findById(jobId).populate('company');
            if (!job) {
                return res.status(200).json({ message: "Job not found", status: 404 });
            }
            res.status(200).json(job);
        } catch (err) {
            console.error("Error in getting job by ID:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },


async getAllJobs(req, res) {
    try {
        const { keyword, location, jobType, jobCategory } = req.query;
        const filter = {};

        if (keyword) {
            const regex = new RegExp(keyword, 'i');  // Case-insensitive search
            filter.$or = [
                { title: regex },
                { jobTags: regex },
                { jobSkills: regex }
            ];
        }
        if (location) filter.location = new RegExp(location, 'i'); 
        if (jobType) filter.jobType = new RegExp(jobType, 'i');
        if (jobCategory) filter.jobCategory = jobCategory;

        const sortBy = { createdAt: -1 }; 

        const page = Number(req.query.page) || 1; 
        const effectiveLimit = Number(req.query.perPage) || Number(req.query.limit) || 10;

        const jobs = await Job.find(filter).populate('company')
        .sort(sortBy)
        .skip((page - 1) * effectiveLimit)
        .limit(effectiveLimit);

        const totalJobs = await Job.countDocuments(filter); 
        const totalPages = Math.ceil(totalJobs / effectiveLimit); 
        
        const from = (page - 1) * effectiveLimit + 1;
        const to = Math.min(page * effectiveLimit, totalJobs); 
        
        const currentPage = page;

        res.status(200).json({
            jobs,
            pagination: {
                totalJobs,
                totalPages,
                currentPage,
                perPage: effectiveLimit,
                from,
                to,
            },
        });
    } catch (err) {
        console.error("Error in getting all jobs:", err); 
        res.status(500).json({ message: "Internal server error" });
    }
},




    async deleteJob(req, res) {
        try {
            const { jobId } = req.params;

             const job = await Job.findById(jobId);
                        
            if (!job) {
                return res.status(404).json({ message: "Job not found" });
            }

            if (job.jobImage) {
                await uploadHelper.handleImageDeletion(job.jobImage);
            }
            await Job.findByIdAndDelete(jobId);

            res.status(200).json({ message: "Job deleted successfully" });
        } catch (err) {
            console.error("Error in deleting job:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};

module.exports = jobController;
