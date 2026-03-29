// services/jobService.js
// ─────────────────────────────────────────────────────────────────────────────
// No backend endpoints for market/jobs exist — these functions return
// realistic computed data so the Dashboard works without 404 errors.
// ─────────────────────────────────────────────────────────────────────────────

// ── Skill → salary lookup ─────────────────────────────────────────────────
const SKILL_SALARY_MAP = {
  react: 125000,        nextjs: 130000,       vue: 115000,
  angular: 118000,      typescript: 128000,   javascript: 110000,
  nodejs: 122000,       python: 132000,       django: 118000,
  fastapi: 125000,      java: 120000,         spring: 125000,
  "c#": 118000,         dotnet: 120000,       golang: 140000,
  rust: 145000,         kotlin: 122000,       swift: 135000,
  flutter: 118000,      "react native": 120000,
  aws: 138000,          azure: 135000,        gcp: 140000,
  docker: 128000,       kubernetes: 142000,   terraform: 138000,
  postgresql: 115000,   mongodb: 118000,      mysql: 112000,
  redis: 122000,        elasticsearch: 125000,
  graphql: 128000,      "rest api": 115000,
  pytorch: 145000,      tensorflow: 142000,   "machine learning": 148000,
  "data science": 138000, sql: 108000,
};

const HIGH_DEMAND_SKILLS = [
  "react", "typescript", "python", "aws", "kubernetes",
  "golang", "rust", "nextjs", "pytorch", "terraform",
];

const TRENDING_SKILLS_POOL = [
  "AI/ML", "TypeScript", "Rust", "Go", "Kubernetes",
  "React", "Next.js", "Python", "AWS", "Docker",
  "GraphQL", "Terraform", "Swift", "Kotlin", "PostgreSQL",
];

const JOB_TEMPLATES = [
  {
    title: "Senior Frontend Engineer",       company: "Stripe",
    location: "Remote",                      type: "Full-time",
    salaryMin: 140000, salaryMax: 180000,
    relevantSkills: ["react", "typescript", "nextjs", "javascript"],
    description: "Build beautiful, performant UIs for millions of users worldwide.",
  },
  {
    title: "Full Stack Developer",           company: "Notion",
    location: "San Francisco, CA",           type: "Full-time",
    salaryMin: 130000, salaryMax: 165000,
    relevantSkills: ["react", "nodejs", "typescript", "postgresql"],
    description: "Own features end-to-end across our web and desktop apps.",
  },
  {
    title: "Backend Engineer",               company: "Vercel",
    location: "Remote",                      type: "Full-time",
    salaryMin: 135000, salaryMax: 175000,
    relevantSkills: ["nodejs", "golang", "docker", "aws", "postgresql"],
    description: "Scale infrastructure serving billions of deployments per month.",
  },
  {
    title: "Software Engineer II",           company: "Linear",
    location: "Remote",                      type: "Full-time",
    salaryMin: 125000, salaryMax: 160000,
    relevantSkills: ["typescript", "react", "nodejs", "graphql"],
    description: "Shape the future of project management tooling for engineering teams.",
  },
  {
    title: "ML Engineer",                    company: "Hugging Face",
    location: "Remote",                      type: "Full-time",
    salaryMin: 150000, salaryMax: 200000,
    relevantSkills: ["python", "pytorch", "tensorflow", "machine learning"],
    description: "Build and deploy state-of-the-art ML models used by thousands of companies.",
  },
  {
    title: "DevOps Engineer",                company: "HashiCorp",
    location: "Remote",                      type: "Full-time",
    salaryMin: 138000, salaryMax: 172000,
    relevantSkills: ["kubernetes", "terraform", "aws", "docker", "golang"],
    description: "Improve infrastructure reliability and developer experience globally.",
  },
  {
    title: "React Native Developer",         company: "Shopify",
    location: "Remote",                      type: "Full-time",
    salaryMin: 120000, salaryMax: 158000,
    relevantSkills: ["react native", "typescript", "javascript", "react"],
    description: "Build cross-platform mobile experiences for millions of merchants.",
  },
  {
    title: "Data Engineer",                  company: "Databricks",
    location: "New York, NY",               type: "Full-time",
    salaryMin: 142000, salaryMax: 185000,
    relevantSkills: ["python", "sql", "aws", "postgresql"],
    description: "Design and maintain data pipelines powering AI-driven analytics.",
  },
  {
    title: "iOS Engineer",                   company: "Airbnb",
    location: "San Francisco, CA",           type: "Full-time",
    salaryMin: 145000, salaryMax: 188000,
    relevantSkills: ["swift", "kotlin", "ios"],
    description: "Craft delightful native experiences for 150M+ guests worldwide.",
  },
  {
    title: "Platform Engineer",              company: "PlanetScale",
    location: "Remote",                      type: "Full-time",
    salaryMin: 132000, salaryMax: 170000,
    relevantSkills: ["golang", "kubernetes", "mysql", "docker", "aws"],
    description: "Build the most scalable database platform in the world.",
  },
];

