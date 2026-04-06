// F:\Build Resume\MERN\backend\utils\jobRecommender.js

/**
 * Job Recommender Utility
 * Provides intelligent job recommendations based on resume analysis
 */

// ==============================================
// JOB DATABASE (In production, this would be from MongoDB/PostgreSQL)
// ==============================================
const jobDatabase = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechCorp Inc.",
    location: "Remote",
    type: "Full-time",
    skills: ["React", "JavaScript", "HTML5", "CSS3", "Redux", "TypeScript", "REST APIs"],
    experienceLevel: "Mid-level",
    salaryRange: "$80,000 - $120,000",
    description: "We are looking for a skilled Frontend Developer with strong React experience to join our team. You'll be building responsive web applications and collaborating with UX designers.",
    postedDate: "2024-01-15",
    applicationDeadline: "2024-02-15",
    benefits: ["Health insurance", "401(k)", "Remote work", "Flexible hours"],
    companyRating: 4.5
  },
  {
    id: 2,
    title: "Full Stack Developer (MERN)",
    company: "StartupXYZ",
    location: "New York, NY",
    type: "Full-time",
    skills: ["Node.js", "React", "MongoDB", "Express.js", "AWS", "Docker", "GraphQL"],
    experienceLevel: "Senior",
    salaryRange: "$120,000 - $160,000",
    description: "Join our fast-growing startup as a Senior Full Stack Developer. Work on cutting-edge projects using the MERN stack and cloud technologies.",
    postedDate: "2024-01-20",
    applicationDeadline: "2024-02-28",
    benefits: ["Equity options", "Unlimited PTO", "Learning budget", "Health benefits"],
    companyRating: 4.2
  },
  {
    id: 3,
    title: "Backend Developer",
    company: "DataSystems LLC",
    location: "San Francisco, CA",
    type: "Full-time",
    skills: ["Python", "Django", "PostgreSQL", "Docker", "REST APIs", "AWS", "Redis"],
    experienceLevel: "Mid-level",
    salaryRange: "$90,000 - $130,000",
    description: "Backend developer position focusing on building scalable APIs and data processing systems. Experience with Python and databases required.",
    postedDate: "2024-01-10",
    applicationDeadline: "2024-02-10",
    benefits: ["Competitive salary", "Stock options", "Gym membership", "Catered meals"],
    companyRating: 4.7
  },
  {
    id: 4,
    title: "MERN Stack Developer",
    company: "Digital Innovations",
    location: "Remote",
    type: "Full-time",
    skills: ["MongoDB", "Express.js", "React", "Node.js", "JavaScript", "Git", "JWT"],
    experienceLevel: "Junior",
    salaryRange: "$60,000 - $90,000",
    description: "Entry-level position for developers looking to grow their skills in the MERN stack. Mentorship program included.",
    postedDate: "2024-01-18",
    applicationDeadline: "2024-02-18",
    benefits: ["Training program", "Remote first", "Health insurance", "Career growth"],
    companyRating: 4.0
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "CloudTech Solutions",
    location: "Austin, TX",
    type: "Full-time",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Terraform", "Jenkins"],
    experienceLevel: "Senior",
    salaryRange: "$110,000 - $150,000",
    description: "DevOps engineer responsible for cloud infrastructure, automation, and deployment pipelines. AWS certification is a plus.",
    postedDate: "2024-01-12",
    applicationDeadline: "2024-02-12",
    benefits: ["AWS Certification", "Bonus", "Health coverage", "Flexible schedule"],
    companyRating: 4.8
  },
  {
    id: 6,
    title: "React Native Developer",
    company: "AppMasters",
    location: "Chicago, IL",
    type: "Contract",
    skills: ["React Native", "JavaScript", "iOS", "Android", "Firebase", "Redux", "APIs"],
    experienceLevel: "Mid-level",
    salaryRange: "$85,000 - $115,000",
    description: "Build cross-platform mobile applications using React Native. Work closely with product and design teams.",
    postedDate: "2024-01-22",
    applicationDeadline: "2024-02-22",
    benefits: ["Contract to hire", "Project diversity", "Remote options", "Tech allowance"],
    companyRating: 4.1
  },
  {
    id: 7,
    title: "JavaScript Developer",
    company: "WebCraft Studios",
    location: "Remote",
    type: "Full-time",
    skills: ["JavaScript", "Vue.js", "Node.js", "MongoDB", "GraphQL", "Jest", "Webpack"],
    experienceLevel: "Mid-level",
    salaryRange: "$75,000 - $105,000",
    description: "Looking for a JavaScript developer with Vue.js experience. You'll be working on client projects and internal tools.",
    postedDate: "2024-01-14",
    applicationDeadline: "2024-02-14",
    benefits: ["Remote work", "Health benefits", "Conference budget", "Flexible hours"],
    companyRating: 4.3
  },
  {
    id: 8,
    title: "Node.js Backend Developer",
    company: "API Solutions Inc",
    location: "Boston, MA",
    type: "Full-time",
    skills: ["Node.js", "Express.js", "MongoDB", "Redis", "Socket.io", "Microservices", "Docker"],
    experienceLevel: "Senior",
    salaryRange: "$100,000 - $140,000",
    description: "Senior backend developer specializing in Node.js and microservices architecture. Lead API development projects.",
    postedDate: "2024-01-16",
    applicationDeadline: "2024-02-16",
    benefits: ["Leadership role", "Stock options", "Health/dental", "401(k) matching"],
    companyRating: 4.6
  },
  {
    id: 9,
    title: "Software Engineer Intern",
    company: "TechGiant Corp",
    location: "Seattle, WA",
    type: "Internship",
    skills: ["Python", "JavaScript", "React", "SQL", "Git", "Data Structures"],
    experienceLevel: "Intern",
    salaryRange: "$25 - $35/hour",
    description: "Summer internship for computer science students. Learn from senior engineers and work on real projects.",
    postedDate: "2024-01-25",
    applicationDeadline: "2024-03-01",
    benefits: ["Mentorship", "Housing stipend", "Networking", "Potential full-time offer"],
    companyRating: 4.9
  },
  {
    id: 10,
    title: "Full Stack Engineer",
    company: "Innovate Labs",
    location: "Remote",
    type: "Full-time",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "GraphQL", "AWS", "Testing"],
    experienceLevel: "Mid-level",
    salaryRange: "$95,000 - $125,000",
    description: "Full stack engineer for a remote-first company building SaaS products. Strong focus on code quality and testing.",
    postedDate: "2024-01-19",
    applicationDeadline: "2024-02-19",
    benefits: ["Unlimited PTO", "Remote equipment", "Health stipend", "Learning credits"],
    companyRating: 4.4
  }
];

