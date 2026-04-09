// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    employerId: { type: String, required: true },
    applyEmail: { type: String, required: true },
    jobType: { type: String, required: true },
    jobCategory: { type: mongoose.Types.ObjectId, ref: 'JobCategory', required: true },
    jobTags: { type: String, required: true }, 
    jobSkills: { type: String, required: true }, 
    company: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'Company',
        required: true
    },
    location: { type: String, required: true },
    salaryFrom: { type: Number , default: ''},
    salaryTo: { type: Number , default: '' },
    salaryCurrency: { type: String , default: '' },
    experience: { type: String , default: '' },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    jobImage: { type: String, required: true},
    closingDate: { type: Date ,
        default: () => {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 10); 
            return currentDate;
        }
    },
    saved: { type: Boolean, default: false }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;


