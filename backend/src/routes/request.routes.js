import { Router } from "express";
import { verifyToken }  from "../middleware/auth.middleware.js";
import { requireRole }  from "../middleware/role.middleware.js";
import { validate }     from "../middleware/validate.middleware.js";
import { upload }       from "../config/multer.js";

import {
  createRequestValidator,
  quoteRequestValidator,
  respondValidator,
  scheduleValidator,
  rejectValidator,
} from "../validators/request.validator.js";

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
  getAssignedPickups,
} from "../controllers/request.controller.js";

const router = Router();

// All routes below require a valid JWT
router.use(verifyToken);

// ── HOME_USER routes ──────────────────────────────────────────────────────────

// Submit a new scrap request (with optional photo uploads, up to 5)
// upload.array runs before validation so req.files is populated
router.post(
  "/",
  upload.array("photos", 5),
  createRequestValidator,
  validate,
  requireRole("HOME_USER"),
  createRequest
);

// Get own request history (supports ?status=)
router.get("/my", requireRole("HOME_USER"), getMyRequests);

// Accept or reject a quote ("accept" → SCHEDULED | "reject" → REJECTED)
router.patch(
  "/:id/respond",
  requireRole("HOME_USER"),
  respondValidator,
  validate,
  respondToQuote
);

// ── ADMIN routes ──────────────────────────────────────────────────────────────

// List all requests (supports ?status=, ?dateFrom=, ?dateTo=)
router.get("/", requireRole("ADMIN"), getAllRequests);

// Set a price quote and assign a collector
router.patch(
  "/:id/quote",
  requireRole("ADMIN"),
  quoteRequestValidator,
  validate,
  quoteRequest
);

// Reject a request (rejectionReason is optional)
router.patch(
  "/:id/reject",
  requireRole("ADMIN"),
  rejectValidator,
  validate,
  rejectRequest
);

// Set / update scheduled pickup date
router.patch(
  "/:id/schedule",
  requireRole("ADMIN"),
  scheduleValidator,
  validate,
  scheduleRequest
);

// Mark request as fully completed and create inventory records
router.patch("/:id/complete", requireRole("ADMIN"), completeRequest);

// ── COLLECTOR routes ──────────────────────────────────────────────────────────

// Get all pickups assigned to the current collector
router.get("/assigned", requireRole("COLLECTOR"), getAssignedPickups);

// Mark an assigned pickup as collected
router.patch("/:id/collect", requireRole("COLLECTOR"), collectRequest);

// ── Shared read route (HOME_USER / ADMIN / COLLECTOR) ─────────────────────────
// Must come AFTER specific PATCH routes to avoid /:id shadowing them
router.get("/:id", getRequestById);

// ── Phase 5 placeholder ───────────────────────────────────────────────────────
// GET /api/requests/:id/receipt — PDF receipt download (implemented in Phase 5)
router.get("/:id/receipt", (req, res) => {
  res
    .status(501)
    .json({ error: "Receipt generation not yet implemented. Coming in Phase 5." });
});

export default router;
