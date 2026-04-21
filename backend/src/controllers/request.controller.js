import prisma from "../config/prisma.js";
import { createNotification } from "../services/notification.service.js";

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Fetch all users with role ADMIN and create a notification for each.
 * @param {string} message
 */
const notifyAdmins = async (message) => {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  await Promise.all(admins.map((admin) => createNotification(admin.id, message)));
};

// ── a. createRequest ───────────────────────────────────────────────────────────

/**
 * POST /api/requests
 * Role: HOME_USER
 * Creates a new ScrapRequest with uploaded photos and notifies all admins.
 */
export const createRequest = async (req, res) => {
  try {
    const { pickupAddress, contactPhone = "" } = req.body;
    let items = req.body.items;

    // items arrives as a JSON string from multipart/form-data
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        return res.status(400).json({ error: "items must be valid JSON." });
      }
    }

    // Build relative photo paths from Multer's req.files array
    const photos = (req.files || []).map((f) => `/uploads/${f.filename}`);

    const request = await prisma.scrapRequest.create({
      data: {
        userId: req.user.id,
        status: "PENDING",
        items,
        photos,
        pickupAddress,
        contactPhone,
      },
    });

    await notifyAdmins(
      `New scrap request #${request.id.slice(0, 8)} submitted by user ${req.user.id.slice(0, 8)}.`
    );

    return res.status(201).json({ request });
  } catch (err) {
    console.error("[createRequest]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── b. getMyRequests ───────────────────────────────────────────────────────────

/**
 * GET /api/requests/my
 * Role: HOME_USER
 * Returns own requests, optionally filtered by ?status=
 */
export const getMyRequests = async (req, res) => {
  try {
    const where = { userId: req.user.id };
    if (req.query.status) where.status = req.query.status;

    const requests = await prisma.scrapRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ requests });
  } catch (err) {
    console.error("[getMyRequests]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── c. getAllRequests ──────────────────────────────────────────────────────────

/**
 * GET /api/requests
 * Role: ADMIN
 * Returns all requests with user & collector info.
 * Supports ?status=, ?dateFrom=, ?dateTo=
 */
export const getAllRequests = async (req, res) => {
  try {
    const where = {};

    if (req.query.status) where.status = req.query.status;

    if (req.query.dateFrom || req.query.dateTo) {
      where.createdAt = {};
      if (req.query.dateFrom) where.createdAt.gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) where.createdAt.lte = new Date(req.query.dateTo);
    }

    const requests = await prisma.scrapRequest.findMany({
      where,
      include: { user: true, collector: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ requests });
  } catch (err) {
    console.error("[getAllRequests]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── d. getRequestById ──────────────────────────────────────────────────────────

/**
 * GET /api/requests/:id
 * Roles: HOME_USER (own only), ADMIN (any), COLLECTOR (assigned only)
 * Returns full request with user, collector, feedback, inventory.
 */
export const getRequestById = async (req, res) => {
  try {
    const request = await prisma.scrapRequest.findUnique({
      where: { id: req.params.id },
      include: { user: true, collector: true, feedback: true, inventory: true },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found." });
    }

    const { role, id: userId } = req.user;

    if (role === "HOME_USER" && request.userId !== userId) {
      return res.status(403).json({ error: "Access denied." });
    }

    if (role === "COLLECTOR" && request.collectorId !== userId) {
      return res.status(403).json({ error: "Access denied." });
    }

    return res.status(200).json({ request });
  } catch (err) {
    console.error("[getRequestById]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── e. quoteRequest ────────────────────────────────────────────────────────────

/**
 * PATCH /api/requests/:id/quote
 * Role: ADMIN
 * Sets adminPrice, adminNotes, collectorId; status → QUOTED.
 */
export const quoteRequest = async (req, res) => {
  try {
    const { adminPrice, adminNotes, collectorId } = req.body;

    const request = await prisma.scrapRequest.update({
      where: { id: req.params.id },
      data: {
        status: "QUOTED",
        adminPrice: adminPrice !== undefined ? parseFloat(adminPrice) : undefined,
        adminNotes: adminNotes || null,
        collectorId: collectorId || null,
      },
    });

    await createNotification(
      request.userId,
      `Your scrap request #${request.id.slice(0, 8)} has been quoted at ₹${request.adminPrice}.`
    );

    return res.status(200).json({ request });
  } catch (err) {
    console.error("[quoteRequest]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── f. rejectRequest ───────────────────────────────────────────────────────────

/**
 * PATCH /api/requests/:id/reject
 * Role: ADMIN
 * Sets rejectionReason; status → REJECTED.
 */
export const rejectRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const request = await prisma.scrapRequest.update({
      where: { id: req.params.id },
      data: {
        status: "REJECTED",
        rejectionReason: rejectionReason || null,
      },
    });

    await createNotification(
      request.userId,
      `Your scrap request #${request.id.slice(0, 8)} has been rejected. Reason: ${rejectionReason || "N/A"}`
    );

    return res.status(200).json({ request });
  } catch (err) {
    console.error("[rejectRequest]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── g. respondToQuote ─────────────────────────────────────────────────────────

/**
 * PATCH /api/requests/:id/respond
 * Role: HOME_USER
 * action: "accept" → SCHEDULED | "reject" → REJECTED
 */
export const respondToQuote = async (req, res) => {
  try {
    const { action } = req.body;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ error: 'action must be "accept" or "reject".' });
    }

    // Verify ownership and status
    const existing = await prisma.scrapRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Request not found." });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    if (existing.status !== "QUOTED") {
      return res.status(409).json({ error: "Request is not in QUOTED status." });
    }

    const newStatus = action === "accept" ? "SCHEDULED" : "REJECTED";

    const request = await prisma.scrapRequest.update({
      where: { id: req.params.id },
      data: { status: newStatus },
    });

    await notifyAdmins(
      `Home user ${req.user.id.slice(0, 8)} ${action}ed the quote on request #${request.id.slice(0, 8)}.`
    );

    return res.status(200).json({ request });
  } catch (err) {
    console.error("[respondToQuote]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── h. scheduleRequest ────────────────────────────────────────────────────────

/**
 * PATCH /api/requests/:id/schedule
 * Role: ADMIN
 * Sets scheduledDate; status → SCHEDULED.
 */
export const scheduleRequest = async (req, res) => {
  try {
    const { scheduledDate } = req.body;

    if (!scheduledDate) {
      return res.status(400).json({ error: "scheduledDate is required." });
    }

    const request = await prisma.scrapRequest.update({
      where: { id: req.params.id },
      data: {
        scheduledDate: new Date(scheduledDate),
        status: "SCHEDULED",
      },
    });

    // Notify the home user
    await createNotification(
      request.userId,
      `Your pickup for request #${request.id.slice(0, 8)} has been scheduled on ${scheduledDate}.`
    );

    // Notify the assigned collector (if any)
    if (request.collectorId) {
      await createNotification(
        request.collectorId,
        `You have been assigned to pickup #${request.id.slice(0, 8)} scheduled on ${scheduledDate}.`
      );
    }

    return res.status(200).json({ request });
  } catch (err) {
    console.error("[scheduleRequest]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── i. collectRequest ─────────────────────────────────────────────────────────

/**
 * PATCH /api/requests/:id/collect
 * Role: COLLECTOR
 * Marks request as COLLECTED and notifies admins.
 */
export const collectRequest = async (req, res) => {
  try {
    const existing = await prisma.scrapRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Request not found." });
    }

    if (existing.collectorId !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    const request = await prisma.scrapRequest.update({
      where: { id: req.params.id },
      data: { status: "COLLECTED" },
    });

    await notifyAdmins(
      `Collector ${req.user.id.slice(0, 8)} has collected request #${request.id.slice(0, 8)}.`
    );

    return res.status(200).json({ request });
  } catch (err) {
    console.error("[collectRequest]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── j. completeRequest ────────────────────────────────────────────────────────

/**
 * PATCH /api/requests/:id/complete
 * Role: ADMIN
 * Marks request COMPLETED and auto-creates Inventory records per item.
 *
 * TODO (Phase 5): Generate a PDF receipt and store the path in request.receiptPath.
 */
export const completeRequest = async (req, res) => {
  try {
    const existing = await prisma.scrapRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Request not found." });
    }

    // Parse items from the stored JSON field
    let items = existing.items;
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        items = [];
      }
    }
    if (!Array.isArray(items)) items = [];

    // Calculate total estimated weight for price-per-kg derivation
    const totalWeight = items.reduce(
      (sum, item) => sum + parseFloat(item.estimatedWeight || 0),
      0
    );

    const adminPrice = parseFloat(existing.adminPrice || 0);

    // Update request status to COMPLETED
    const request = await prisma.scrapRequest.update({
      where: { id: req.params.id },
      data: { status: "COMPLETED" },
    });

    // NOTE: Inventory has @unique on requestId (one row per ScrapRequest).
    // We create a single aggregated Inventory record using the first item's
    // materialType and the summed weight of all items.
    // TODO (Phase 5): Re-evaluate multi-item inventory if the schema is updated.
    if (items.length > 0) {
      const primaryItem = items[0];
      const pricePerKg =
        totalWeight > 0 && adminPrice > 0 ? adminPrice / totalWeight : 0;

      await prisma.inventory.create({
        data: {
          requestId: existing.id,
          materialType: primaryItem.materialType || "STEEL",
          totalKg: totalWeight,
          // reservedKg defaults to 0 (schema default)
          pricePerKg,
          available: true,
        },
      });
    }

    await createNotification(
      request.userId,
      `Your scrap request #${request.id.slice(0, 8)} has been completed. Thank you!`
    );

    return res.status(200).json({ request });
  } catch (err) {
    console.error("[completeRequest]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── k. getAssignedPickups ─────────────────────────────────────────────────────

/**
 * GET /api/requests/assigned
 * Role: COLLECTOR
 * Returns requests where collectorId = req.user.id
 * Supports optional ?status= filter
 */
export const getAssignedPickups = async (req, res) => {
  try {
    const where = { collectorId: req.user.id };
    if (req.query.status) where.status = req.query.status;

    const requests = await prisma.scrapRequest.findMany({
      where,
      include: { user: true, collector: true },
      orderBy: { scheduledDate: 'asc' },
    });

    return res.status(200).json({ requests });
  } catch (err) {
    console.error('[getAssignedPickups]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── l. Notification Helpers ───────────────────────────────────────────────────

/**
 * GET /api/notifications/my
 * Any authenticated role.
 * Returns all notifications for the current user, newest first.
 */
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ notifications });
  } catch (err) {
    console.error("[getMyNotifications]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Any authenticated role.
 * Marks all of the current user's notifications as read.
 */
export const markAllRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });

    return res.status(200).json({ message: "All notifications marked as read." });
  } catch (err) {
    console.error("[markAllRead]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};
