import axios from "axios";

/* ── Base API instance ───────────────────────────────────────────────────── */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

/* ── Attach token from storage (auto on every request) ───────────────────── */
// Token is read from storage on every request so it's always fresh.
// Dashboard/ResumeBuilder pass token as a param too — that's fine,
// but the interceptor handles it automatically so no manual header needed.
API.interceptors.request.use((req) => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;

  if (import.meta.env.DEV) {
    console.log(`🚀 ${req.method.toUpperCase()} ${req.baseURL}${req.url}`, req.data);
  }
  return req;
});

/* ── Response interceptor ────────────────────────────────────────────────── */
API.interceptors.response.use(
  (res) => {
    if (import.meta.env.DEV) console.log(`✅ ${res.status} ${res.config.url}`, res.data);
    return res;
  },
  (err) => {
    if (err.response?.status === 401) console.error("❌ Unauthorized — token missing or expired.");
    if (err.response?.status === 404) console.error(`❌ Not found: ${err.config?.method?.toUpperCase()} ${err.config?.url}`);
    if (err.response?.status === 400) console.error("❌ Bad Request:", err.response.data);
    if (import.meta.env.DEV) {
      console.error("API Error:", {
        status:     err.response?.status,
        statusText: err.response?.statusText,
        data:       err.response?.data,
        url:        err.config?.url,
        method:     err.config?.method,
      });
    }
    return Promise.reject(err);
  }
);

/* ── Enum maps — must match MongoDB schema exactly ───────────────────────── */

// Schema: ["Beginner","Intermediate","Advanced","Expert"]
const LEVEL_MAP = {
  beginner:     "Beginner",
  intermediate: "Intermediate",
  advanced:     "Advanced",
  expert:       "Expert",
  competent:    "Intermediate",
  proficient:   "Intermediate",
  skilled:      "Intermediate",
  experienced:  "Expert",
  master:       "Expert",
};

// Schema: ["Programming","Framework","Database","Tool","Language","Soft Skill","Other"]
const CATEGORY_MAP = {
  programming:  "Programming",
  technical:    "Programming",
  framework:    "Framework",
  database:     "Database",
  tool:         "Tool",
  tools:        "Tool",
  language:     "Language",
  "soft skill": "Soft Skill",
  softskill:    "Soft Skill",
  soft:         "Soft Skill",
  hard:         "Programming",
  other:        "Other",
};

// Schema: ["Basic","Conversational","Professional","Native"]
const PROFICIENCY_MAP = {
  basic:           "Basic",
  beginner:        "Basic",
  elementary:      "Basic",
  conversational:  "Conversational",
  intermediate:    "Conversational",  // ✅ fixes `intermediate` not valid
  moderate:        "Conversational",
  professional:    "Professional",
  advanced:        "Professional",
  fluent:          "Professional",
  proficient:      "Professional",
  skilled:         "Professional",
  native:          "Native",
  "mother tongue": "Native",
};

