import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { signup, login, googleAuth } from "../controllers/authController.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt.js";


const router = express.Router();

/* ============================= */
/* 🩺 HEALTH CHECK */
/* ============================= */
router.get("/", (req, res) => {
  res.json({ message: "Auth route working" });
});

/* ============================= */
/* 🔐 NORMAL AUTH */
/* ============================= */
router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);

/* ============================= */
/* 🐙 GITHUB OAUTH */
/* ============================= */

/* 1️⃣ Redirect to GitHub */
router.get("/github", (req, res) => {
  if (!req.session) {
    return res.status(500).json({ message: "Session not initialized" });
  }

  const state =
    Date.now().toString(36) + Math.random().toString(36).slice(2);

  req.session.githubOAuthState = state;

  const redirectUri =
    `${process.env.SERVER_URL}/api/auth/github/callback`;

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=read:user user:email` +
    `&state=${state}`;

  res.redirect(githubAuthUrl);
});

/* 2️⃣ GitHub Callback */
router.get("/github/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || !req.session || state !== req.session.githubOAuthState) {
    return res.redirect(
      `${process.env.CLIENT_URL}/login?error=invalid_oauth_state`
    );
  }

  // Clear state after validation
  req.session.githubOAuthState = null;

  try {
    /* Exchange code for access token */
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) throw new Error("GitHub access token missing");

    /* Fetch GitHub profile */
    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "MERN-Resume-Builder",
      },
    });

    let { id, login, email, name } = userRes.data;

    /* Fetch email if private */
    if (!email) {
      const emailRes = await axios.get(
        "https://api.github.com/user/emails",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "MERN-Resume-Builder",
          },
        }
      );

      const primary = emailRes.data.find(e => e.primary && e.verified);
      email = primary?.email || emailRes.data[0]?.email;
    }

    if (!email) email = `${login}@github.user`;

    /* Find or create user */
    let user = await User.findOne({
      $or: [{ githubId: id.toString() }, { email }],
    });

    if (!user) {
      user = await User.create({
        name: name || login,
        email,
        githubId: id.toString(),
        password: "github-oauth",
      });
    } else if (!user.githubId) {
      user.githubId = id.toString();
      await user.save();
    }

    /* ✅ CREATE JWT (SINGLE SOURCE OF TRUTH) */
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const redirectUrl = new URL(
      `${process.env.CLIENT_URL}/auth-success`
    );
    redirectUrl.searchParams.set("token", token);

    res.redirect(redirectUrl.toString());

  } catch (err) {
    console.error("GitHub OAuth Error:", err.message);
    res.redirect(
      `${process.env.CLIENT_URL}/login?error=github_auth_failed`
    );
  }
});

export default router;