// ==============================================
// SKILL CATEGORIES FOR BETTER MATCHING
// ==============================================
const skillCategories = {
  frontend: ["react", "vue", "angular", "javascript", "typescript", "html", "css", "sass", "bootstrap", "material-ui", "redux", "next.js"],
  backend: ["node.js", "express", "python", "django", "flask", "java", "spring", "c#", ".net", "php", "laravel", "ruby", "rails"],
  database: ["mongodb", "postgresql", "mysql", "sql", "redis", "firebase", "dynamodb", "oracle"],
  devops: ["aws", "docker", "kubernetes", "jenkins", "ci/cd", "terraform", "linux", "nginx", "azure", "gcp"],
  mobile: ["react native", "flutter", "ios", "android", "swift", "kotlin", "xcode"],
  tools: ["git", "github", "gitlab", "jira", "confluence", "figma", "postman", "webpack", "npm", "yarn"]
};

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Normalize text for comparison
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text.toString().toLowerCase().trim();
};

/**
 * Calculate years of experience from dates
 */
const calculateExperienceYears = (experienceArray) => {
  if (!Array.isArray(experienceArray) || experienceArray.length === 0) {
    return 0;
  }

  let totalYears = 0;
  
  experienceArray.forEach(exp => {
    try {
      const startDate = new Date(exp.startDate || exp.start_year || '2020-01-01');
      const endDate = exp.endDate === 'Present' || !exp.endDate ? 
        new Date() : new Date(exp.endDate || exp.end_year || new Date());
      
      if (!isNaN(startDate) && !isNaN(endDate)) {
        const years = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
        if (years > 0) {
          totalYears += Math.min(years, 10); // Cap at 10 years per position
        }
      }
    } catch (error) {
      console.log(`Error calculating experience for position: ${error.message}`);
    }
  });

  return Math.round(totalYears * 10) / 10; // Round to 1 decimal
};

