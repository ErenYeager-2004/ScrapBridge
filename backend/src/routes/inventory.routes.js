import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { getInventory, getAllInventory } from "../controllers/inventory.controller.js";

const router = Router();

// GET /api/inventory       — available inventory for ADMIN and BUYER
router.get("/", verifyToken, requireRole("ADMIN", "BUYER"), getInventory);

// GET /api/inventory/all   — all inventory records (admin only)
router.get("/all", verifyToken, requireRole("ADMIN"), getAllInventory);

export default router;
