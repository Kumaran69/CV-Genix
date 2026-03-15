const JobMatcher = require('../services/jobMatcher');
const Resume = require('../models/Resume');
const User = require('../models/User');

class JobController {
  async getJobRecommendations(req, res) {
    try {
      const { skills, location = 'remote', limit = 20 } = req.body;
      const userId = req.user.id;

      // If skills not provided, extract from user's resumes
      let userSkills = skills;
      if (!userSkills || userSkills.length === 0) {
        userSkills = await this.extractSkillsFromUserResumes(userId);
      }

      if (userSkills.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No skills found. Please update your resume or provide skills.'
        });
      }

      // Get job recommendations
      const recommendations = await JobMatcher.getJobRecommendations(
        userSkills,
        location,
        limit
      );

      // Get personalized insights
      const insights = await JobMatcher.getPersonalizedInsights(userSkills, location);

      res.json({
        success: true,
        count: recommendations.length,
        jobs: recommendations,
        insights,
        userSkills,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching job recommendations',
        error: error.message
      });
    }
  }

  async extractSkillsFromUserResumes(userId) {
    try {
      const resumes = await Resume.find({ user: userId });
      
      if (resumes.length === 0) return [];
      
      const allSkills = new Set();
      
      resumes.forEach(resume => {
        if (resume.skills && Array.isArray(resume.skills)) {
          resume.skills.forEach(skill => {
            if (typeof skill === 'string') {
              allSkills.add(skill);
            } else if (skill.name) {
              allSkills.add(skill.name);
            }
          });
        }
      });
      
      return Array.from(allSkills);
    } catch (error) {
      console.error('Error extracting skills:', error);
      return [];
    }
  }

  async saveJob(req, res) {
    try {
      const { jobId, title, company, applyUrl } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Initialize savedJobs array if it doesn't exist
      if (!user.savedJobs) {
        user.savedJobs = [];
      }

      // Check if job already saved
      const alreadySaved = user.savedJobs.some(job => job.jobId === jobId);
      if (alreadySaved) {
        return res.status(400).json({
          success: false,
          message: 'Job already saved'
        });
      }

      // Add job to saved jobs
      user.savedJobs.push({
        jobId,
        title,
        company,
        applyUrl,
        savedDate: new Date()
      });

      await user.save();

      res.json({
        success: true,
        message: 'Job saved successfully',
        savedJobs: user.savedJobs
      });
    } catch (error) {
      console.error('Error saving job:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving job',
        error: error.message
      });
    }
  }

  async getSavedJobs(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('savedJobs');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        savedJobs: user.savedJobs || []
      });
    } catch (error) {
      console.error('Error getting saved jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching saved jobs',
        error: error.message
      });
    }
  }

  async applyToJob(req, res) {
    try {
      const { jobId, resumeId } = req.body;
      const userId = req.user.id;

      // Validate resume belongs to user
      const resume = await Resume.findOne({ _id: resumeId, user: userId });
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      // In production, this would integrate with job application APIs
      // For now, just track the application
      const user = await User.findById(userId);
      if (!user.applications) {
        user.applications = [];
      }

      user.applications.push({
        jobId,
        resumeId,
        appliedDate: new Date(),
        status: 'applied'
      });

      await user.save();

      // Generate application confirmation
      const applicationData = {
        jobId,
        resumeId: resume._id,
        resumeName: resume.personal?.name || 'Untitled Resume',
        appliedDate: new Date(),
        applicationId: `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      res.json({
        success: true,
        message: 'Application submitted successfully',
        application: applicationData,
        nextSteps: [
          'Follow up with recruiter in 1 week',
          'Prepare for potential interviews',
          'Update your application status if needed'
        ]
      });
    } catch (error) {
      console.error('Error applying to job:', error);
      res.status(500).json({
        success: false,
        message: 'Error submitting application',
        error: error.message
      });
    }
  }

  async getAppliedJobs(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('applications');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        applications: user.applications || []
      });
    } catch (error) {
      console.error('Error getting applied jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching applications',
        error: error.message
      });
    }
  }

  async getJobDetails(req, res) {
    try {
      const { jobId } = req.params;
      const { source } = req.query;

      // In production, this would fetch detailed job info from the source API
      // For now, return mock data
      const jobDetails = {
        jobId,
        title: 'Software Engineer',
        company: 'Tech Company Inc.',
        location: 'Remote',
        description: 'We are looking for a talented software engineer...',
        requirements: [
          '3+ years of experience with JavaScript',
          'Experience with React and Node.js',
          'Knowledge of cloud platforms',
          'Strong problem-solving skills'
        ],
        benefits: [
          'Health insurance',
          'Remote work options',
          'Stock options',
          'Learning budget'
        ],
        salary: '$120,000 - $160,000',
        applyUrl: '#',
        postedDate: new Date(),
        source: source || 'system'
      };

      res.json({
        success: true,
        job: jobDetails
      });
    } catch (error) {
      console.error('Error getting job details:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching job details',
        error: error.message
      });
    }
  }
}

module.exports = new JobController();