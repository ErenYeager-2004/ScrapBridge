import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerValidator,
  loginValidator,
} from "../validators/auth.validator.js";

const router = Router();

// Rate Limiter
// Applied to register and login to prevent brute-force attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});

// Auth Routes

// Register a new account (HOME_USER or BUYER)
router.post("/register", authLimiter, registerValidator, validate, register);

// Login with email & password → returns JWT
router.post("/login", authLimiter, loginValidator, validate, login);

// Get current authenticated user's profile
router.get("/me", verifyToken, getMe);

// Email Verification & Password Reset

// Verify email via token link (GET link in verification email)
router.get("/verify-email", verifyEmail);

// Initiate a password-reset flow
router.post("/forgot-password", forgotPassword);

// Complete the password-reset flow (token + new password)
router.post("/reset-password", resetPassword);

// Update authenticated user's profile (name, phone)
router.patch("/profile", verifyToken, updateProfile);

// Change password for authenticated user (verifies current password)
router.post("/change-password", verifyToken, changePassword);

export default router;
