// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { createContactMessage } = require('../controllers/contactController');

// POST /contact-us
router.post('/contact-us', createContactMessage);

module.exports = router;
