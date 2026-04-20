import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  getMyNotifications,
  markAllRead,
} from "../controllers/request.controller.js";

const router = Router();

// All notification routes require authentication.
// No specific role restriction — any authenticated user can read their own notifications.
router.use(verifyToken);

// GET  /api/notifications/my       → returns all notifications for the current user
router.get("/my", getMyNotifications);

// PATCH /api/notifications/read-all → marks all unread notifications as read
router.patch("/read-all", markAllRead);

export default router;
