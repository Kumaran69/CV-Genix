import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ── JWT token signer ───────────────────────────────────────────────────────
const signToken = (userId) => {
  const SECRET = process.env.JWT_SECRET;
  if (!SECRET) throw new Error("JWT_SECRET is not set in environment variables");
  return jwt.sign({ id: userId }, SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
};

/* =======================
   SIGNUP CONTROLLER
======================= */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   LOGIN CONTROLLER
======================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Google-only or GitHub-only accounts have no real password
    if (
      !user.password ||
      user.password === "google-oauth" ||
      user.password === "github-oauth"
    ) {
      return res.status(400).json({
        message: "This account uses Social Sign-In. Please login with Google or GitHub.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = signToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   GOOGLE AUTH CONTROLLER
======================= */
export const googleAuth = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ message: "Access token missing" });
    }

    // ✅ Fetch user info from Google
    const googleRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const { email, name, picture, sub: googleId } = googleRes.data;

    if (!email) {
      return res.status(401).json({ message: "Could not retrieve email from Google" });
    }

    // ✅ Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // New user — create account
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await User.create({
        name,
        email,
        googleId,
        password: randomPassword,
        avatar: picture,
        authProvider: "google",
      });
    } else {
      // Existing user — link Google ID if not already linked
      let changed = false;
      if (!user.googleId) { user.googleId = googleId; changed = true; }
      if (!user.avatar && picture) { user.avatar = picture; changed = true; }
      if (changed) await user.save();
    }

    const token = signToken(user._id);

    res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Google Auth Error:", err.message);
    res.status(401).json({ message: "Google login failed" });
  }
};