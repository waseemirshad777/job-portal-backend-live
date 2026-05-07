// controllers/subscriptionController.js
const Subscriber = require('../models/Subscriber');
const emailService = require('../services/emailService');

const subscriptionController = {
    async subscribe(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(200).json({ message: "Email feild is required", status: 422 });
            }

            const existingSubscriber = await Subscriber.findOne({ email });
            if (existingSubscriber) {
                return res.status(200).json({ message: "Email already subscribed", status: 401 });
            }

            const newSubscriber = new Subscriber({ email });
            await newSubscriber.save();

            // Send confirmation email
            await emailService.sendSubscriptionConfirmationEmail(email);

            res.status(200).json({ message: "Subscribed successfully", status: 201 });
        } catch (err) {
            console.error('Error subscribing:', err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    async listSubscribers(req, res) {
        try {
            const subscribers = await Subscriber.find({});
            res.status(200).json(subscribers);
        } catch (err) {
            console.error("Error in listing users:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    async deleteSubscriber(req, res) {
        try {
            const { id } = req.params;
            const subscriber = await Subscriber.findByIdAndDelete(id);
            if (!subscriber) {
                return res.status(404).json({ message: "Subscriber not found" });
            }

            res.status(200).json({ message: "Subscriber deleted successfully" });
        } catch (err) {
            console.error("Error in deleting Subscriber:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};

module.exports = subscriptionController;
