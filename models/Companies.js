// models/Resume.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  employerId: {
    type: String,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  companyTagline: {
    type: String,
  },
  companyBanner: {
    type: String,
    required: true
  },
  companyLogo: {
    type: String,
    required: true
  },
  shortDetails: {
    type: String,
    required: true
  },
  aboutCompany: {
    type: String,
  },
  companyField: {
    type: String , 
    default: 'Not Provided'
  },
  skills: {
    type: String , 
    required: true
  },
  address: {
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    fullAddress: { type: String, required: true }
  },
  contactInfo: {
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
