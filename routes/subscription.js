// routes/subscription.js
const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

// Subscribe route
router.post('/subscribe', subscriptionController.subscribe);
router.get('/allSubscribers', subscriptionController.listSubscribers);
router.delete('/subscriber/:id', subscriptionController.deleteSubscriber);

module.exports = router;
