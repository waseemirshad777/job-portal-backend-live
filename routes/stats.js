// routes/stats.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Get stats
router.get('/stats', statsController.stats);

module.exports = router;
