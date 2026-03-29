import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* 1️⃣ Redirect to GitHub */
router.get("/github", (req, res) => {
  const state = Date.now().toString();

  // store state to prevent repeated auth abuse
  req.session = req.session || {};
  req.session.oauthState = state;

  const redirectUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&scope=read:user user:email` +
    `&state=${state}`;

  res.redirect(redirectUrl);
});

/* 2️⃣ GitHub Callback */
router.get("/github/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ message: "No code provided" });
  }

  // Validate OAuth state
  if (!req.session || state !== req.session.oauthState) {
    return res.status(403).json({ message: "Invalid OAuth state" });
  }

  // Clear state after validation
  req.session.oauthState = null;

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

    /* Get GitHub user profile */
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` },
    });

    let { id, login, email, avatar_url } = userRes.data;

    /* If email is private, fetch from emails API */
    if (!email) {
      const emailRes = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `token ${accessToken}` },
      });

      const primaryEmail = emailRes.data.find(
        (e) => e.primary && e.verified
      );

      email = primaryEmail
        ? primaryEmail.email
        : emailRes.data[0]?.email;
    }

    /* Save or update user */
    let user = await User.findOneAndUpdate(
      { githubId: id.toString() },
      {
        username: login,
        email: email,
        avatar: avatar_url,
      },
      { upsert: true, new: true }
    );

    /* Create JWT */
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* Redirect to frontend */
    res.redirect(
      `${process.env.CLIENT_URL}/auth-success?token=${token}`
    );

  } catch (err) {
    console.error("GitHub Auth Error:", err.response?.data || err.message);
    res.redirect(
      `${process.env.CLIENT_URL}/login?error=auth_failed`
    );
  }
});

export default router;
