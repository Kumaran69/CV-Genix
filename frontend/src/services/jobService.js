// frontend/src/services/jobService.js
// ✅ Using your backend API routes

const API_BASE = "http://localhost:5000";

// ── Get Job Recommendations from your backend ──────────────────────────
export async function getJobRecommendations(token, skills = []) {
  try {
    const response = await fetch(`${API_BASE}/api/ai/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        skills: skills,
        location: 'remote',
        limit: 20
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return { 
        data: { 
          jobs: data.jobs,
          insights: data.insights
        } 
      };
    } else {
      throw new Error(data.message || 'Failed to get recommendations');
    }
  } catch (err) {
    console.error("Job fetch error:", err);
    return { data: { jobs: getDefaultJobs(skills) } };
  }
}

// ── Get Market Analytics from your backend ─────────────────────────────
export async function getMarketAnalytics(token, skills = []) {
  try {
    const response = await fetch(`${API_BASE}/api/jobs/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        skills: skills,
        location: 'remote',
        limit: 5
      })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    
    if (data.success && data.insights) {
      return { data: data.insights };
    } else {
      return { data: getDefaultMarket() };
    }
  } catch (err) {
    console.error("Market fetch error:", err);
    return { data: getDefaultMarket() };
  }
}

// Fallback functions (same as above)
function getDefaultJobs(skills = []) {
  return [
    { id: "1", title: "Software Engineer", company: "TechCorp", location: "Remote", salary: "$90k–$120k", match: 88, skills: skills.slice(0,3), description: "Build scalable web applications.", type: "Full-time" },
    { id: "2", title: "Frontend Developer", company: "StartupXYZ", location: "Remote", salary: "$70k–$95k", match: 82, skills: skills.slice(0,2), description: "Create beautiful user interfaces.", type: "Full-time" }
  ];
}

function getDefaultMarket() {
  return {
    demandScore: 75,
    averageSalary: 85000,
    trendingSkills: ["React", "Node.js", "TypeScript", "AWS", "Python"],
    growthRate: 10,
    topIndustries: ["Technology", "Finance", "Healthcare"],
  };
}