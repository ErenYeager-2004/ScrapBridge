import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerValidator,
  loginValidator,
} from "../validators/auth.validator.js";

const router = Router();

// ── Rate Limiter ───────────────────────────────────────────────────────────────
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

// ── Auth Routes ────────────────────────────────────────────────────────────────

// Register a new account (HOME_USER or BUYER)
router.post("/register", authLimiter, registerValidator, validate, register);

// Login with email & password → returns JWT
router.post("/login", authLimiter, loginValidator, validate, login);

// Get current authenticated user's profile
router.get("/me", verifyToken, getMe);

// ── Phase 3 Stubs ──────────────────────────────────────────────────────────────
// Returns 501 Not Implemented until Phase 3 is built.

router.post("/forgot-password", (_req, res) =>
  res.status(501).json({ message: "Not implemented yet. Coming in Phase 3." })
);

router.post("/reset-password", (_req, res) =>
  res.status(501).json({ message: "Not implemented yet. Coming in Phase 3." })
);

router.get("/verify-email", (_req, res) =>
  res.status(501).json({ message: "Not implemented yet. Coming in Phase 3." })
);

export default router;