/**
 * Extract and normalize skills from resume data
 */
const extractSkillsFromResume = (resumeData) => {
  const skillsSet = new Set();
  
  // Extract from skills section
  if (resumeData.skills) {
    if (Array.isArray(resumeData.skills)) {
      resumeData.skills.forEach(skill => {
        if (typeof skill === 'string') {
          skillsSet.add(normalizeText(skill));
        } else if (skill.name) {
          skillsSet.add(normalizeText(skill.name));
        }
      });
    } else if (typeof resumeData.skills === 'string') {
      resumeData.skills.split(/[,;|]/).forEach(skill => {
        skillsSet.add(normalizeText(skill));
      });
    }
  }
  
  // Extract from experience
  if (resumeData.experience && Array.isArray(resumeData.experience)) {
    resumeData.experience.forEach(exp => {
      // From skillsUsed
      if (exp.skillsUsed && Array.isArray(exp.skillsUsed)) {
        exp.skillsUsed.forEach(skill => skillsSet.add(normalizeText(skill)));
      }
      
      // From technologies
      if (exp.technologies && typeof exp.technologies === 'string') {
        exp.technologies.split(/[,;|]/).forEach(tech => {
          skillsSet.add(normalizeText(tech));
        });
      }
      
      // From description
      if (exp.description) {
        Object.keys(skillCategories).forEach(category => {
          skillCategories[category].forEach(skill => {
            if (normalizeText(exp.description).includes(skill)) {
              skillsSet.add(skill);
            }
          });
        });
      }
    });
  }
  
  // Extract from projects
  if (resumeData.projects && Array.isArray(resumeData.projects)) {
    resumeData.projects.forEach(project => {
      if (project.technologies) {
        project.technologies.split(/[,;|]/).forEach(tech => {
          skillsSet.add(normalizeText(tech));
        });
      }
      
      if (project.description) {
        Object.keys(skillCategories).forEach(category => {
          skillCategories[category].forEach(skill => {
            if (normalizeText(project.description).includes(skill)) {
              skillsSet.add(skill);
            }
          });
        });
      }
    });
  }
  
  // Extract from education
  if (resumeData.education && Array.isArray(resumeData.education)) {
    resumeData.education.forEach(edu => {
      if (edu.major || edu.fieldOfStudy) {
        const field = normalizeText(edu.major || edu.fieldOfStudy);
        if (field.includes('computer') || field.includes('software') || 
            field.includes('engineering') || field.includes('information')) {
          // Add common CS skills for CS graduates
          ['programming', 'algorithms', 'data structures', 'database', 'networking'].forEach(skill => {
            skillsSet.add(skill);
          });
        }
      }
    });
  }
  
  // Add inferred skills based on other skills
  const skillsArray = Array.from(skillsSet);
  const inferredSkills = new Set();
  
  // Infer related skills
  skillsArray.forEach(skill => {
    // If they know React, they likely know JavaScript
    if (skill.includes('react') && !skill.includes('native')) {
      inferredSkills.add('javascript');
    }
    
    // If they know MERN stack components
    if (skill.includes('mongodb') || skill.includes('express') || skill.includes('react') || skill.includes('node')) {
      inferredSkills.add('javascript');
      if (skill.includes('mongodb')) inferredSkills.add('database');
      if (skill.includes('express')) inferredSkills.add('backend');
      if (skill.includes('node')) inferredSkills.add('backend');
    }
    
    // If they know any framework
    if (skill.includes('vue') || skill.includes('angular') || skill.includes('django') || skill.includes('spring')) {
      inferredSkills.add('javascript');
    }
  });
  
  // Add inferred skills to main set
  inferredSkills.forEach(skill => skillsSet.add(skill));
  
  return Array.from(skillsSet);
};

