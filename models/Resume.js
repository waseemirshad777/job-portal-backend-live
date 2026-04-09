// models/Resume.js
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  resumeBanner: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  expectedSalary: {
    type: String,
  },
  educationLevel: {
    type: String,
    required: true
  },
  language: {
    type: String, 
    required: true
  },
  shortDetails: {
    type: String,
    required: true
  },
  aboutYourself: {
    type: String,
    required: true
  },
  skills: {
    type: String,
    required: true
  },
  workingExperience: {
    type: String,
  },
  resume: {
    type: String,
    required: true
  },
  address: {
    country: { type: String, required: true },
    state: { type: String, required: true },
    fullAddress: { type: String, required: true }
  },
  contactInfo: {
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
