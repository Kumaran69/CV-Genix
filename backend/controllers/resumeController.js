// controllers/resumeController.js
import Resume from "../models/Resume.js";
import { recommendJobs } from "../utils/jobRecommender.js";

// Create new resume
export const createResume = async (req, res) => {
  try {
    const { title, template, personal, education, experience, projects, skills, certifications, languages, isPublic } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Resume title is required"
      });
    }

    // Check if resume with same title exists for this user
    const existingResume = await Resume.findOne({
      userId: req.user._id,
      title
    });

    if (existingResume) {
      return res.status(400).json({
        success: false,
        message: "You already have a resume with this title"
      });
    }

    // Create new resume
    const resume = await Resume.create({
      userId: req.user._id,
      title,
      template: template || "classic",
      personal: personal || {},
      education: education || [],
      experience: experience || [],
      projects: projects || [],
      skills: skills || [],
      certifications: certifications || [],
      languages: languages || [],
      isPublic: isPublic || false
    });

    res.status(201).json({
      success: true,
      message: "Resume created successfully",
      resume: resume.getFormattedData()
    });
  } catch (error) {
    console.error("Create resume error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate resume title"
      });
    }
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Save/update resume
export const saveResume = async (req, res) => {
  try {
    const { title, template, personal, education, experience, projects, skills, certifications, languages, isPublic } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Resume title is required"
      });
    }

    // Check if resume with same title exists for this user
    let resume = await Resume.findOne({
      userId: req.user._id,
      title
    });

    if (resume) {
      // Update existing resume
      resume.template = template || resume.template;
      resume.personal = personal || resume.personal;
      resume.education = education || resume.education;
      resume.experience = experience || resume.experience;
      resume.projects = projects || resume.projects;
      resume.skills = skills || resume.skills;
      resume.certifications = certifications || resume.certifications;
      resume.languages = languages || resume.languages;
      resume.isPublic = isPublic !== undefined ? isPublic : resume.isPublic;
      
      await resume.save();
      
      return res.status(200).json({
        success: true,
        message: "Resume updated successfully",
        resume: resume.getFormattedData()
      });
    }

    // Create new resume
    resume = await Resume.create({
      userId: req.user._id,
      title,
      template: template || "classic",
      personal: personal || {},
      education: education || [],
      experience: experience || [],
      projects: projects || [],
      skills: skills || [],
      certifications: certifications || [],
      languages: languages || [],
      isPublic: isPublic || false
    });

    res.status(201).json({
      success: true,
      message: "Resume saved successfully",
      resume: resume.getFormattedData()
    });
  } catch (error) {
    console.error("Save resume error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate resume title"
      });
    }
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Get all resumes for user
export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ updatedAt: -1 });

    const formattedResumes = resumes.map(resume => resume.getFormattedData());

    res.status(200).json({
      success: true,
      count: resumes.length,
      resumes: formattedResumes
    });
  } catch (error) {
    console.error("Get resumes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Get single resume by ID
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });
    }

    // Increment view count if it's a public resume
    if (resume.isPublic) {
      resume.viewCount += 1;
      await resume.save();
    }

    res.status(200).json({
      success: true,
      resume: resume.getFormattedData()
    });
  } catch (error) {
    console.error("Get resume by ID error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Update resume
export const updateResume = async (req, res) => {
  try {
    const updates = req.body;
    const resumeId = req.params.id;
    
    // Find the resume
    let resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== 'userId' && key !== '_id' && key !== 'createdAt') {
        resume[key] = updates[key];
      }
    });

    await resume.save();

    res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      resume: resume.getFormattedData()
    });
  } catch (error) {
    console.error("Update resume error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID"
      });
    }
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Delete resume
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully"
    });
  } catch (error) {
    console.error("Delete resume error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Get job recommendations for a resume
export const getJobRecommendations = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });
    }

    // Format resume data for the job recommender
    const resumeData = {
      skills: resume.extractSkillsForRecommendations(),
      experience: resume.experience,
      education: resume.education,
      projects: resume.projects,
      personal: resume.personal
    };

    // Get job recommendations
    const recommendations = recommendJobs(resumeData);

    res.status(200).json({
      success: true,
      recommendations,
      resumeId: resume._id,
      resumeTitle: resume.title
    });
  } catch (error) {
    console.error("Get job recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Increment download count
export const incrementDownloadCount = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });
    }

    resume.downloadCount += 1;
    await resume.save();

    res.status(200).json({
      success: true,
      message: "Download count updated",
      downloadCount: resume.downloadCount
    });
  } catch (error) {
    console.error("Increment download count error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Get public resumes
export const getPublicResumes = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = '-createdAt' } = req.query;
    
    const resumes = await Resume.findPublicResumes({
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy
    });

    const formattedResumes = resumes.map(resume => ({
      id: resume._id,
      title: resume.title,
      template: resume.template,
      personal: {
        name: resume.personal?.name,
        summary: resume.personal?.summary
      },
      user: resume.userId,
      totalExperience: resume.totalExperience,
      skills: resume.skills.slice(0, 5),
      viewCount: resume.viewCount,
      downloadCount: resume.downloadCount,
      createdAt: resume.createdAt
    }));

    res.status(200).json({
      success: true,
      count: formattedResumes.length,
      page: parseInt(page),
      limit: parseInt(limit),
      resumes: formattedResumes
    });
  } catch (error) {
    console.error("Get public resumes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Get user resume statistics
export const getUserResumeStats = async (req, res) => {
  try {
    const stats = await Resume.getUserStats(req.user._id);
    
    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalResumes: 0,
        publicResumes: 0,
        featuredResumes: 0,
        totalViews: 0,
        totalDownloads: 0
      }
    });
  } catch (error) {
    console.error("Get user resume stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};