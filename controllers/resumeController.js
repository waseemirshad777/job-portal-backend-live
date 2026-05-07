const Resume = require('../models/Resume');
const mongoose = require('mongoose');
const uploadHelper = require('../utils/uploadHelper');

// Add a new resume
const addResume = async (req, res) => {
  try {
    const { employeeId, fullName, designation, experience, expectedSalary, educationLevel, language, shortDetails, aboutYourself, skills, workingExperience, country, state, fullAddress, phone, email } = req.body;
    
    // Multer saves file paths in req.files object
    const resumeBanner = req.files['resumeBanner'][0].path;
    const profilePicture = req.files['profilePicture'][0].path;
    const resume = req.files['resume'][0].path;

    const newResume = new Resume({
      employeeId,
      fullName,
      designation,
      resumeBanner,
      profilePicture,
      experience,
      expectedSalary,
      educationLevel,
      language,
      shortDetails,
      aboutYourself,
      skills,
      workingExperience,
      resume,
      address: {
        country,
        state,
        fullAddress,
      },
      contactInfo: {
        phone,
        email,
      },
    });

    await newResume.save();
    res.status(201).json({ message: 'Resume added successfully', resume: newResume });
  } catch (error) {
    res.status(500).json({ message: 'Error adding resume', error });
  }
};

// Update an existing resume
const updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, designation, experience, expectedSalary, educationLevel, language, shortDetails, aboutYourself, skills, workingExperience, country, state, fullAddress, phone, email } = req.body;

    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    // Update resume fields
    resume.fullName = fullName || resume.fullName;
    resume.designation = designation || resume.designation;
    resume.experience = experience || resume.experience;
    resume.expectedSalary = expectedSalary || resume.expectedSalary;
    resume.educationLevel = educationLevel || resume.educationLevel;
    resume.language = language || resume.language;
    resume.shortDetails = shortDetails || resume.shortDetails;
    resume.aboutYourself = aboutYourself || resume.aboutYourself;
    resume.skills = skills || resume.skills;
    resume.workingExperience = workingExperience || resume.workingExperience;
    resume.address.country = country || resume.address.country;
    resume.address.state = state || resume.address.state;
    resume.address.fullAddress = fullAddress || resume.address.fullAddress;
    resume.contactInfo.phone = phone || resume.contactInfo.phone;
    resume.contactInfo.email = email || resume.contactInfo.email;

    // Handle all file replacements in parallel
    await Promise.all([
        (async () => {
            if (req.files?.resumeBanner?.[0]?.path) {
                const newResumeBanner = req.files.resumeBanner[0].path;
            
                await uploadHelper.handleImageReplacement(
                    resume.resumeBanner,
                    newResumeBanner
                );
              
                resume.resumeBanner = newResumeBanner;
            }
        })(),
      
        (async () => {
            if (req.files?.profilePicture?.[0]?.path) {
                const newProfilePicture = req.files.profilePicture[0].path;
            
                await uploadHelper.handleImageReplacement(
                    resume.profilePicture,
                    newProfilePicture
                );
              
                resume.profilePicture = newProfilePicture;
            }
        })(),
      
        (async () => {
            if (req.files?.resume?.[0]?.path) {
                const newResumeFile = req.files.resume[0].path;
            
                await uploadHelper.handleImageReplacement(
                    resume.uploadedResume,
                    newResumeFile
                );
              
                resume.uploadedResume = newResumeFile;
            }
        })()
    ]);

    await resume.save();
    res.status(200).json({ message: 'Resume updated successfully', resume });
  } catch (error) {
    res.status(500).json({ message: 'Error updating resume', error });
  }
};

const getResumeByEmployeeId = async (req, res) => {
  try {
      const { id } = req.params;

      const sortBy = { createdAt: -1 };

      // const resume = await Resume.find({ employeeId: new mongoose.Types.ObjectId(id) });
      const resume = await Resume.find({ employeeId: id }).sort(sortBy);
      res.status(200).json(resume);
  } catch (err) {
      console.error("Error in getting resume:", err);
      res.status(500).json({ message: "Internal server error" });
  }
};

const getResumeByResumeId = async (req, res) => {
  try {
      const { id } = req.params;

      const resume = await Resume.findById(id);
      if (!resume) {
        return res.status(200).json({ message: "Resume not found", status: 404 });
    }
      res.status(200).json(resume);
  } catch (err) {
      console.error("Error in getting resume:", err);
      res.status(500).json({ message: "Internal server error" });
  }
};


const getallResumes = async (req, res)=> {
  try {
      const { fullName, skill } = req.query;

      const filter = {};

      if (fullName) filter.fullName = new RegExp(fullName, 'i');
      if (skill) filter['skills'] = new RegExp(skill, 'i'); 

      const page = Number(req.query.page) || 1; 
      const effectiveLimit = Number(req.query.perPage) || Number(req.query.limit) || 10; 

      const sortBy = { createdAt: -1 }; 

      const resumes = await Resume.find(filter)
      .sort(sortBy)
      .skip((page - 1) * effectiveLimit)
      .limit(effectiveLimit);

      const totalResumes = await Resume.countDocuments(filter); 
      const totalPages = Math.ceil(totalResumes / effectiveLimit); 
      
      const from = (page - 1) * effectiveLimit + 1;
      const to = Math.min(page * effectiveLimit, totalResumes); 
      
      const currentPage = page;

      res.status(200).json({
          resumes,
          pagination: {
            totalResumes,
            totalPages,
            currentPage,
            perPage: effectiveLimit,
            from,
            to,
          },
      });
  } catch (err) {
      console.error("Error in getting all resumes:", err); 
      res.status(500).json({ message: "Internal server error" });
  }
};
const deleteResume = async (req, res)=> {
  try {
      const { resumeId } = req.params;

      const resume = await Resume.findById(resumeId);
                  
      if (!resume) {
          return res.status(404).json({ message: "Resume not found" });
      }
      
      await Promise.all([
        resume.resumeBanner
            ? uploadHelper.handleImageDeletion(resume.resumeBanner)
            : Promise.resolve(),
          
        resume.profilePicture
            ? uploadHelper.handleImageDeletion(resume.profilePicture)
            : Promise.resolve(),
          
        resume.uploadedResume
            ? uploadHelper.handleImageDeletion(resume.uploadedResume)
            : Promise.resolve()
      ]);

      await Resume.findByIdAndDelete(resumeId);

      res.status(200).json({ message: "Resume deleted successfully" });
  } catch (err) {
      console.error("Error in deleting resume:", err);
      res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  addResume,
  updateResume,
  getallResumes,
  deleteResume,
  getResumeByEmployeeId,
  getResumeByResumeId,
};
