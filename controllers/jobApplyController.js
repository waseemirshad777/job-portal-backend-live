
const nodemailer = require('nodemailer');
const jobApplication = require('../models/JobApplications');
const emailService = require('../services/emailService');
const Job = require('../models/Job');

const jobApplyController = {
    async sendJobApplication(req, res) {
        try {
            const { employeeId, employerId, employerCompany, job,  email, fullName, jobTitle, applyEmail } = req.body;
            const resume = req.file ? req.file.path : null;

            const missingFields = {};
            if (!fullName) missingFields.employee_name = "Name is required.";
            if (!email) missingFields.employee_email = "Email is required.";
            if (!jobTitle) missingFields.jobTitle = "Job title is required.";
            if (!resume) missingFields.resume = "Resume feild is required.";

            // If there are missing fields, return all error messages
            if (Object.keys(missingFields).length > 0) {
                return res.status(200).json({ message: missingFields, status: 422});
            }

        
            await emailService.sendJobApplicationEmail(
                {
                    fullName,
                    email,
                    jobTitle,
                    employerCompany,
                    applyEmail
                },
                resume
            );

            // Save the email record in the database
            const application = new jobApplication({ 
                applyEmail,
                employeeId,
                employerId,
                employerCompany,
                job,
                fullName,
                jobTitle,
                email, 
                resume, 
            });

            await application.save();

            res.status(200).json({ message: "Applied successfully" });
        } catch (err) {
            console.error("Error in sending email:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    async getApplicationsByEmployeeId(req, res) {
        try {
            const { employeeId } = req.params;

            const applications = await jobApplication.find({ employeeId: employeeId })
            .populate({
                path: 'job',
                populate: { path: 'company' }  // Populate the company within the job
            });
            if (!applications.length) {
                return res.status(200).json({ message: "No applications found for this employee" , status: 404});
            }

            res.status(200).json(applications);
        } catch (err) {
            console.error("Error in getting applications by employee ID:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },
};

module.exports = jobApplyController;
