import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
connectDB();

const app = express();
app.use(express.json());
// fixed — lock origins per environment
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL          // e.g. https://yourapp.com
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,                  // needed if you use cookies/JWT
}));

// ─── ALL API ROUTES FIRST ─────────────────────────────────────────────────────

app.post("/api/ai/recommendations", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "prompt is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not set in .env");
    return res.status(500).json({ error: "GEMINI_API_KEY not configured on server" });
  }

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

    if (!geminiRes.ok) {
      console.error("❌ Gemini error:", JSON.stringify(geminiData, null, 2));
      return res.status(geminiRes.status).json({ error: "Gemini API failed", detail: geminiData });
    }

    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    console.log("✅ Gemini responded, length:", text.length);
    res.json({ text });

  } catch (err) {
    console.error("❌ Gemini fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/market", marketRoutes);

// ─── STATIC + WILDCARD LAST (always) ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));