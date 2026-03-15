// models/Resume.js
import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: [true, "User ID is required"],
    index: true
  },
  title: {
    type: String,
    required: [true, "Resume title is required"],
    trim: true,
    minlength: [2, "Title must be at least 2 characters"],
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  template: { 
    type: String, 
    default: "classic",
    enum: ["classic", "modern", "creative", "professional"],
    trim: true
  },
  personal: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d\s\-\(\)\.]{9,}$/, "Please enter a valid phone number"]
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"]
    },
    linkedin: {
      type: String,
      trim: true,
      maxlength: [200, "LinkedIn URL cannot exceed 200 characters"]
    },
    github: {
      type: String,
      trim: true,
      maxlength: [200, "GitHub URL cannot exceed 200 characters"]
    },
    portfolio: {
      type: String,
      trim: true,
      maxlength: [200, "Portfolio URL cannot exceed 200 characters"]
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [1000, "Summary cannot exceed 1000 characters"]
    }
  },
  education: [{
    degree: {
      type: String,
      required: [true, "Degree is required"],
      trim: true,
      maxlength: [200, "Degree cannot exceed 200 characters"]
    },
    institution: {
      type: String,
      required: [true, "Institution is required"],
      trim: true,
      maxlength: [200, "Institution cannot exceed 200 characters"]
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"]
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    currentlyStudying: {
      type: Boolean,
      default: false
    },
    gpa: {
      type: String,
      trim: true,
      maxlength: [10, "GPA cannot exceed 10 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"]
    }
  }],
  experience: [{
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
      maxlength: [200, "Role cannot exceed 200 characters"]
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
      maxlength: [200, "Company cannot exceed 200 characters"]
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"]
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance", "Remote"],
      default: "Full-time"
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"]
    },
    endDate: {
      type: Date
    },
    currentlyWorking: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"]
    },
    technologies: [{
      type: String,
      trim: true
    }],
    achievements: [{
      type: String,
      trim: true,
      maxlength: [500, "Achievement cannot exceed 500 characters"]
    }]
  }],
  projects: [{
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [200, "Project title cannot exceed 200 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Project description cannot exceed 1000 characters"]
    },
    technologies: [{
      type: String,
      trim: true
    }],
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    currentlyWorkingOn: {
      type: Boolean,
      default: false
    },
    githubLink: {
      type: String,
      trim: true,
      maxlength: [200, "GitHub link cannot exceed 200 characters"]
    },
    liveLink: {
      type: String,
      trim: true,
      maxlength: [200, "Live link cannot exceed 200 characters"]
    },
    keyFeatures: [{
      type: String,
      trim: true,
      maxlength: [200, "Feature cannot exceed 200 characters"]
    }]
  }],
  skills: [{
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      default: "Intermediate"
    },
    category: {
      type: String,
      enum: ["Programming", "Framework", "Database", "Tool", "Language", "Soft Skill", "Other"],
      default: "Programming"
    }
  }],
  certifications: [{
    name: {
      type: String,
      required: [true, "Certification name is required"],
      trim: true
    },
    issuer: {
      type: String,
      required: [true, "Issuer is required"],
      trim: true
    },
    issueDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    },
    credentialId: {
      type: String,
      trim: true
    },
    credentialUrl: {
      type: String,
      trim: true
    }
  }],
  languages: [{
    name: {
      type: String,
      required: [true, "Language name is required"],
      trim: true
    },
    proficiency: {
      type: String,
      enum: ["Basic", "Conversational", "Professional", "Native"],
      default: "Professional"
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Update the updatedAt timestamp on save
resumeSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  this.lastUpdated = Date.now();
  next();
});

// Add index for faster queries
resumeSchema.index({ userId: 1, title: 1 }, { unique: true });
resumeSchema.index({ isPublic: 1, createdAt: -1 });
resumeSchema.index({ "skills.name": 1 });

// Virtual field for calculating total experience
resumeSchema.virtual("totalExperience").get(function() {
  if (!this.experience || this.experience.length === 0) return 0;
  
  let totalMonths = 0;
  
  this.experience.forEach(exp => {
    const startDate = exp.startDate;
    const endDate = exp.currentlyWorking ? new Date() : exp.endDate || new Date();
    
    if (startDate && endDate) {
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                    (endDate.getMonth() - startDate.getMonth());
      totalMonths += Math.max(0, months);
    }
  });
  
  return Math.floor(totalMonths / 12); // Return years
});

// Method to get formatted resume data
resumeSchema.methods.getFormattedData = function() {
  return {
    id: this._id,
    title: this.title,
    template: this.template,
    personal: this.personal,
    education: this.education,
    experience: this.experience,
    projects: this.projects,
    skills: this.skills,
    certifications: this.certifications,
    languages: this.languages,
    isPublic: this.isPublic,
    isFeatured: this.isFeatured,
    viewCount: this.viewCount,
    downloadCount: this.downloadCount,
    totalExperience: this.totalExperience,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Method to extract skills for job recommendations
resumeSchema.methods.extractSkillsForRecommendations = function() {
  const skills = [];
  
  // Add skills from skills section
  if (this.skills && this.skills.length > 0) {
    this.skills.forEach(skill => {
      if (typeof skill === 'string') {
        skills.push(skill);
      } else if (skill.name) {
        skills.push(skill.name);
      }
    });
  }
  
  // Add technologies from experience
  if (this.experience && this.experience.length > 0) {
    this.experience.forEach(exp => {
      if (exp.technologies && Array.isArray(exp.technologies)) {
        skills.push(...exp.technologies);
      }
    });
  }
  
  // Add technologies from projects
  if (this.projects && this.projects.length > 0) {
    this.projects.forEach(project => {
      if (project.technologies && Array.isArray(project.technologies)) {
        skills.push(...project.technologies);
      }
    });
  }
  
  // Remove duplicates and return
  return [...new Set(skills)];
};

// Static method to find public resumes
resumeSchema.statics.findPublicResumes = function(options = {}) {
  const { page = 1, limit = 10, sortBy = '-createdAt' } = options;
  const skip = (page - 1) * limit;
  
  return this.find({ isPublic: true })
    .populate('userId', 'name email')
    .sort(sortBy)
    .skip(skip)
    .limit(limit);
};

// Static method to get resume statistics
resumeSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalResumes: { $sum: 1 },
        publicResumes: { $sum: { $cond: ["$isPublic", 1, 0] } },
        featuredResumes: { $sum: { $cond: ["$isFeatured", 1, 0] } },
        totalViews: { $sum: "$viewCount" },
        totalDownloads: { $sum: "$downloadCount" }
      }
    }
  ]);
};

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;