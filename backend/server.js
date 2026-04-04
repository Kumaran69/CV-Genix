import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
connectDB();

const app  = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/* ── Security headers ────────────────────────────────────────────────────── */
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

/* ── CORS ── ✅ FIXED: was pointing to :5000 (backend), now points to :5173 (frontend) */
app.use(
  cors({
    origin: [
      "http://localhost:5173",  // Vite default
      "http://localhost:5174",  // Vite alternate
      "http://localhost:3000",  // CRA fallback
    ],
    credentials: true,
  })
);

/* ── Body / Session middleware ───────────────────────────────────────────── */
app.use(express.json());
app.use(
  session({
    secret:            process.env.SESSION_SECRET || "fallback-secret",
    resave:            false,
    saveUninitialized: false,
  })
);

/* ── Existing Routes ─────────────────────────────────────────────────────── */
app.use("/auth",        authRoutes);
app.use("/api/auth",    authRoutes);
app.use("/api/resumes", resumeRoutes);

/* ── ✅ NEW: Market Analytics ─────────────────────────────────────────────── */
app.get("/api/market/analytics", (req, res) => {
  const skills = req.query.skills
    ? req.query.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  res.json({
    demandScore:    82,
    averageSalary:  95000,
    trendingSkills: [
      "React", "Node.js", "Python", "TypeScript",
      "AWS", "Docker", "MongoDB", "GraphQL",
    ],
    skillInsights: skills.map((skill) => ({
      skill,
      demand:    Math.floor(Math.random() * 40) + 60,
      avgSalary: Math.floor(Math.random() * 40000) + 75000,
      jobCount:  Math.floor(Math.random() * 500) + 100,
    })),
  });
});

/* ── ✅ NEW: Job Recommendations ──────────────────────────────────────────── */
app.get("/api/jobs/recommendations", (req, res) => {
  const skills = req.query.skills
    ? req.query.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const allJobs = [
    {
      id:       "1",
      title:    "Frontend Developer",
      company:  "TechCorp",
      location: "Remote",
      salary:   "$90k – $120k",
      match:    95,
      skills:   ["React", "TypeScript", "CSS"],
      postedAt: new Date().toISOString(),
      applyUrl: "#",
    },
    {
      id:       "2",
      title:    "Full Stack Engineer",
      company:  "StartupXYZ",
      location: "Hybrid",
      salary:   "$100k – $130k",
      match:    88,
      skills:   ["Node.js", "React", "MongoDB"],
      postedAt: new Date().toISOString(),
      applyUrl: "#",
    },
    {
      id:       "3",
      title:    "Backend Developer",
      company:  "BigTech Inc",
      location: "On-site",
      salary:   "$110k – $140k",
      match:    80,
      skills:   ["Node.js", "Python", "AWS"],
      postedAt: new Date().toISOString(),
      applyUrl: "#",
    },
    {
      id:       "4",
      title:    "React Developer",
      company:  "ProductCo",
      location: "Remote",
      salary:   "$85k – $110k",
      match:    92,
      skills:   ["React", "JavaScript", "GraphQL"],
      postedAt: new Date().toISOString(),
      applyUrl: "#",
    },
  ];

  const jobs = skills.length > 0
    ? allJobs.filter((job) =>
        job.skills.some((s) =>
          skills.map((sk) => sk.toLowerCase()).includes(s.toLowerCase())
        )
      )
    : allJobs;

  res.json({ jobs });
});

/* ── Health check ────────────────────────────────────────────────────────── */
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

/* ── Serve React build (production only) ─────────────────────────────────── */
// ✅ MUST come AFTER all /api routes — otherwise intercepts API calls
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  // ✅ FIXED: was swallowing API 404s and returning index.html
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: `API route not found: ${req.path}` });
  }
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

/* ── Start server ────────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});