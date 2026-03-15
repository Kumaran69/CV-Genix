// ============================================================================
// ATS Service - Applicant Tracking System Analysis
// ============================================================================

/**
 * Calculate ATS compatibility score for a resume
 * @param {Object} resume - Resume object with all sections
 * @returns {Object} - ATS analysis with score and suggestions
 */
export const calculateATSScore = (resume) => {
  if (!resume) return getEmptyScore();

  const scores = {
    contact: analyzeContactInfo(resume.personal),
    experience: analyzeExperience(resume.experience),
    education: analyzeEducation(resume.education),
    skills: analyzeSkills(resume.skills),
    formatting: analyzeFormatting(resume),
    keywords: analyzeKeywords(resume),
    sections: analyzeSections(resume),
  };

  const totalScore = Math.round(
    scores.contact.score * 0.15 +
    scores.experience.score * 0.25 +
    scores.education.score * 0.15 +
    scores.skills.score * 0.20 +
    scores.formatting.score * 0.10 +
    scores.keywords.score * 0.10 +
    scores.sections.score * 0.05
  );

  return {
    totalScore,
    scores,
    grade: getGrade(totalScore),
    suggestions: generateSuggestions(scores),
    passesATS: totalScore >= 75,
  };
};

// ── Contact Info Analysis ──────────────────────────────────────────────────
const analyzeContactInfo = (personal) => {
  if (!personal) return { score: 0, issues: ['Missing contact information'] };

  let score = 0;
  const issues = [];
  const strengths = [];

  // Name (required)
  if (personal.name && personal.name.trim().length > 0) {
    score += 30;
    strengths.push('Full name provided');
  } else {
    issues.push('Missing full name');
  }

  // Email (required)
  if (personal.email && isValidEmail(personal.email)) {
    score += 30;
    strengths.push('Valid email address');
  } else {
    issues.push('Missing or invalid email');
  }

  // Phone (required)
  if (personal.phone && personal.phone.trim().length >= 10) {
    score += 20;
    strengths.push('Phone number included');
  } else {
    issues.push('Missing phone number');
  }

  // Location (recommended)
  if (personal.location || personal.city || personal.address) {
    score += 10;
    strengths.push('Location information provided');
  } else {
    issues.push('Consider adding location (city, state)');
  }

  // LinkedIn (bonus)
  if (personal.linkedin && personal.linkedin.includes('linkedin.com')) {
    score += 10;
    strengths.push('LinkedIn profile linked');
  }

  return { score: Math.min(score, 100), issues, strengths };
};

// ── Experience Analysis ────────────────────────────────────────────────────
const analyzeExperience = (experience) => {
  if (!experience || !Array.isArray(experience) || experience.length === 0) {
    return { score: 0, issues: ['No work experience added'] };
  }

  let score = 0;
  const issues = [];
  const strengths = [];

  // Has experience entries
  if (experience.length > 0) {
    score += 20;
    strengths.push(`${experience.length} work experience entr${experience.length > 1 ? 'ies' : 'y'}`);
  }

  // Check each experience entry
  let completeEntries = 0;
  let hasActionVerbs = 0;
  let hasQuantifiableResults = 0;

  experience.forEach((exp) => {
    let entryComplete = true;

    // Job title
    if (!exp.position || exp.position.trim().length === 0) {
      entryComplete = false;
    }

    // Company name
    if (!exp.company || exp.company.trim().length === 0) {
      entryComplete = false;
    }

    // Dates
    if (!exp.startDate) {
      entryComplete = false;
    }

    // Description/achievements
    if (exp.description && exp.description.length > 0) {
      score += 10;
      
      // Check for action verbs
      const actionVerbs = [
        'achieved', 'managed', 'led', 'developed', 'created', 'improved',
        'increased', 'decreased', 'implemented', 'designed', 'built',
        'launched', 'coordinated', 'analyzed', 'optimized', 'streamlined'
      ];
      
      const hasVerb = actionVerbs.some(verb => 
        exp.description.toLowerCase().includes(verb)
      );
      
      if (hasVerb) {
        hasActionVerbs++;
      }

      // Check for quantifiable results (numbers, percentages)
      const hasNumbers = /\d+%|\d+\+|\$\d+|[0-9]{1,3}(,[0-9]{3})*/.test(exp.description);
      if (hasNumbers) {
        hasQuantifiableResults++;
      }
    }

    if (entryComplete) completeEntries++;
  });

  // Score for complete entries
  const completionRate = (completeEntries / experience.length) * 100;
  score += Math.round(completionRate * 0.3);

  if (completionRate === 100) {
    strengths.push('All experience entries complete');
  } else {
    issues.push(`${experience.length - completeEntries} incomplete experience entr${experience.length - completeEntries > 1 ? 'ies' : 'y'}`);
  }

  // Bonus for action verbs
  if (hasActionVerbs >= experience.length * 0.5) {
    score += 15;
    strengths.push('Strong action verbs used');
  } else {
    issues.push('Use more action verbs (achieved, managed, led, etc.)');
  }

  // Bonus for quantifiable results
  if (hasQuantifiableResults >= experience.length * 0.5) {
    score += 15;
    strengths.push('Quantifiable achievements included');
  } else {
    issues.push('Add measurable results (percentages, numbers, metrics)');
  }

  // Recent experience
  const hasRecentExperience = experience.some(exp => {
    if (!exp.endDate || exp.endDate.toLowerCase().includes('present')) return true;
    const endYear = new Date(exp.endDate).getFullYear();
    return endYear >= new Date().getFullYear() - 2;
  });

  if (hasRecentExperience) {
    score += 10;
    strengths.push('Recent/current experience included');
  }

  return { score: Math.min(score, 100), issues, strengths };
};

