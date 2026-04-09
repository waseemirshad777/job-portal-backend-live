// models/Subscriber.js
const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = Subscriber;