// ── Pure helpers ──────────────────────────────────────────────────────────

function normalizeSkills(skills = []) {
  return skills
    .map((s) => (typeof s === "string" ? s : s?.name || "").toLowerCase().trim())
    .filter(Boolean);
}

function matchScore(jobSkills = [], userSkills = []) {
  if (userSkills.length === 0) return Math.floor(Math.random() * 30 + 55);
  const matched = jobSkills.filter((s) =>
    userSkills.some((u) => u.includes(s) || s.includes(u))
  );
  const base = Math.round((matched.length / Math.max(jobSkills.length, 1)) * 100);
  return Math.min(99, Math.max(50, base + Math.floor(Math.random() * 12)));
}

function avgSalaryForSkills(userSkills = []) {
  const salaries = userSkills.map((s) => SKILL_SALARY_MAP[s]).filter(Boolean);
  if (salaries.length === 0) return 105000;
  return Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length);
}

function demandScore(userSkills = []) {
  const matches = userSkills.filter((s) =>
    HIGH_DEMAND_SKILLS.some((h) => s.includes(h) || h.includes(s))
  ).length;
  return Math.min(98, Math.round((matches / Math.max(userSkills.length, 1)) * 100) + 45);
}

// ── Build salaryBySkill — top 6 skills the user has with known salaries ──
function buildSalaryBySkill(userSkills = []) {
  const entries = userSkills
    .map((s) => {
      // Find best matching key
      const key = Object.keys(SKILL_SALARY_MAP).find(
        (k) => k === s || s.includes(k) || k.includes(s)
      );
      return key ? { skill: s.charAt(0).toUpperCase() + s.slice(1), salary: SKILL_SALARY_MAP[key] } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.salary - a.salary)
    .slice(0, 6);

  // If user has < 3 known skills, pad with generic entries
  const fallbacks = [
    { skill: "JavaScript", salary: 110000 },
    { skill: "Python",     salary: 132000 },
    { skill: "React",      salary: 125000 },
    { skill: "Node.js",    salary: 122000 },
    { skill: "TypeScript", salary: 128000 },
    { skill: "AWS",        salary: 138000 },
  ];
  const combined = [...entries];
  for (const fb of fallbacks) {
    if (combined.length >= 6) break;
    if (!combined.find((e) => e.skill.toLowerCase() === fb.skill.toLowerCase())) {
      combined.push(fb);
    }
  }
  return combined.slice(0, 6);
}

// ── Build demandByMonth — 6-month rolling window ──────────────────────────
function buildDemandByMonth(baseScore = 70) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now    = new Date().getMonth(); // 0-indexed
  return Array.from({ length: 6 }, (_, i) => {
    const monthIdx = (now - 5 + i + 12) % 12;
    // Slight upward trend with random variance
    const variance = Math.floor(Math.random() * 10) - 3;
    const demand   = Math.min(98, Math.max(40, baseScore - 10 + i * 2 + variance));
    return { month: months[monthIdx], demand };
  });
}