// ── Education Analysis ─────────────────────────────────────────────────────
const analyzeEducation = (education) => {
  if (!education || !Array.isArray(education) || education.length === 0) {
    return { score: 50, issues: ['No education listed - may be required for some positions'] };
  }

  let score = 40; // Base score for having education
  const issues = [];
  const strengths = [];

  strengths.push(`${education.length} education entr${education.length > 1 ? 'ies' : 'y'} listed`);

  let completeEntries = 0;

  education.forEach((edu) => {
    let entryComplete = true;

    if (!edu.degree || edu.degree.trim().length === 0) {
      entryComplete = false;
    }

    if (!edu.institution || edu.institution.trim().length === 0) {
      entryComplete = false;
    }

    if (!edu.graduationDate && !edu.endDate) {
      entryComplete = false;
    }

    if (entryComplete) {
      completeEntries++;
      score += 15;
    }

    // Bonus for GPA if high
    if (edu.gpa && parseFloat(edu.gpa) >= 3.5) {
      score += 5;
      strengths.push('Strong GPA included');
    }

    // Bonus for relevant coursework or honors
    if (edu.honors || edu.coursework) {
      score += 5;
    }
  });

  if (completeEntries < education.length) {
    issues.push(`${education.length - completeEntries} incomplete education entr${education.length - completeEntries > 1 ? 'ies' : 'y'}`);
  }

  return { score: Math.min(score, 100), issues, strengths };
};

// ── Skills Analysis ────────────────────────────────────────────────────────
const analyzeSkills = (skills) => {
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return { score: 0, issues: ['No skills listed - critical for ATS matching'] };
  }

  let score = 0;
  const issues = [];
  const strengths = [];

  // Number of skills
  if (skills.length >= 8 && skills.length <= 20) {
    score += 40;
    strengths.push(`${skills.length} skills listed (ideal range)`);
  } else if (skills.length >= 5 && skills.length < 8) {
    score += 25;
    strengths.push(`${skills.length} skills listed`);
    issues.push('Consider adding 3-5 more relevant skills');
  } else if (skills.length > 20) {
    score += 20;
    strengths.push(`${skills.length} skills listed`);
    issues.push('Too many skills listed - focus on most relevant (8-20)');
  } else {
    score += 10;
    issues.push(`Only ${skills.length} skills - add more relevant skills (aim for 8-20)`);
  }

  // Check for skill categories (technical, soft skills, tools)
  const hasCategories = skills.some(skill => 
    typeof skill === 'object' && skill.category
  );

  if (hasCategories) {
    score += 20;
    strengths.push('Skills organized by category');
  } else {
    score += 10; // Still give some points even without categories
  }

  // Check for proficiency levels
  const hasProficiency = skills.some(skill => 
    typeof skill === 'object' && (skill.level || skill.proficiency)
  );

  if (hasProficiency) {
    score += 20;
    strengths.push('Skill proficiency levels indicated');
  } else {
    score += 10; // Still give some points
  }

  // Check for industry-standard skills
  const skillNames = skills.map(s => 
    typeof s === 'string' ? s.toLowerCase() : (s.name || '').toLowerCase()
  );

  const hasIndustrySkills = skillNames.some(name => 
    name.includes('python') || name.includes('java') || name.includes('react') ||
    name.includes('sql') || name.includes('aws') || name.includes('excel') ||
    name.includes('leadership') || name.includes('communication')
  );

  if (hasIndustrySkills) {
    score += 20;
    strengths.push('Industry-relevant skills included');
  }

  return { score: Math.min(score, 100), issues, strengths };
};

