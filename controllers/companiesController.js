const Company = require('../models/Companies');
const Job = require('../models/Job');
const mongoose = require('mongoose');
const uploadHelper = require('../utils/uploadHelper');

// Add a new company
const addCompany = async (req, res) => {
  try {
    const { employerId, companyName, companyTagline, aboutCompany, companyField, shortDetails, skills, country, state, city, fullAddress, phone, email } = req.body;
    
    // Multer saves file paths in req.files object
    const companyBanner = req.files['companyBanner'][0].path;
    const companyLogo = req.files['companyLogo'][0].path;

    const newCompany = new Company({
      employerId,
      companyName,
      companyTagline,
      companyBanner,
      companyLogo,
      shortDetails,
      skills,
      companyField,
      aboutCompany,
      address: {
        country,
        state,
        city,
        fullAddress,
      },
      contactInfo: {
        phone,
        email,
      },
    });

    await newCompany.save();
    res.status(201).json({ message: 'Company added successfully', company: newCompany });
  } catch (error) {
    res.status(500).json({ message: 'Error adding company', error });
  }
};

// Update an existing company
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, companyTagline, shortDetails, skills, companyField, aboutCompany, country, state, city, fullAddress, phone, email } = req.body;

    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // Update company fields
    company.companyName = companyName || company.companyName;
    company.companyTagline = companyTagline || company.companyTagline;
    company.shortDetails = shortDetails || company.shortDetails;
    company.skills = skills || company.skills;
    company.companyField = companyField || company.companyField;
    company.aboutCompany = aboutCompany || company.aboutCompany;
    company.address.country = country || company.address.country;
    company.address.state = state || company.address.state;
    company.address.city = city || company.address.city;
    company.address.fullAddress = fullAddress || company.address.fullAddress;
    company.contactInfo.phone = phone || company.contactInfo.phone;
    company.contactInfo.email = email || company.contactInfo.email;

    await Promise.all([
        (async () => {
            if (req.files?.companyBanner?.[0]?.path) {
                const newBanner = req.files.companyBanner[0].path;
            
                await uploadHelper.handleImageReplacement(
                    company.companyBanner,
                    newBanner
                );
              
                company.companyBanner = newBanner;
            }
        })(),
      
        (async () => {
            if (req.files?.companyLogo?.[0]?.path) {
                const newLogo = req.files.companyLogo[0].path;
            
                await uploadHelper.handleImageReplacement(
                    company.companyLogo,
                    newLogo
                );
              
                company.companyLogo = newLogo;
            }
        })()
    ]);

    await company.save();
    res.status(200).json({ message: 'Company updated successfully', company });
  } catch (error) {
    res.status(500).json({ message: 'Error updating company', error });
  }
};

const getCompanyByEmployerId = async (req, res) => {
  try {
      const { id } = req.params;

      const sortBy = { createdAt: -1 };

      // const company = await company.find({ employerId: new mongoose.Types.ObjectId(id) });
      const company = await Company.find({ employerId: id }).sort(sortBy);
      res.status(200).json(company);
  } catch (err) {
      console.error("Error in getting company:", err);
      res.status(500).json({ message: "Internal server error" });
  }
};

const getCompanyById = async (req, res) => {
  try {
      const { id } = req.params;

      const company = await Company.findById(id);
      if (!company) {
        return res.status(200).json({ message: "Company not found", status: 404 });
    }
      res.status(200).json(company);
  } catch (err) {
      console.error("Error in getting company:", err);
      res.status(500).json({ message: "Internal server error" });
  }
};


const getallCompanies = async (req, res) => {
  try {
    const { companyName, city} = req.query;

    const page = Number(req.query.page) || 1; 
    const effectiveLimit = Number(req.query.perPage) || Number(req.query.limit) || 10; 

    const filter = {};

    if (companyName) filter.companyName = new RegExp(companyName, 'i');
    if (city) filter['address.city'] = new RegExp(city, 'i'); 

    const sortBy = { createdAt: -1 }; 

    const companies = await Company.find(filter)
      .sort(sortBy)
      .skip((page - 1) * effectiveLimit)
      .limit(effectiveLimit);

      const totalCompanies = await Company.countDocuments(filter); 
      const totalPages = Math.ceil(totalCompanies / effectiveLimit); 
      
      const from = (page - 1) * effectiveLimit + 1;
      const to = Math.min(page * effectiveLimit, totalCompanies); 
      
      const currentPage = page;
      

    // Prepare companies data with openJobs count for each company
    const companiesWithOpenJobs = await Promise.all(
      companies.map(async (company) => {
        const openJobsCount = await Job.countDocuments({
          company: company._id,
          closingDate: { $gte: new Date() },
        });

        return {
          ...company.toObject(), 
          openJobs: openJobsCount, 
        };
      })
    );

    res.status(200).json({
      companies: companiesWithOpenJobs,
      pagination: {
        totalCompanies,
        totalPages,
        currentPage,
        perPage: effectiveLimit,
        from,
        to,
      },
    });
  } catch (err) {
    console.error('Error in getting all companies:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const companyNames = async (req, res) => {
    try {
      // Fetch only companyName field from all companies
      const companies = await Company.find({}, 'companyName'); // 'companyName' is the field we want to return
  
      res.status(200).json(companies);
    } catch (err) {
      console.error("Error fetching company names:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };

const deleteCompany = async (req, res)=> {
  try {
      const { id } = req.params;
      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      await Promise.all([
          company.companyBanner
              ? uploadHelper.handleImageDeletion(company.companyBanner)
              : Promise.resolve(),
            
          company.companyLogo
              ? uploadHelper.handleImageDeletion(company.companyLogo)
              : Promise.resolve(),
            
      ]);
      await Company.findByIdAndDelete(id);
      
      res.status(200).json({ message: "company deleted successfully" });
  } catch (err) {
      console.error("Error in deleting company:", err);
      res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  addCompany,
  updateCompany,
  getallCompanies,
  deleteCompany,
  getCompanyByEmployerId,
  getCompanyById,
  companyNames,
};
