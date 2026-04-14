import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// ── Proxy all Anthropic API calls through backend ──────────────────────
router.post("/anthropic", async (req, res) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Anthropic proxy error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

export default router;