// ── Formatting Analysis ────────────────────────────────────────────────────
const analyzeFormatting = (resume) => {
  let score = 60; // Base score for standard structure
  const issues = [];
  const strengths = [];

  strengths.push('Standard resume structure');

  // Check for problematic elements
  const problematicFormats = [];

  // Tables (can cause ATS issues)
  if (resume.usesTable) {
    score -= 15;
    issues.push('Tables may not parse well in ATS - use simple formatting');
  }

  // Special characters
  if (resume.personal?.name && /[^\w\s\-']/.test(resume.personal.name)) {
    score -= 5;
    issues.push('Special characters in name may cause parsing issues');
  }

  // Check for standard sections
  const hasSections = {
    contact: resume.personal && (resume.personal.email || resume.personal.phone),
    experience: resume.experience && resume.experience.length > 0,
    education: resume.education && resume.education.length > 0,
    skills: resume.skills && resume.skills.length > 0,
  };

  const sectionCount = Object.values(hasSections).filter(Boolean).length;
  
  if (sectionCount >= 4) {
    score += 20;
    strengths.push('All major sections present');
  } else {
    issues.push(`Missing ${4 - sectionCount} major section(s)`);
  }

  // File naming (if template is specified)
  if (resume.template && resume.template !== 'default') {
    score += 10;
    strengths.push('Professional template selected');
  }

  // Length check
  const estimatedLength = (
    (resume.experience?.length || 0) +
    (resume.education?.length || 0) +
    (resume.skills?.length || 0) +
    (resume.projects?.length || 0)
  );

  if (estimatedLength >= 5 && estimatedLength <= 15) {
    score += 10;
    strengths.push('Appropriate content length');
  } else if (estimatedLength < 5) {
    issues.push('Resume may be too brief - add more relevant content');
  } else if (estimatedLength > 20) {
    issues.push('Resume may be too long - keep it concise (1-2 pages)');
  }

  return { score: Math.min(score, 100), issues, strengths };
};

// ── Keyword Analysis ───────────────────────────────────────────────────────
const analyzeKeywords = (resume) => {
  let score = 50; // Base score
  const issues = [];
  const strengths = [];

  // Extract all text from resume
  const allText = extractAllText(resume).toLowerCase();

  // Industry keywords by category
  const keywordCategories = {
    technical: ['software', 'development', 'programming', 'engineering', 'technical', 'system', 'database', 'api'],
    management: ['managed', 'led', 'supervised', 'coordinated', 'directed', 'organized', 'team'],
    achievement: ['achieved', 'improved', 'increased', 'decreased', 'optimized', 'enhanced', 'delivered'],
    skills: ['python', 'java', 'react', 'sql', 'excel', 'leadership', 'communication', 'problem-solving'],
  };

  let keywordCount = 0;
  const foundCategories = [];

  Object.entries(keywordCategories).forEach(([category, keywords]) => {
    const found = keywords.filter(kw => allText.includes(kw));
    if (found.length > 0) {
      keywordCount += found.length;
      foundCategories.push(category);
    }
  });

  if (keywordCount >= 15) {
    score += 30;
    strengths.push(`Strong keyword presence (${keywordCount} industry keywords)`);
  } else if (keywordCount >= 8) {
    score += 15;
    strengths.push(`Good keyword presence (${keywordCount} keywords)`);
  } else {
    score += 5;
    issues.push(`Low keyword count (${keywordCount}) - add more industry-relevant terms`);
  }

  // Check for action verbs
  const actionVerbs = ['achieved', 'managed', 'led', 'developed', 'created', 'improved', 'increased'];
  const actionVerbCount = actionVerbs.filter(verb => allText.includes(verb)).length;

  if (actionVerbCount >= 5) {
    score += 20;
    strengths.push('Strong use of action verbs');
  } else {
    issues.push('Add more action verbs to describe achievements');
  }

  return { score: Math.min(score, 100), issues, strengths, keywordCount, foundCategories };
};

// ── Section Analysis ───────────────────────────────────────────────────────
const analyzeSections = (resume) => {
  let score = 0;
  const issues = [];
  const strengths = [];

  const sections = {
    personal: resume.personal,
    experience: resume.experience,
    education: resume.education,
    skills: resume.skills,
    projects: resume.projects,
    certifications: resume.certifications,
    summary: resume.summary,
  };

  const requiredSections = ['personal', 'experience', 'education', 'skills'];
  const optionalSections = ['projects', 'certifications', 'summary'];

  // Check required sections
  let requiredCount = 0;
  requiredSections.forEach(section => {
    if (sections[section] && (Array.isArray(sections[section]) ? sections[section].length > 0 : Object.keys(sections[section]).length > 0)) {
      requiredCount++;
    }
  });

  score += (requiredCount / requiredSections.length) * 70;

  if (requiredCount === requiredSections.length) {
    strengths.push('All required sections present');
  } else {
    issues.push(`Missing ${requiredSections.length - requiredCount} required section(s)`);
  }

  // Check optional sections (bonus)
  let optionalCount = 0;
  optionalSections.forEach(section => {
    if (sections[section] && (Array.isArray(sections[section]) ? sections[section].length > 0 : sections[section])) {
      optionalCount++;
      score += 10;
    }
  });

  if (optionalCount > 0) {
    strengths.push(`${optionalCount} additional section(s) included`);
  }

  return { score: Math.min(score, 100), issues, strengths };
};

// ── Helper Functions ───────────────────────────────────────────────────────
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const extractAllText = (resume) => {
  let text = '';
  
  if (resume.personal) {
    text += Object.values(resume.personal).join(' ') + ' ';
  }
  
  if (resume.summary) {
    text += resume.summary + ' ';
  }
  
  if (resume.experience) {
    resume.experience.forEach(exp => {
      text += Object.values(exp).join(' ') + ' ';
    });
  }
  
  if (resume.education) {
    resume.education.forEach(edu => {
      text += Object.values(edu).join(' ') + ' ';
    });
  }
  
  if (resume.skills) {
    resume.skills.forEach(skill => {
      text += (typeof skill === 'string' ? skill : skill.name) + ' ';
    });
  }
  
  return text;
};

const getGrade = (score) => {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  return 'C-';
};

const generateSuggestions = (scores) => {
  const suggestions = [];
  
  // Priority suggestions based on lowest scores
  const sortedScores = Object.entries(scores)
    .sort((a, b) => a[1].score - b[1].score)
    .slice(0, 3);
  
  sortedScores.forEach(([category, data]) => {
    if (data.issues && data.issues.length > 0) {
      suggestions.push(...data.issues.map(issue => ({
        category,
        priority: data.score < 50 ? 'high' : data.score < 75 ? 'medium' : 'low',
        message: issue,
      })));
    }
  });
  
  return suggestions.slice(0, 5); // Top 5 suggestions
};

const getEmptyScore = () => ({
  totalScore: 0,
  scores: {},
  grade: 'N/A',
  suggestions: [{ category: 'general', priority: 'high', message: 'Start building your resume to get ATS analysis' }],
  passesATS: false,
});

// ── Keyword Suggestions ────────────────────────────────────────────────────
export const getKeywordSuggestions = (jobTitle, industry) => {
  const suggestions = {
    'software engineer': ['JavaScript', 'Python', 'React', 'Node.js', 'Git', 'Agile', 'REST API', 'SQL', 'AWS', 'Docker'],
    'data scientist': ['Python', 'R', 'Machine Learning', 'SQL', 'Statistics', 'TensorFlow', 'Pandas', 'Data Visualization', 'Big Data', 'A/B Testing'],
    'product manager': ['Product Strategy', 'Roadmap Planning', 'Agile', 'Stakeholder Management', 'Market Research', 'User Stories', 'KPIs', 'Cross-functional Leadership'],
    'marketing manager': ['Digital Marketing', 'SEO', 'Content Strategy', 'Social Media', 'Analytics', 'Campaign Management', 'Brand Strategy', 'Marketing Automation'],
    'business analyst': ['Requirements Gathering', 'Process Improvement', 'SQL', 'Data Analysis', 'Stakeholder Communication', 'Business Intelligence', 'Reporting', 'Documentation'],
    'ux designer': ['User Research', 'Wireframing', 'Prototyping', 'Figma', 'User Testing', 'Information Architecture', 'Design Systems', 'Interaction Design'],
    'default': ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration', 'Project Management', 'Time Management', 'Critical Thinking', 'Adaptability'],
  };

  const titleKey = (jobTitle || '').toLowerCase();
  const matchedKey = Object.keys(suggestions).find(key => titleKey.includes(key));
  
  return suggestions[matchedKey] || suggestions['default'];
};

// ── Export Optimization ────────────────────────────────────────────────────
export const getATSOptimizationTips = () => {
  return [
    {
      category: 'File Format',
      tip: 'Use .docx or .pdf format',
      description: 'Most ATS systems prefer Word documents or properly formatted PDFs',
    },
    {
      category: 'File Name',
      tip: 'Use format: FirstName_LastName_Resume.pdf',
      description: 'Clear naming helps recruiters identify your file',
    },
    {
      category: 'Fonts',
      tip: 'Use standard fonts (Arial, Calibri, Times New Roman)',
      description: 'Fancy fonts may not parse correctly in ATS',
    },
    {
      category: 'Headers/Footers',
      tip: 'Avoid headers and footers',
      description: 'Some ATS systems cannot read information in headers/footers',
    },
    {
      category: 'Graphics',
      tip: 'Minimize images and graphics',
      description: 'ATS cannot read text in images; use text-based content',
    },
    {
      category: 'Sections',
      tip: 'Use clear section headings',
      description: 'Use standard titles: Experience, Education, Skills',
    },
    {
      category: 'Dates',
      tip: 'Use consistent date format (MM/YYYY)',
      description: 'Helps ATS parse your timeline correctly',
    },
    {
      category: 'Keywords',
      tip: 'Match job description keywords',
      description: 'Use exact phrases from the job posting when applicable',
    },
  ];
};

// ── Industry-Specific Keywords ─────────────────────────────────────────────
export const getIndustryKeywords = (industry) => {
  const industries = {
    technology: {
      technical: ['Cloud Computing', 'API', 'Microservices', 'DevOps', 'CI/CD', 'Kubernetes', 'Docker', 'AWS', 'Azure'],
      soft: ['Agile', 'Scrum', 'Cross-functional', 'Innovation', 'Problem-solving'],
      trending: ['AI/ML', 'Blockchain', 'IoT', 'Cybersecurity', 'Edge Computing'],
    },
    finance: {
      technical: ['Financial Modeling', 'Excel', 'Bloomberg', 'SQL', 'Risk Analysis', 'Portfolio Management'],
      soft: ['Analytical Thinking', 'Attention to Detail', 'Regulatory Compliance', 'Client Relations'],
      trending: ['Fintech', 'Cryptocurrency', 'ESG', 'Quantitative Analysis'],
    },
    healthcare: {
      technical: ['EHR', 'HIPAA', 'Patient Care', 'Clinical Research', 'Healthcare IT'],
      soft: ['Empathy', 'Patient Advocacy', 'Team Collaboration', 'Critical Thinking'],
      trending: ['Telemedicine', 'Health Informatics', 'Value-Based Care', 'Population Health'],
    },
    marketing: {
      technical: ['SEO', 'SEM', 'Google Analytics', 'CRM', 'Marketing Automation', 'Content Management'],
      soft: ['Creative Thinking', 'Brand Strategy', 'Communication', 'Data-Driven'],
      trending: ['Influencer Marketing', 'Video Marketing', 'Personalization', 'Marketing AI'],
    },
  };

  return industries[industry?.toLowerCase()] || {
    technical: ['Project Management', 'Data Analysis', 'Communication'],
    soft: ['Leadership', 'Problem Solving', 'Team Collaboration'],
    trending: ['Digital Transformation', 'Remote Work', 'Sustainability'],
  };
};

export default {
  calculateATSScore,
  getKeywordSuggestions,
  getATSOptimizationTips,
  getIndustryKeywords,
};