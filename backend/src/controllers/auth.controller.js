import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Strip the password field from a user object before sending in responses.
 */
const excludePassword = (user) => {
  const { password, ...rest } = user;
  return rest;
};

// ── register ───────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Creates a new HOME_USER or BUYER account.
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // 1. Check for duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user
    //    NOTE: isVerified is set to true temporarily.
    //    Phase 3 will flip this to false and send a verification email.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role,
        isVerified: true, // TODO (Phase 3): set to false and send verification email
      },
    });

    return res.status(201).json({ user: excludePassword(user) });
  } catch (err) {
    console.error("[register]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── login ──────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Validates credentials and returns a signed JWT.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 3. Email verification gate (Phase 3 will enforce this properly)
    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email before logging in." });
    }

    // 4. Sign JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── getMe ──────────────────────────────────────────────────────────────────────

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile (requires verifyToken middleware).
 */
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({ user: excludePassword(user) });
  } catch (err) {
    console.error("[getMe]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── Phase 3 Stubs ──────────────────────────────────────────────────────────────
// These will be fully implemented in Phase 3 (Email Verification & Password Reset).

export const forgotPassword = async (_req, _res) => {};
export const resetPassword = async (_req, _res) => {};
export const verifyEmail = async (_req, _res) => {};
