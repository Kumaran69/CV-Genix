import axios from "axios";

/* ── Base API instance ───────────────────────────────────────────────────── */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Add timeout to prevent hanging requests
});

/* ── Attach token — checks both localStorage and sessionStorage ──────────── */
API.interceptors.request.use((req) => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log requests in development (optional)
  if (import.meta.env.DEV) {
    console.log(`🚀 ${req.method.toUpperCase()} ${req.baseURL}${req.url}`, req.data);
  }
  
  return req;
});

/* ── Response interceptor — surface auth errors clearly ─────────────────── */
API.interceptors.response.use(
  (res) => {
    // Log responses in development (optional)
    if (import.meta.env.DEV) {
      console.log(`✅ ${res.status} ${res.config.url}`, res.data);
    }
    return res;
  },
  (err) => {
    // Handle 401 Unauthorized
    if (err.response?.status === 401) {
      console.error("❌ Unauthorized — token missing or expired.");
      // Optionally clear token and redirect to login
      // localStorage.removeItem("token");
      // sessionStorage.removeItem("token");
      // window.location.href = "/login";
    }
    
    // Handle 404 Not Found
    if (err.response?.status === 404) {
      console.error(`❌ Endpoint not found: ${err.config?.method?.toUpperCase()} ${err.config?.url}`);
    }
    
    // Handle 400 Bad Request - log the actual error message from server
    if (err.response?.status === 400) {
      console.error("❌ Bad Request:", err.response.data);
    }
    
    // Log error details in development
    if (import.meta.env.DEV) {
      console.error("API Error:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        method: err.config?.method
      });
    }
    
    return Promise.reject(err);
  }
);

/* ── Helper function to clean resume data before sending ─────────────────── */
const cleanResumeData = (data) => {
  if (!data) return data;
  
  // Create a deep copy to avoid mutating original
  const cleaned = JSON.parse(JSON.stringify(data));
  
  // Clean skills array
  if (cleaned.skills && Array.isArray(cleaned.skills)) {
    cleaned.skills = cleaned.skills
      .map(skill => {
        if (typeof skill === "string") {
          return {
            name: skill,
            level: "beginner",
            category: "technical"
          };
        }
        
        // Validate level
        let level = "beginner";
        if (skill.level) {
          const levelLower = skill.level.toLowerCase();
          if (["beginner", "intermediate", "advanced", "expert"].includes(levelLower)) {
            level = levelLower;
          } else if (["competent", "proficient", "skilled"].includes(levelLower)) {
            level = "intermediate";
          } else if (["experienced", "master"].includes(levelLower)) {
            level = "expert";
          }
        }
        
        // Validate category
        let category = "technical";
        if (skill.category) {
          const catLower = skill.category.toLowerCase();
          if (["technical", "soft", "tools"].includes(catLower)) {
            category = catLower;
          } else if (catLower.includes("hard")) {
            category = "technical";
          } else if (catLower.includes("soft")) {
            category = "soft";
          } else if (["tool", "tools", "framework"].includes(catLower)) {
            category = "tools";
          }
        }
        
        return {
          name: skill.name || "",
          level,
          category
        };
      })
      .filter(s => s.name && s.name.trim() !== "");
  }
  
  // Clean languages array
  if (cleaned.languages && Array.isArray(cleaned.languages)) {
    cleaned.languages = cleaned.languages
      .map(lang => {
        const name = lang.language || lang.name || "";
        
        let proficiency = "intermediate";
        if (lang.proficiency) {
          const profLower = lang.proficiency.toLowerCase();
          if (["native", "fluent", "intermediate", "basic"].includes(profLower)) {
            proficiency = profLower;
          } else if (["professional", "advanced"].includes(profLower)) {
            proficiency = "fluent";
          } else if (profLower === "conversational") {
            proficiency = "intermediate";
          }
        }
        
        return {
          name,
          proficiency
        };
      })
      .filter(l => l.name && l.name.trim() !== "");
  }
  
  // Remove undefined/null values
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined || cleaned[key] === null) {
      delete cleaned[key];
    }
  });
  
  return cleaned;
};

/* ── Auth APIs ───────────────────────────────────────────────────────────── */
export const signup = (data) => API.post("/auth/signup", data);
export const login  = (data) => API.post("/auth/login",  data);

/* ── Resume APIs ─────────────────────────────────────────────────────────── */
// Create a new resume
export const createResume = (data) => {
  const cleanedData = cleanResumeData(data);
  return API.post("/resumes", cleanedData);
};

// Get all resumes
export const getResumes = () => API.get("/resumes");

// Get resume by ID
export const getResumeById = (id) => API.get(`/resumes/${id}`);

// Save resume (using the correct endpoint based on your backend)
// FIXED: Now tries both endpoints with fallback
export const saveResume = async (data) => {
  const cleanedData = cleanResumeData(data);
  
  try {
    // First try POST /resumes (RESTful)
    return await API.post("/resumes", cleanedData);
  } catch (err) {
    // If 404, try POST /resumes/save (custom endpoint)
    if (err.response?.status === 404) {
      console.log("Falling back to /resumes/save endpoint");
      return await API.post("/resumes/save", cleanedData);
    }
    // If other error, rethrow
    throw err;
  }
};

// Update existing resume
export const updateResume = (id, data) => {
  const cleanedData = cleanResumeData(data);
  return API.put(`/resumes/${id}`, cleanedData);
};

// Delete resume
export const deleteResume = (id) => API.delete(`/resumes/${id}`);

// Helper function to check which endpoints work
export const checkResumeEndpoints = async () => {
  const endpoints = [
    { method: 'POST', url: '/resumes', name: 'POST /resumes' },
    { method: 'POST', url: '/resumes/save', name: 'POST /resumes/save' },
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      await API({
        method: endpoint.method,
        url: endpoint.url,
        data: { test: true },
        validateStatus: (status) => status < 500 // Don't throw on 4xx
      });
      results[endpoint.name] = '✅ Available';
    } catch (err) {
      results[endpoint.name] = `❌ Error: ${err.response?.status || err.message}`;
    }
  }
  
  console.table(results);
  return results;
};

/* ── Export instance for jobService etc. ─────────────────────────────────── */
export { API };