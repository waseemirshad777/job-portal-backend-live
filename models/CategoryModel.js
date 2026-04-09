// models/Job.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true },
    icon: { type: String, required: true },
}, { timestamps: true });

const category = mongoose.model('JobCategory', categorySchema);

module.exports = category;


