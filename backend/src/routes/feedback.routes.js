import { Router } from "express";
import { verifyToken }   from "../middleware/auth.middleware.js";
import { requireRole }   from "../middleware/role.middleware.js";
import {
  submitFeedback,
  getAllFeedback,
} from "../controllers/feedback.controller.js";

const router = Router();

// POST /api/feedback — HOME_USER submits feedback for a completed request
router.post(
  "/",
  verifyToken,
  requireRole("HOME_USER"),
  submitFeedback
);

// GET /api/feedback — ADMIN views all feedback with average rating
router.get(
  "/",
  verifyToken,
  requireRole("ADMIN"),
  getAllFeedback
);

export default router;