// ── Build topLocations with job counts ────────────────────────────────────
function buildTopLocations(openRoles = 5000) {
  return [
    { city: "Remote",          jobs: Math.round(openRoles * 0.38) },
    { city: "San Francisco",   jobs: Math.round(openRoles * 0.22) },
    { city: "New York",        jobs: Math.round(openRoles * 0.18) },
    { city: "Austin",          jobs: Math.round(openRoles * 0.12) },
    { city: "Seattle",         jobs: Math.round(openRoles * 0.10) },
  ];
}

// ── Build trendingSkills — user-matching first, then pool ─────────────────
function buildTrendingSkills(userSkills = []) {
  const userMatches = TRENDING_SKILLS_POOL.filter((t) =>
    userSkills.some((u) => u.includes(t.toLowerCase()) || t.toLowerCase().includes(u))
  );
  const rest = TRENDING_SKILLS_POOL.filter((t) => !userMatches.includes(t));
  return [...userMatches, ...rest].slice(0, 8);
}

// ── Exported service functions ────────────────────────────────────────────

/**
 * getJobRecommendations
 * Returns skill-matched job listings — no backend required.
 */
export const getJobRecommendations = async (token, skills = []) => {
  const userSkills = normalizeSkills(skills);

  const jobs = JOB_TEMPLATES.map((job, i) => {
    const score = matchScore(job.relevantSkills, userSkills);
    const matchedSkills = job.relevantSkills.filter((s) =>
      userSkills.some((u) => u.includes(s) || s.includes(u))
    );
    const missingSkills = job.relevantSkills.filter(
      (s) => !matchedSkills.includes(s)
    );
    return {
      id:            `job_${i + 1}`,
      title:         job.title,
      company:       job.company,
      location:      job.location,
      type:          job.type,
      salaryMin:     job.salaryMin,
      salaryMax:     job.salaryMax,
      matchScore:    score,
      matchedSkills,
      missingSkills,
      description:   job.description,
      postedDays:    Math.floor(Math.random() * 14) + 1,
      applicants:    Math.floor(Math.random() * 300) + 20,
      isHot:         score >= 80,
      isEasyApply:   i % 3 === 0,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  return { data: { jobs } };
};

/**
 * getMarketAnalytics
 * Returns all fields MarketDashboard.jsx consumes — no backend required.
 *
 * Returned shape:
 * {
 *   demandScore:    number,
 *   averageSalary:  number,
 *   jobGrowth:      number,
 *   openRoles:      number,
 *   trendingSkills: string[],
 *   salaryBySkill:  { skill, salary }[],      ← bar chart
 *   demandByMonth:  { month, demand }[],      ← bar chart
 *   topLocations:   { city, jobs }[],         ← bar chart
 *   salaryRange:    { min, max },
 * }
 */
export const getMarketAnalytics = async (token, skills = []) => {
  const userSkills    = normalizeSkills(skills);
  const averageSalary = avgSalaryForSkills(userSkills);
  const demand        = demandScore(userSkills);
  const openRoles     = Math.floor(demand * 142);

  return {
    data: {
      demandScore:    demand,
      averageSalary,
      jobGrowth:      18,                               // shown as "+18%" in KPI strip
      openRoles,
      trendingSkills: buildTrendingSkills(userSkills),  // string[] for chip display
      salaryBySkill:  buildSalaryBySkill(userSkills),   // { skill, salary }[] for bar chart
      demandByMonth:  buildDemandByMonth(demand),        // { month, demand }[] for bar chart
      topLocations:   buildTopLocations(openRoles),      // { city, jobs }[] for bar chart
      salaryRange: {
        min: Math.round(averageSalary * 0.75),
        max: Math.round(averageSalary * 1.35),
      },
    },
  };
};