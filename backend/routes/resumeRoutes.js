// routes/resumeRoutes.js
import express from "express";
import {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
  getJobRecommendations,
  saveResume,
  incrementDownloadCount,
  getPublicResumes,
  getUserResumeStats
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================= */
/* 🌍 PUBLIC ROUTES (NO AUTH) */
/* ============================= */

// Get public resumes (read-only)
router.get("/public/all", getPublicResumes);

/* ============================= */
/* 🔐 PROTECTED ROUTES (AUTH) */
/* ============================= */

router.use(protect);

/* ============================= */
/* 📊 USER ANALYTICS */
/* ============================= */

// Get user resume statistics
router.get("/stats/user", getUserResumeStats);

/* ============================= */
/* 📝 RESUME MANAGEMENT */
/* ============================= */

// Create new resume
router.post("/", createResume);

// Save/update resume
router.post("/save", saveResume);

// Get all resumes for current user
router.get("/", getResumes);

// Get single resume by ID
router.get("/:id", getResumeById);

// Update resume
router.put("/:id", updateResume);

// Delete resume
router.delete("/:id", deleteResume);

// Increment download count
router.post("/:id/download", incrementDownloadCount);

/* ============================= */
/* 🎯 JOB RECOMMENDATIONS */
/* ============================= */

// Get job recommendations for a resume
router.get("/:id/recommendations", getJobRecommendations);

/* ============================= */
/* 🆘 404 HANDLER */
/* ============================= */

router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Resume API endpoint not found"
  });
});

export default router;