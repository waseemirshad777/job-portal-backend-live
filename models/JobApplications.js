// models/JobApply.js
const mongoose = require('mongoose');

const jobApplySchema = new mongoose.Schema({
    employeeId: { 
        type: mongoose.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    employerId: { 
        type: mongoose.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    employerCompany: { 
        type: mongoose.Types.ObjectId, 
        ref: 'Company',
        required: true 
    },
    job: { 
        type: mongoose.Types.ObjectId, 
        ref: 'Job',
        required: true 
    },
    resume: { type: String, required: true },
    jobTitle: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
},  { timestamps: true });

const jobApplication = mongoose.model('Job Applications', jobApplySchema);

module.exports = jobApplication;
