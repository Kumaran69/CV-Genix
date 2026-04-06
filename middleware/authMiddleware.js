import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET } from "../config/jwt.js";

/* ============================= */
/* 🔐 PROTECT MIDDLEWARE */
/* ============================= */
export const protect = async (req, res, next) => {
  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    let token;

    // Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Cookie-based auth
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
        code: "NO_TOKEN",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
        code: "INVALID_TOKEN_PAYLOAD",
      });
    }

    // Fetch user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    if (user.isBlocked || user.isDeleted) {
      return res.status(401).json({
        success: false,
        message: "Account is inactive",
        code: "ACCOUNT_INACTIVE",
      });
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired, please login again",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      code: "AUTH_FAILED",
    });
  }
};

/* ============================= */
/* 👑 ADMIN MIDDLEWARE */
/* ============================= */
export const admin = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Admin access required",
    code: "NOT_ADMIN",
  });
};

/* ============================= */
/* 🌍 OPTIONAL AUTH MIDDLEWARE */
/* ============================= */
export const optionalAuth = async (req, res, next) => {
  try {
    if (!JWT_SECRET) return next();

    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) return next();

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded?.id) return next();

    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
      req.token = token;
    }

    next();
  } catch (error) {
    // Silently ignore JWT errors for optional auth
    next();
  }
};