/**
 * Determine experience level from years of experience
 */
const getExperienceLevel = (yearsOfExperience) => {
  if (yearsOfExperience < 1) return "Entry-level/Intern";
  if (yearsOfExperience < 3) return "Junior";
  if (yearsOfExperience < 5) return "Mid-level";
  if (yearsOfExperience < 8) return "Senior";
  return "Lead/Expert";
};

/**
 * Calculate match score between resume and job
 */
const calculateMatchScore = (resumeData, job) => {
  const resumeSkills = extractSkillsFromResume(resumeData);
  const jobSkills = job.skills.map(normalizeText);
  
  if (resumeSkills.length === 0 || jobSkills.length === 0) {
    return 0;
  }
  
  // Calculate skill match (70% of score)
  let skillMatchCount = 0;
  const matchedSkills = [];
  
  jobSkills.forEach(jobSkill => {
    // Check for direct match
    if (resumeSkills.some(resumeSkill => resumeSkill === jobSkill)) {
      skillMatchCount++;
      matchedSkills.push(jobSkill);
    } 
    // Check for partial match (e.g., "react" matches "react.js")
    else if (resumeSkills.some(resumeSkill => 
      resumeSkill.includes(jobSkill) || jobSkill.includes(resumeSkill)
    )) {
      skillMatchCount += 0.8;
      matchedSkills.push(jobSkill);
    }
    // Check for category match
    else {
      Object.keys(skillCategories).forEach(category => {
        if (skillCategories[category].includes(jobSkill)) {
          const categorySkills = skillCategories[category];
          const hasCategorySkill = resumeSkills.some(resumeSkill => 
            categorySkills.some(catSkill => 
              resumeSkill.includes(catSkill) || catSkill.includes(resumeSkill)
            )
          );
          if (hasCategorySkill) {
            skillMatchCount += 0.5;
            matchedSkills.push(jobSkill + " (related)");
          }
        }
      });
    }
  });
  
  const skillScore = (skillMatchCount / jobSkills.length) * 70;
  
  // Calculate experience match (20% of score)
  const yearsOfExperience = calculateExperienceYears(resumeData.experience || []);
  const resumeExpLevel = getExperienceLevel(yearsOfExperience);
  const jobExpLevel = normalizeText(job.experienceLevel);
  
  let experienceScore = 0;
  const expHierarchy = {
    "intern": 1,
    "entry": 2,
    "junior": 3,
    "mid": 4,
    "senior": 5,
    "lead": 6,
    "expert": 7
  };
  
  const resumeExpNum = expHierarchy[normalizeText(resumeExpLevel).split('-')[0].split('/')[0]] || 3;
  const jobExpNum = expHierarchy[jobExpLevel.split('-')[0].split('/')[0]] || 4;
  
  if (resumeExpNum >= jobExpNum) {
    experienceScore = 20; // Overqualified or perfect match
  } else if (resumeExpNum >= jobExpNum - 1) {
    experienceScore = 15; // Close match
  } else if (resumeExpNum >= jobExpNum - 2) {
    experienceScore = 10; // Somewhat underqualified
  } else {
    experienceScore = 5; // Underqualified
  }
  
  // Calculate location preference (10% of score)
  let locationScore = 0;
  const resumeLocation = normalizeText(resumeData.location || resumeData.preferredLocation || '');
  const jobLocation = normalizeText(job.location);
  
  if (jobLocation.includes('remote')) {
    locationScore = 10; // Remote jobs are universally accessible
  } else if (resumeLocation && jobLocation.includes(resumeLocation)) {
    locationScore = 10; // Exact location match
  } else if (resumeLocation && resumeLocation.includes(jobLocation)) {
    locationScore = 8; // Partial location match
  } else {
    locationScore = 5; // No location match
  }
  
  // Calculate final score
  const totalScore = skillScore + experienceScore + locationScore;
  
  // Bonus for education match (up to 5 points)
  let educationBonus = 0;
  if (resumeData.education && Array.isArray(resumeData.education) && resumeData.education.length > 0) {
    const highestDegree = resumeData.education[0].degree || '';
    if (highestDegree.toLowerCase().includes('bachelor') || 
        highestDegree.toLowerCase().includes('master') ||
        highestDegree.toLowerCase().includes('phd')) {
      educationBonus = 5;
    }
  }
  
  const finalScore = Math.min(totalScore + educationBonus, 100);
  
  return {
    score: Math.round(finalScore),
    matchedSkills: [...new Set(matchedSkills)].slice(0, 6),
    missingSkills: jobSkills.filter(jobSkill => 
      !matchedSkills.some(matchedSkill => 
        matchedSkill.includes(jobSkill) || jobSkill.includes(matchedSkill.replace(' (related)', ''))
      )
    ).slice(0, 3),
    skillBreakdown: {
      skillScore: Math.round(skillScore),
      experienceScore: Math.round(experienceScore),
      locationScore: Math.round(locationScore),
      educationBonus: educationBonus
    }
  };
};

