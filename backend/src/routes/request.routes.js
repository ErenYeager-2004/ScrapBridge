import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

import prisma            from "../config/prisma.js";
import { generateReceipt } from "../services/pdf.service.js";

// Resolve __dirname for ES Modules (needed to build absolute receipt path)
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

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

// ── Phase 5: Receipt download (HOME_USER — own request only) ──────────────────

/**
 * GET /api/requests/:id/receipt
 * Role: HOME_USER
 * Downloads the PDF receipt for a completed request.
 * If the receipt was never generated (requests completed before Task 5.1
 * was deployed), it is generated on-demand, persisted, then served.
 * Returns 403 for ownership violations, 404 for non-existent / non-completed
 * requests.
 */
const downloadReceipt = async (req, res) => {
  try {
    const request = await prisma.scrapRequest.findUnique({
      where: { id: req.params.id },
      include: {
        user:      true,   // homeUser — for name/phone on receipt
        collector: true,   // collector — for name on receipt
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found." });
    }

    // Ownership check
    if (request.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Access denied. This receipt does not belong to you." });
    }

    // Must be COMPLETED to have a receipt
    if (request.status !== "COMPLETED") {
      return res
        .status(404)
        .json({ error: "Receipt is only available for completed requests." });
    }

    let receiptPath = request.receiptPath;
    let absolutePath = receiptPath
      ? path.resolve(__dirname, "../../", receiptPath)
      : null;

    // ── Lazy generation ───────────────────────────────────────────────────────
    // If this request was completed before Task 5.1 (no receiptPath stored),
    // or the file was somehow deleted, regenerate it now.
    const needsGeneration = !receiptPath || !fs.existsSync(absolutePath);

    if (needsGeneration) {
      try {
        receiptPath  = await generateReceipt(request, request.user, request.collector);
        absolutePath = path.resolve(__dirname, "../../", receiptPath);

        // Persist the new path so future downloads skip generation
        await prisma.scrapRequest.update({
          where: { id: request.id },
          data:  { receiptPath },
        });
      } catch (genErr) {
        console.error("[downloadReceipt] PDF generation failed:", genErr);
        return res.status(500).json({ error: "Failed to generate receipt PDF." });
      }
    }

    return res.download(absolutePath, "ScrapBridge-Receipt.pdf");
  } catch (err) {
    console.error("[downloadReceipt]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

router.get("/:id/receipt", requireRole("HOME_USER"), downloadReceipt);

export default router;
