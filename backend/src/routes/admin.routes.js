// backend/src/routes/admin.routes.js
// Task 7.1 — Admin stats route
// Phase 8 will add export + CSV routes here.

import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  getDashboardStats,
  exportRequests,
  exportInventory,
} from "../controllers/admin.controller.js";

const router = Router();

// GET /api/admin/stats — returns aggregated dashboard metrics for ADMIN
router.get(
  "/stats",
  verifyToken,
  requireRole("ADMIN"),
  getDashboardStats
);

// GET /api/admin/export/requests
router.get(
  "/export/requests",
  verifyToken,
  requireRole("ADMIN"),
  exportRequests
);

// GET /api/admin/export/inventory
router.get(
  "/export/inventory",
  verifyToken,
  requireRole("ADMIN"),
  exportInventory
);

export default router;
