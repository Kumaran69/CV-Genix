import { API } from "./api.js";

/**
 * Fetch job recommendations based on user skills.
 * Falls back to mock data if backend route doesn't exist yet.
 */
export const getJobRecommendations = async (token, skills = []) => {
  try {
    const res = await API.post("/jobs/recommendations", { skills });
    if (res.data) return res;
    throw new Error("Empty response");
  } catch {
    return { data: { jobs: getMockJobs() } };
  }
};

/**
 * Fetch market analytics based on user skills.
 * Falls back to mock data if backend route doesn't exist yet.
 */
export const getMarketAnalytics = async (token, skills = []) => {
  try {
    const res = await API.post("/market/analytics", { skills });
    if (res.data) return res;
    throw new Error("Empty response");
  } catch {
    return { data: getMockAnalytics() };
  }
};

// ── Mock data (used until backend routes are implemented) ──────────────────

const getMockJobs = () => [
  {
    _id: "mock-1",
    title: "Frontend Developer",
    company: "TechCorp",
    location: "Remote",
    salary: "$80,000 - $110,000",
    type: "Full-time",
    matchScore: 92,
    postedAt: new Date(Date.now() - 86400000).toISOString(),
    description: "Build modern web interfaces using React and Tailwind CSS.",
    tags: ["React", "JavaScript", "Tailwind"],
    applyUrl: "#",
  },
  {
    _id: "mock-2",
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    location: "Bangalore, IN",
    salary: "$70,000 - $95,000",
    type: "Full-time",
    matchScore: 85,
    postedAt: new Date(Date.now() - 172800000).toISOString(),
    description: "Work on both frontend and backend with Node.js and React.",
    tags: ["Node.js", "React", "MongoDB"],
    applyUrl: "#",
  },
  {
    _id: "mock-3",
    title: "UI/UX Engineer",
    company: "DesignStudio",
    location: "Chennai, IN",
    salary: "$60,000 - $85,000",
    type: "Contract",
    matchScore: 78,
    postedAt: new Date(Date.now() - 259200000).toISOString(),
    description: "Design and implement beautiful user interfaces.",
    tags: ["Figma", "React", "CSS"],
    applyUrl: "#",
  },
  {
    _id: "mock-4",
    title: "React Native Developer",
    company: "MobileFirst",
    location: "Remote",
    salary: "$75,000 - $100,000",
    type: "Full-time",
    matchScore: 74,
    postedAt: new Date(Date.now() - 345600000).toISOString(),
    description: "Build cross-platform mobile apps with React Native.",
    tags: ["React Native", "JavaScript", "iOS"],
    applyUrl: "#",
  },
];

const getMockAnalytics = () => ({
  demandScore: 78,
  averageSalary: 95000,
  jobGrowth: 23,
  trendingSkills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker"],
  topLocations: [
    { city: "Bangalore", jobs: 1240 },
    { city: "Remote", jobs: 980 },
    { city: "Chennai", jobs: 560 },
    { city: "Hyderabad", jobs: 430 },
  ],
  salaryBySkill: [
    { skill: "React", salary: 95000 },
    { skill: "Node.js", salary: 90000 },
    { skill: "Python", salary: 105000 },
    { skill: "TypeScript", salary: 98000 },
    { skill: "AWS", salary: 115000 },
  ],
  demandByMonth: [
    { month: "Sep", demand: 62 },
    { month: "Oct", demand: 68 },
    { month: "Nov", demand: 71 },
    { month: "Dec", demand: 65 },
    { month: "Jan", demand: 74 },
    { month: "Feb", demand: 78 },
  ],
});