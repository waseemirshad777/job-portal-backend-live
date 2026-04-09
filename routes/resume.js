// routes/resume.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { addResume, updateResume, getallResumes, getResumeByEmployeeId, getResumeByResumeId, deleteResume } = require('../controllers/resumeController');

router.post('/resume/add', upload.fields([
    { name: 'resumeBanner', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
  ]), addResume);
  
  router.put('/resume/update/:id', upload.fields([
    { name: 'resumeBanner', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
  ]), updateResume);

  router.get('/resumes', getallResumes);
  router.get('/resume/:id', getResumeByResumeId);
  router.get('/employee-resume/:id', getResumeByEmployeeId);
  router.delete('/resume/delete/:id', deleteResume);

module.exports = router;
