import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { upload } from "../config/multer.js";

import {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  quoteRequest,
  rejectRequest,
  respondToQuote,
  scheduleRequest,
  collectRequest,
  completeRequest,
} from "../controllers/request.controller.js";

const router = Router();

// All routes below require a valid JWT
router.use(verifyToken);

// ── HOME_USER routes ──────────────────────────────────────────────────────────

// Submit a new scrap request (with optional photo uploads)
router.post(
  "/",
  requireRole("HOME_USER"),
  upload.array("photos", 5),
  createRequest
);

// Get own request history (supports ?status=)
router.get("/my", requireRole("HOME_USER"), getMyRequests);

// Accept or reject a quote ("accept" → SCHEDULED | "reject" → REJECTED)
router.patch("/:id/respond", requireRole("HOME_USER"), respondToQuote);

// ── ADMIN routes ──────────────────────────────────────────────────────────────

// List all requests (supports ?status=, ?dateFrom=, ?dateTo=)
router.get("/", requireRole("ADMIN"), getAllRequests);

// Set a price quote and assign a collector
router.patch("/:id/quote", requireRole("ADMIN"), quoteRequest);

// Reject a request with a reason
router.patch("/:id/reject", requireRole("ADMIN"), rejectRequest);

// Set / update scheduled pickup date
router.patch("/:id/schedule", requireRole("ADMIN"), scheduleRequest);

// Mark request as fully completed and create inventory records
router.patch("/:id/complete", requireRole("ADMIN"), completeRequest);

// ── COLLECTOR routes ──────────────────────────────────────────────────────────

// Mark an assigned pickup as collected
router.patch("/:id/collect", requireRole("COLLECTOR"), collectRequest);

// ── Shared read route (HOME_USER / ADMIN / COLLECTOR) ─────────────────────────
// Must come AFTER specific PATCH routes to avoid /:id shadowing them
router.get(
  "/:id",
  requireRole("HOME_USER", "ADMIN", "COLLECTOR"),
  getRequestById
);

export default router;
