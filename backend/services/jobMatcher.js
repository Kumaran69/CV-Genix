const natural = require('natural');
const stopword = require('stopword');
const Resume = require('../models/Resume');
const externalApis = require('./externalApis');

class JobMatcher {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.skillDatabase = this.getSkillDatabase();
  }

  async getJobRecommendations(userSkills, location = 'remote', limit = 20) {
    try {
      // Fetch jobs based on skills
      const query = this.buildQueryFromSkills(userSkills);
      const jobs = await externalApis.fetchAllJobs(query, location, limit * 2);
      
      if (jobs.length === 0) {
        return this.getFallbackJobs(userSkills);
      }

      // Match jobs with user skills
      const matchedJobs = this.matchJobsWithSkills(jobs, userSkills);
      
      // Sort by match score
      matchedJobs.sort((a, b) => b.matchScore - a.matchScore);
      
      return matchedJobs.slice(0, limit);
    } catch (error) {
      console.error('Job matching error:', error);
      return this.getFallbackJobs(userSkills);
    }
  }

  matchJobsWithSkills(jobs, userSkills) {
    return jobs.map(job => {
      const jobSkills = this.extractSkillsFromJob(job);
      const matchScore = this.calculateMatchScore(userSkills, jobSkills);
      const skillGap = this.calculateSkillGap(userSkills, jobSkills);
      
      return {
        ...job,
        matchScore,
        skillGap,
        requiredSkills: jobSkills,
        userSkills: userSkills,
        missingSkills: skillGap.missing,
        confidence: this.calculateConfidence(matchScore),
        recommendedAction: this.getRecommendedAction(matchScore, skillGap.missing)
      };
    });
  }

  calculateMatchScore(userSkills, jobSkills) {
    if (jobSkills.length === 0) return 50;
    
    const userSkillSet = new Set(userSkills.map(s => s.toLowerCase()));
    const jobSkillSet = new Set(jobSkills.map(s => s.toLowerCase()));
    
    // Calculate intersection
    const intersection = [...userSkillSet].filter(skill => jobSkillSet.has(skill));
    
    // Calculate Jaccard similarity
    const union = new Set([...userSkillSet, ...jobSkillSet]);
    const similarity = union.size > 0 ? (intersection.length / union.size) : 0;
    
    // Convert to percentage with weight for essential skills
    let score = similarity * 100;
    
    // Bonus for having required skills
    const requiredSkills = jobSkills.filter(s => this.isEssentialSkill(s));
    const hasRequired = requiredSkills.some(s => userSkillSet.has(s.toLowerCase()));
    if (hasRequired) score += 20;
    
    return Math.min(100, Math.round(score));
  }

  calculateSkillGap(userSkills, jobSkills) {
    const userSkillSet = new Set(userSkills.map(s => s.toLowerCase()));
    const jobSkillSet = new Set(jobSkills.map(s => s.toLowerCase()));
    
    const missing = [...jobSkillSet].filter(skill => !userSkillSet.has(skill));
    const matching = [...userSkillSet].filter(skill => jobSkillSet.has(skill));
    
    return {
      missing: missing.slice(0, 5), // Top 5 missing skills
      matching,
      gapPercentage: jobSkills.length > 0 ? (missing.length / jobSkills.length) * 100 : 0
    };
  }

  extractSkillsFromJob(job) {
    const text = `${job.title} ${job.description} ${job.skills.join(' ')}`.toLowerCase();
    
    // Extract known skills from text
    const extractedSkills = [];
    
    this.skillDatabase.forEach(skill => {
      if (text.includes(skill.toLowerCase())) {
        extractedSkills.push(skill);
      }
    });
    
    // Extract additional skills using NLP
    const tokens = this.tokenizer.tokenize(text);
    const filteredTokens = stopword.removeStopwords(tokens);
    
    // Look for technical terms (simple approach)
    const technicalTerms = filteredTokens.filter(token => {
      return token.length > 3 && 
             /^[a-zA-Z]+$/.test(token) &&
             this.isLikelySkill(token);
    });
    
    const uniqueSkills = [...new Set([...extractedSkills, ...technicalTerms])];
    return uniqueSkills.slice(0, 15); // Limit to 15 skills
  }

  buildQueryFromSkills(skills) {
    if (skills.length === 0) return 'software developer';
    
    // Take top 3 skills for query
    const topSkills = skills.slice(0, 3).join(' ');
    return topSkills || 'software developer';
  }

  calculateConfidence(matchScore) {
    if (matchScore >= 80) return 'high';
    if (matchScore >= 60) return 'medium';
    return 'low';
  }

  getRecommendedAction(matchScore, missingSkills) {
    if (matchScore >= 80) {
      return 'Apply now - strong match!';
    } else if (matchScore >= 60) {
      return `Apply after learning: ${missingSkills.slice(0, 2).join(', ')}`;
    } else {
      return `Focus on learning: ${missingSkills.slice(0, 3).join(', ')}`;
    }
  }

  isEssentialSkill(skill) {
    const essentialSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'aws',
      'docker', 'sql', 'machine learning', 'devops', 'typescript'
    ];
    return essentialSkills.includes(skill.toLowerCase());
  }

  isLikelySkill(token) {
    // Common patterns for technical skills
    const skillPatterns = [
      /^[a-z]+\.js$/, // Framework patterns
      /^[a-z]+-?[a-z]*$/,
      /^[A-Z][a-z]+$/ // Capitalized terms
    ];
    
    return skillPatterns.some(pattern => pattern.test(token));
  }

  getSkillDatabase() {
    return [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
      'Spring', 'React Native', 'Next.js', 'TypeScript',
      'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
      'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Firebase',
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
      'Git', 'GitHub', 'GitLab', 'Jenkins', 'CI/CD',
      'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch',
      'DevOps', 'Agile', 'Scrum', 'REST', 'GraphQL', 'Microservices'
    ];
  }

  getFallbackJobs(userSkills) {
    // Return fallback jobs if no real jobs found
    const fallbackJobs = [
      {
        jobId: 'fb1',
        title: 'Full Stack Developer',
        company: 'Tech Company Inc.',
        location: 'Remote',
        description: 'Looking for a full stack developer with experience in modern web technologies.',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        salary: '$100,000 - $140,000',
        applyUrl: '#',
        postedDate: new Date(),
        remote: true,
        type: 'Full-time',
        source: 'system',
        matchScore: 75,
        skillGap: { missing: [], matching: userSkills, gapPercentage: 0 }
      },
      {
        jobId: 'fb2',
        title: 'Frontend Developer',
        company: 'Digital Solutions',
        location: 'Remote',
        description: 'Frontend developer position focusing on React and modern JavaScript.',
        skills: ['JavaScript', 'React', 'CSS', 'HTML'],
        salary: '$90,000 - $120,000',
        applyUrl: '#',
        postedDate: new Date(),
        remote: true,
        type: 'Full-time',
        source: 'system',
        matchScore: 85,
        skillGap: { missing: [], matching: userSkills, gapPercentage: 0 }
      }
    ];
    
    return fallbackJobs;
  }

  async getPersonalizedInsights(userSkills, location = 'remote') {
    const recommendations = await this.getJobRecommendations(userSkills, location, 5);
    
    if (recommendations.length === 0) {
      return {
        message: 'No job matches found. Consider updating your skills.',
        suggestedSkills: ['JavaScript', 'Python', 'React'],
        nextSteps: ['Complete a React course', 'Build a portfolio project']
      };
    }

    const topJob = recommendations[0];
    const avgMatchScore = recommendations.reduce((sum, job) => sum + job.matchScore, 0) / recommendations.length;
    
    // Analyze skill gaps across all recommendations
    const allMissingSkills = new Set();
    recommendations.forEach(job => {
      job.skillGap.missing.forEach(skill => allMissingSkills.add(skill));
    });

    return {
      topMatch: {
        title: topJob.title,
        company: topJob.company,
        matchScore: topJob.matchScore
      },
      averageMatchScore: Math.round(avgMatchScore),
      inDemandSkills: this.getTopSkillsFromJobs(recommendations),
      skillGaps: Array.from(allMissingSkills).slice(0, 5),
      recommendedLearning: this.getLearningResources(Array.from(allMissingSkills)),
      marketTrend: avgMatchScore >= 70 ? 'Your skills are in high demand!' : 'Consider adding more in-demand skills'
    };
  }

  getTopSkillsFromJobs(jobs) {
    const skillFrequency = {};
    
    jobs.forEach(job => {
      job.requiredSkills.forEach(skill => {
        skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
      });
    });
    
    return Object.entries(skillFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill]) => skill);
  }

  getLearningResources(skills) {
    const resources = {
      'JavaScript': 'MDN JavaScript Guide, freeCodeCamp JavaScript course',
      'React': 'React official docs, Scrimba React course',
      'Python': 'Python.org tutorial, Automate the Boring Stuff',
      'Node.js': 'Node.js documentation, The Net Ninja YouTube series',
      'AWS': 'AWS Free Tier, AWS Certified Solutions Architect course'
    };
    
    return skills.map(skill => ({
      skill,
      resources: resources[skill] || 'Check Udemy or Coursera for courses'
    }));
  }
}

module.exports = new JobMatcher();