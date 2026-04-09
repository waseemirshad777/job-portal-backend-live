const express = require('express');
const router = express.Router();
const savedJobController = require('../controllers/savedJobsController');

// Add saved job
router.post('/save-job', savedJobController.savedJobAdd);
router.get('/saved-job/:userId', savedJobController.getSavedJobByUserId);
router.get('/saved-jobs', savedJobController.savedJobs);
router.delete('/delete/saved-job/:id', savedJobController.deleteSavedJob);
router.delete('/unsave-job', savedJobController.unsavedJobRemove);

module.exports = router;
