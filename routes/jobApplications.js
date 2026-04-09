// routes/email.js
const express = require('express');
const router = express.Router();
const jobApplyController = require('../controllers/jobApplyController');
const upload = require('../middleware/upload'); // Use the same multer configuration for file upload

// Send email route
router.post('/apply/job', upload.single('resume'), jobApplyController.sendJobApplication);
router.get('/applied-jobs/:employeeId', jobApplyController.getApplicationsByEmployeeId);

module.exports = router;
