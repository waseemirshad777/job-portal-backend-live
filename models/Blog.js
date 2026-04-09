// models/Blog.js
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    blogKeywords: { type: String, required: true },
    blogContent: { type: String, required: true },
    blogImage: { type: String, required: true },

}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;


