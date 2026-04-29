import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import * as emailService from "../services/email.service.js";

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
 * Sends an email-verification link; account is locked until verified.
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

    // 3. Generate verification token
    const verificationToken = crypto.randomUUID();

    // 4. Create user (unverified)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role,
        isVerified: false,
        verificationToken,
      },
    });

    // 5. Send verification email (non-blocking — log failure, don't crash)
    try {
      await emailService.sendVerificationEmail(user, verificationToken);
    } catch (emailErr) {
      console.error("[register] Failed to send verification email:", emailErr.message);
    }

    return res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
      user: excludePassword(user),
    });
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

    // 3. Email verification gate
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

// ── verifyEmail ────────────────────────────────────────────────────────────────

/**
 * GET /api/auth/verify-email?token=<uuid>
 * Marks the user's account as verified and clears the token.
 * On success, redirects to the frontend's success page.
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required." });
    }

    // Find the user with this token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification link." });
    }

    if (user.isVerified) {
      // Already verified — still redirect to success so the user isn't confused
      return res.redirect(`${process.env.CLIENT_URL}/verify-email?success=true`);
    }

    // Mark the account as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    return res.redirect(`${process.env.CLIENT_URL}/verify-email?success=true`);
  } catch (err) {
    console.error("[verifyEmail]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── forgotPassword ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/forgot-password
 * Generates a reset token and emails it.
 * Always returns 200 to avoid leaking whether an email exists (security best practice).
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetToken = crypto.randomUUID();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      // Non-blocking send — log failure without revealing it to the caller
      try {
        await emailService.sendPasswordResetEmail(user, resetToken);
      } catch (emailErr) {
        console.error("[forgotPassword] Failed to send reset email:", emailErr.message);
      }
    }

    // Always return 200 regardless of whether the user exists
    return res.status(200).json({
      message: "If that email is registered, you will receive a password-reset link shortly.",
    });
  } catch (err) {
    console.error("[forgotPassword]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── resetPassword ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/reset-password
 * Accepts a valid reset token + new password and updates the user's credentials.
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required." });
    }

    // Find user with a matching, non-expired reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // token must not be expired
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset link." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user credentials and clear the reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    console.error("[resetPassword]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── updateProfile ──────────────────────────────────────────────────────────────

/**
 * PATCH /api/auth/profile
 * Allows an authenticated user to update their name and phone number.
 * Email is intentionally excluded (changing email would require re-verification).
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters." });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
      },
    });

    return res.status(200).json({ message: "Profile updated.", user: excludePassword(updated) });
  } catch (err) {
    console.error("[updateProfile]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── changePassword ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/change-password
 * Verifies the user's current password, then updates to the new one.
 * Requires authentication (verifyToken). No email round-trip needed.
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: "New password must be different from the current one." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("[changePassword]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};
