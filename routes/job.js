const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const upload = require('../middleware/upload'); // Use the same multer configuration


router.post('/job/post', upload.single('jobImage'), jobController.postJob);
router.get('/company-jobs/:companyId', jobController.getJobsByCompany);
router.get('/category-jobs/:categoryId', jobController.getJobsByCategory);
router.get('/jobs/:employerId', jobController.getJobsByEmployer);
router.get('/job/:jobId', jobController.getJobById);
router.get('/jobs', jobController.getAllJobs);
router.delete('/job/:jobId', jobController.deleteJob);
router.put('/updatejob/:id', upload.single('jobImage'), jobController.updateJob);

module.exports = router;

