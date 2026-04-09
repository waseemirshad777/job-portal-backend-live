// models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  company: { type: String },
  message: { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: Link with user if needed
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