/**
 * Get personalized job recommendations
 */
const recommendJobs = (resumeData, options = {}) => {
  try {
    const {
      limit = 5,
      minScore = 50,
      locationFilter = null,
      experienceFilter = null,
      jobType = null
    } = options;
    
    if (!resumeData) {
      throw new Error("No resume data provided");
    }
    
    // Analyze resume
    const skills = extractSkillsFromResume(resumeData);
    const yearsOfExperience = calculateExperienceYears(resumeData.experience || []);
    const experienceLevel = getExperienceLevel(yearsOfExperience);
    
    // Calculate scores for all jobs
    const jobsWithScores = jobDatabase
      .map(job => {
        const matchResult = calculateMatchScore(resumeData, job);
        
        return {
          ...job,
          matchPercentage: matchResult.score,
          matchScore: matchResult.score,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          skillBreakdown: matchResult.skillBreakdown,
          isGoodMatch: matchResult.score >= 70,
          isPerfectMatch: matchResult.score >= 85
        };
      })
      // Filter based on criteria
      .filter(job => {
        if (job.matchScore < minScore) return false;
        if (locationFilter && !normalizeText(job.location).includes(normalizeText(locationFilter))) return false;
        if (experienceFilter && normalizeText(job.experienceLevel) !== normalizeText(experienceFilter)) return false;
        if (jobType && normalizeText(job.type) !== normalizeText(jobType)) return false;
        return true;
      })
      // Sort by match score
      .sort((a, b) => b.matchScore - a.matchScore);
    
    // Take top N recommendations
    const recommendations = jobsWithScores.slice(0, limit);
    
    // Generate insights
    const insights = generateInsights(resumeData, recommendations);
    
    // Career suggestions
    const careerSuggestions = generateCareerSuggestions(resumeData, skills, yearsOfExperience);
    
    return {
      success: true,
      data: {
        recommendations,
        resumeAnalysis: {
          totalSkills: skills.length,
          yearsOfExperience,
          experienceLevel,
          topSkills: skills.slice(0, 10),
          skillCategories: categorizeSkills(skills)
        },
        insights,
        careerSuggestions,
        metadata: {
          totalJobsAnalyzed: jobDatabase.length,
          jobsConsidered: jobsWithScores.length,
          recommendationsCount: recommendations.length,
          bestMatchScore: recommendations[0]?.matchScore || 0,
          averageMatchScore: Math.round(
            recommendations.reduce((sum, job) => sum + job.matchScore, 0) / 
            (recommendations.length || 1)
          ),
          generatedAt: new Date().toISOString()
        }
      }
    };
    
  } catch (error) {
    console.error("Error in job recommendation:", error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Generate insights based on resume and recommendations
 */
const generateInsights = (resumeData, recommendations) => {
  const insights = [];
  
  if (recommendations.length === 0) {
    insights.push({
      type: "warning",
      title: "No strong matches found",
      message: "Consider adding more skills to your resume or expanding your search criteria."
    });
    return insights;
  }
  
  const topJob = recommendations[0];
  
  // Strength insights
  if (topJob.matchScore >= 85) {
    insights.push({
      type: "success",
      title: "Excellent match found!",
      message: `You're highly qualified for ${topJob.title} positions. Your skills align perfectly with current market demands.`
    });
  } else if (topJob.matchScore >= 70) {
    insights.push({
      type: "success",
      title: "Good match found",
      message: `You have strong qualifications for ${topJob.title} roles. Consider highlighting your ${topJob.matchedSkills.slice(0, 2).join(' and ')} experience.`
    });
  }
  
  // Skill insights
  if (topJob.missingSkills.length > 0) {
    insights.push({
      type: "improvement",
      title: "Skills to develop",
      message: `Consider learning ${topJob.missingSkills.slice(0, 2).join(' or ')} to increase your job match scores by 15-20%.`,
      action: "Learn these skills"
    });
  }
  
  // Experience insights
  const yearsOfExperience = calculateExperienceYears(resumeData.experience || []);
  if (yearsOfExperience < 1) {
    insights.push({
      type: "info",
      title: "Entry-level focus",
      message: "With your experience level, focus on junior and entry-level positions. Consider internships to gain experience."
    });
  }
  
  // Location insights
  const remoteJobs = recommendations.filter(job => normalizeText(job.location).includes('remote'));
  if (remoteJobs.length > 0) {
    insights.push({
      type: "opportunity",
      title: "Remote opportunities",
      message: `${remoteJobs.length} of your top matches are remote positions, expanding your job market significantly.`
    });
  }
  
  return insights;
};

/**
 * Generate career suggestions
 */
const generateCareerSuggestions = (resumeData, skills, yearsOfExperience) => {
  const suggestions = [];
  
  // Skill-based suggestions
  const hasReact = skills.some(s => s.includes('react') && !s.includes('native'));
  const hasNode = skills.some(s => s.includes('node'));
  const hasPython = skills.some(s => s.includes('python'));
  
  if (hasReact && hasNode) {
    suggestions.push({
      title: "Full Stack Developer Path",
      description: "Your React and Node.js skills make you well-suited for full stack development roles.",
      nextSteps: ["Learn MongoDB or PostgreSQL", "Explore cloud deployment (AWS/Azure)", "Build a full-stack project"]
    });
  }
  
  if (hasReact && !hasNode) {
    suggestions.push({
      title: "Frontend Specialization",
      description: "Consider deepening your frontend expertise with TypeScript, Next.js, or state management libraries.",
      nextSteps: ["Learn TypeScript", "Master a CSS framework like Tailwind", "Build a portfolio with complex UIs"]
    });
  }
  
  if (hasPython && !hasReact) {
    suggestions.push({
      title: "Backend/Data Engineering",
      description: "Your Python skills are valuable for backend development, data analysis, or machine learning roles.",
      nextSteps: ["Learn Django or Flask", "Explore data analysis libraries", "Study database design"]
    });
  }
  
  // Experience-based suggestions
  if (yearsOfExperience < 2) {
    suggestions.push({
      title: "Build Your Foundation",
      description: "Focus on building 2-3 substantial projects to demonstrate your capabilities to employers.",
      nextSteps: ["Contribute to open source", "Complete a complex tutorial project", "Attend local tech meetups"]
    });
  }
  
  return suggestions.slice(0, 3); // Return top 3 suggestions
};

/**
 * Categorize skills for better analysis
 */
const categorizeSkills = (skills) => {
  const categories = {};
  
  Object.keys(skillCategories).forEach(category => {
    const categorySkills = skills.filter(skill => 
      skillCategories[category].some(catSkill => 
        skill.includes(catSkill) || catSkill.includes(skill)
      )
    );
    if (categorySkills.length > 0) {
      categories[category] = categorySkills;
    }
  });
  
  // Uncategorized skills
  const uncategorized = skills.filter(skill => 
    !Object.values(categories).flat().includes(skill)
  );
  if (uncategorized.length > 0) {
    categories['other'] = uncategorized;
  }
  
  return categories;
};

/**
 * Get all available jobs
 */
const getAllJobs = (filters = {}) => {
  let filteredJobs = [...jobDatabase];
  
  if (filters.location) {
    filteredJobs = filteredJobs.filter(job => 
      normalizeText(job.location).includes(normalizeText(filters.location))
    );
  }
  
  if (filters.experienceLevel) {
    filteredJobs = filteredJobs.filter(job => 
      normalizeText(job.experienceLevel) === normalizeText(filters.experienceLevel)
    );
  }
  
  if (filters.jobType) {
    filteredJobs = filteredJobs.filter(job => 
      normalizeText(job.type) === normalizeText(filters.jobType)
    );
  }
  
  if (filters.skill) {
    filteredJobs = filteredJobs.filter(job => 
      job.skills.some(skill => 
        normalizeText(skill).includes(normalizeText(filters.skill))
      )
    );
  }
  
  return filteredJobs;
};

/**
 * Get job by ID
 */
const getJobById = (id) => {
  return jobDatabase.find(job => job.id === id) || null;
};

/**
 * Search jobs by keyword
 */
const searchJobs = (query, filters = {}) => {
  if (!query) return getAllJobs(filters);
  
  const searchTerm = normalizeText(query);
  const filteredJobs = getAllJobs(filters);
  
  return filteredJobs.filter(job => 
    normalizeText(job.title).includes(searchTerm) ||
    normalizeText(job.company).includes(searchTerm) ||
    normalizeText(job.description).includes(searchTerm) ||
    job.skills.some(skill => normalizeText(skill).includes(searchTerm))
  );
};

/**
 * Get job statistics
 */
const getJobStatistics = () => {
  const totalJobs = jobDatabase.length;
  
  const byExperience = {};
  const byLocation = {};
  const byType = {};
  
  jobDatabase.forEach(job => {
    // Count by experience level
    const expLevel = job.experienceLevel;
    byExperience[expLevel] = (byExperience[expLevel] || 0) + 1;
    
    // Count by location
    const location = job.location;
    byLocation[location] = (byLocation[location] || 0) + 1;
    
    // Count by job type
    const type = job.type;
    byType[type] = (byType[type] || 0) + 1;
  });
  
  // Most in-demand skills
  const skillCount = {};
  jobDatabase.forEach(job => {
    job.skills.forEach(skill => {
      const normalizedSkill = normalizeText(skill);
      skillCount[normalizedSkill] = (skillCount[normalizedSkill] || 0) + 1;
    });
  });
  
  const topSkills = Object.entries(skillCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count, percentage: Math.round((count / totalJobs) * 100) }));
  
  return {
    totalJobs,
    byExperience,
    byLocation,
    byType,
    topSkills,
    averageSkillsPerJob: Math.round(
      jobDatabase.reduce((sum, job) => sum + job.skills.length, 0) / totalJobs
    ),
    remotePercentage: Math.round(
      (jobDatabase.filter(job => normalizeText(job.location).includes('remote')).length / totalJobs) * 100
    )
  };
};

// ==============================================
// EXPORTS
// ==============================================

// Named exports instead of default export
export {
  recommendJobs,
  getAllJobs,
  getJobById,
  searchJobs,
  getJobStatistics,
  extractSkillsFromResume,
  calculateExperienceYears,
  getExperienceLevel,
  calculateMatchScore,
  generateInsights,
  generateCareerSuggestions
};

// Alternative: Export as an object if you prefer
const jobRecommender = {
  recommendJobs,
  getAllJobs,
  getJobById,
  searchJobs,
  getJobStatistics,
  utils: {
    extractSkillsFromResume,
    calculateExperienceYears,
    getExperienceLevel,
    calculateMatchScore,
    generateInsights,
    generateCareerSuggestions
  }
};

export default jobRecommender;