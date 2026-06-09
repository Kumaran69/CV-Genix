import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.CLIENT_URL, 'http://34.227.92.150.nip.io', 'http://34.227.92.150']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.post("/api/ai/recommendations", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    if (!geminiRes.ok) return res.status(geminiRes.status).json({ error: "Gemini API failed", detail: geminiData });

    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    res.json({ text });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/market", marketRoutes);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "CVGenix API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));