// routes/resume.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { addCompany, updateCompany, getallCompanies, getCompanyByEmployerId, getCompanyById, deleteCompany, companyNames } = require('../controllers/companiesController');

router.post('/company/add', upload.fields([
    { name: 'companyBanner', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 },
  ]), addCompany);
  
  router.put('/company/update/:id', upload.fields([
    { name: 'companyBanner', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 },
  ]), updateCompany);

  router.get('/companies', getallCompanies);
  router.get('/company/:id', getCompanyById);
  router.get('/employer-company/:id', getCompanyByEmployerId);
  router.delete('/company/delete/:id', deleteCompany);
  router.get('/company-names', companyNames);

module.exports = router;
