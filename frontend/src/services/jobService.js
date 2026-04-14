// frontend/src/services/jobService.js
// ✅ All Anthropic calls go through YOUR backend at /api/ai/anthropic
//    Never call https://api.anthropic.com directly from the frontend.

const API_BASE = "http://localhost:5000";

// ── Helper: call YOUR backend AI proxy ────────────────────────────────
async function callAI(prompt) {
  const res = await fetch(`${API_BASE}/api/ai/anthropic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages:   [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`AI proxy error: ${res.status}`);
  const data = await res.json();

  // Extract text from response
  const text = data.content
    ?.filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("") || "";

  return text;
}

// ── Parse JSON safely from AI response ────────────────────────────────
function parseJSON(text, fallback) {
  try {
    const match = text.match(/```json\s*([\s\S]*?)```/) ||
                  text.match(/\{[\s\S]*\}/) ||
                  text.match(/\[[\s\S]*\]/);
    return JSON.parse(match ? match[1] || match[0] : text);
  } catch {
    return fallback;
  }
}

// ── Get Job Recommendations ────────────────────────────────────────────
export async function getJobRecommendations(token, skills = []) {
  try {
    const skillList = skills.slice(0, 10).join(", ");

    const text = await callAI(
      `Based on these skills: ${skillList || "general programming"}, 
      generate 6 realistic job recommendations. 
      Return ONLY a JSON object: { "jobs": [ { "id": "1", "title": "...", "company": "...", 
      "location": "...", "salary": "...", "match": 85, "skills": ["skill1"], 
      "description": "...", "type": "Full-time" } ] }`
    );

    const parsed = parseJSON(text, { jobs: getDefaultJobs(skills) });
    return { data: { jobs: parsed.jobs || getDefaultJobs(skills) } };
  } catch (err) {
    console.error("Job fetch error:", err);
    return { data: { jobs: getDefaultJobs(skills) } };
  }
}

// ── Get Market Analytics ───────────────────────────────────────────────
export async function getMarketAnalytics(token, skills = []) {
  try {
    const skillList = skills.slice(0, 8).join(", ");

    const text = await callAI(
      `Analyze job market demand for these skills: ${skillList || "software development"}.
      Return ONLY a JSON object: { "demandScore": 78, "averageSalary": 95000, 
      "trendingSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "growthRate": 12, "topIndustries": ["Tech", "Finance", "Healthcare"] }`
    );

    const parsed = parseJSON(text, getDefaultMarket());
    return { data: parsed };
  } catch (err) {
    console.error("Market fetch error:", err);
    return { data: getDefaultMarket() };
  }
}

// ── Fallback data (shown when AI is unavailable) ───────────────────────
function getDefaultJobs(skills = []) {
  return [
    { id: "1", title: "Software Engineer",       company: "TechCorp",     location: "Remote",        salary: "$90k–$120k", match: 88, skills: skills.slice(0,3), description: "Build scalable web applications.",   type: "Full-time" },
    { id: "2", title: "Frontend Developer",      company: "StartupXYZ",   location: "Bangalore, IN", salary: "$70k–$95k",  match: 82, skills: skills.slice(0,2), description: "Create beautiful user interfaces.",    type: "Full-time" },
    { id: "3", title: "Full Stack Developer",    company: "ProductCo",    location: "Remote",        salary: "$85k–$115k", match: 79, skills: skills.slice(0,4), description: "End-to-end feature development.",      type: "Full-time" },
    { id: "4", title: "React Developer",         company: "DigitalAgency",location: "Chennai, IN",   salary: "$65k–$90k",  match: 75, skills: ["React", "JS"],    description: "Build React-based SPA applications.",  type: "Contract" },
    { id: "5", title: "Backend Engineer",        company: "CloudSystems", location: "Remote",        salary: "$95k–$130k", match: 72, skills: ["Node.js","API"],   description: "Design RESTful APIs and microservices.",type: "Full-time"},
    { id: "6", title: "MERN Stack Developer",    company: "WebStudio",    location: "Remote",        salary: "$75k–$100k", match: 70, skills: ["MongoDB","React"], description: "Full-stack MERN development.",         type: "Full-time" },
  ];
}

function getDefaultMarket() {
  return {
    demandScore:    75,
    averageSalary:  85000,
    trendingSkills: ["React", "Node.js", "TypeScript", "AWS", "Python"],
    growthRate:     10,
    topIndustries:  ["Technology", "Finance", "Healthcare"],
  };
}