/* ── Clean + normalize resume data before sending to API ─────────────────── */
const cleanResumeData = (data) => {
  if (!data) return data;
  if (data.test === true) return data; // skip test/health-check calls

  const cleaned = JSON.parse(JSON.stringify(data));

  // ── Skills ──────────────────────────────────────────────────────────
  if (Array.isArray(cleaned.skills) && cleaned.skills.length > 0) {
    cleaned.skills = cleaned.skills
      .map((skill) => {
        if (typeof skill === "string") {
          return { name: skill.trim(), level: "Intermediate", category: "Programming" };
        }
        if (skill && typeof skill === "object") {
          return {
            name:     (skill.name || "").trim(),
            level:    LEVEL_MAP[skill.level?.toLowerCase().trim()]       || "Intermediate",
            category: CATEGORY_MAP[skill.category?.toLowerCase().trim()] || "Programming",
          };
        }
        return null;
      })
      .filter((s) => s && s.name && s.name.trim() !== "");
  }

  // ── Languages ────────────────────────────────────────────────────────
  if (Array.isArray(cleaned.languages) && cleaned.languages.length > 0) {
    cleaned.languages = cleaned.languages
      .map((lang) => {
        if (!lang) return null;
        const name    = (lang.language || lang.name || "").trim();
        if (!name) return null;
        const profKey = (lang.proficiency || lang.level || "").toLowerCase().trim();
        return {
          name,
          proficiency: PROFICIENCY_MAP[profKey] || "Professional",
        };
      })
      .filter((l) => l && l.name);
  }

  // ── Experience — ensure achievements is always an array ─────────────
  if (Array.isArray(cleaned.experience)) {
    cleaned.experience = cleaned.experience.map((exp) => ({
      ...exp,
      achievements: Array.isArray(exp.achievements)
        ? exp.achievements
        : exp.achievements
        ? [exp.achievements]
        : [],
    }));
  }

  // ── Education — ensure achievements is always an array ──────────────
  if (Array.isArray(cleaned.education)) {
    cleaned.education = cleaned.education.map((edu) => ({
      ...edu,
      achievements: Array.isArray(edu.achievements) ? edu.achievements : [],
    }));
  }

  // ── Remove null/undefined top-level keys ─────────────────────────────
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined || cleaned[key] === null) delete cleaned[key];
  });

  // ── Remove empty arrays so backend doesn't overwrite with [] ─────────
  ["skills", "languages", "experience", "education",
   "projects", "certifications", "hobbies", "references"].forEach((key) => {
    if (Array.isArray(cleaned[key]) && cleaned[key].length === 0) delete cleaned[key];
  });

  return cleaned;
};

/* ── Auth APIs ───────────────────────────────────────────────────────────── */
export const signup = (data) => API.post("/auth/signup", data);
export const login  = (data) => API.post("/auth/login",  data);

/* ── Resume APIs ─────────────────────────────────────────────────────────── */

// ✅ getResumes — Dashboard calls getResumes(token) but token is ignored
//    because the interceptor handles auth automatically. Safe either way.
export const getResumes = (_token) => API.get("/resumes");

// ✅ getResumeById — called as getResumeById(id) from ResumeBuilder/Preview
export const getResumeById = (id) => API.get(`/resumes/${id}`);

// ✅ createResume — called as createResume(data)
export const createResume = (data) => API.post("/resumes", cleanResumeData(data));

// ✅ updateResume — called as updateResume(id, data)
export const updateResume = (id, data) => API.put(`/resumes/${id}`, cleanResumeData(data));

// ✅ deleteResume — Dashboard calls deleteResume(id, token)
//    second arg (token) is unused; interceptor handles auth
export const deleteResume = (id, _token) => API.delete(`/resumes/${id}`);

// ✅ saveResume — called as API.post("/resumes/save", data) from ResumeBuilder
//    also exported for direct use with fallback
export const saveResume = async (data) => {
  const cleanedData = cleanResumeData(data);
  try {
    // Try POST /resumes first (RESTful create)
    return await API.post("/resumes", cleanedData);
  } catch (err) {
    // Fallback to /resumes/save (upsert endpoint)
    if (err.response?.status === 404 || err.response?.status === 409) {
      console.log("Falling back to /resumes/save endpoint");
      return await API.post("/resumes/save", cleanedData);
    }
    throw err;
  }
};

// ✅ Helper — debug which endpoints respond
export const checkResumeEndpoints = async () => {
  const endpoints = [
    { method: "POST", url: "/resumes",      name: "POST /resumes" },
    { method: "POST", url: "/resumes/save", name: "POST /resumes/save" },
  ];
  const results = {};
  for (const ep of endpoints) {
    try {
      await API({
        method: ep.method,
        url:    ep.url,
        data:   { test: true },
        validateStatus: (s) => s < 500,
      });
      results[ep.name] = "✅ Available";
    } catch (err) {
      results[ep.name] = `❌ Error: ${err.response?.status || err.message}`;
    }
  }
  console.table(results);
  return results;
};

/* ── Export axios instance for direct use (ResumeBuilder uses API.post) ─── */
export { API };