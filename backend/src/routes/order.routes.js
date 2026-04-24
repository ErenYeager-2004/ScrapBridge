import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  confirmOrder,
  deliverOrder,
  cancelOrder,
} from "../controllers/order.controller.js";

const router = Router();

// POST /api/orders — place an order (BUYER)
router.post("/", verifyToken, requireRole("BUYER"), placeOrder);

// GET  /api/orders/my — buyer's own orders (BUYER)
// NOTE: /my must be declared BEFORE /:id routes to avoid param shadowing
router.get("/my", verifyToken, requireRole("BUYER"), getMyOrders);

// GET  /api/orders — all orders (ADMIN)
router.get("/", verifyToken, requireRole("ADMIN"), getAllOrders);

// PATCH /api/orders/:id/confirm — confirm an order (ADMIN)
router.patch("/:id/confirm", verifyToken, requireRole("ADMIN"), confirmOrder);

// PATCH /api/orders/:id/deliver — mark order as delivered (ADMIN)
router.patch("/:id/deliver", verifyToken, requireRole("ADMIN"), deliverOrder);

// PATCH /api/orders/:id/cancel — cancel a PLACED order and release reservation (ADMIN)
router.patch("/:id/cancel", verifyToken, requireRole("ADMIN"), cancelOrder);

export default router;
