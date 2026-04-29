import prisma from "../config/prisma.js";
import { createNotification } from "../services/notification.service.js";
import { generateReceipt } from "../services/pdf.service.js";



/**
 * Fetch all users with role ADMIN and create a notification for each.
 * @param {string} message
 */
const notifyAdmins = async (message) => {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  await Promise.all(admins.map((admin) => createNotification(admin.id, message)));
};



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
      include: { feedback: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ requests });
  } catch (err) {
    console.error("[getMyRequests]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};



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



/**
 * PATCH /api/requests/:id/quote
 * Role: ADMIN
 * Sets adminPrice, adminNotes, proposedDate; status → QUOTED.
 * collectorId is NOT written here — that happens only in schedulePickup after the user accepts.
 */
export const quoteRequest = async (req, res) => {
  try {
    const { adminPrice, adminNotes, proposedDate } = req.body;

    const request = await prisma.scrapRequest.update({
      where: { id: req.params.id },
      data: {
        status: "QUOTED",
        adminPrice: adminPrice !== undefined ? parseFloat(adminPrice) : undefined,
        adminNotes: adminNotes || null,
        scheduledDate: proposedDate ? new Date(proposedDate) : undefined,
      },
    });

    await createNotification(
      request.userId,
      "Your scrap pickup request has been quoted. Review the price and proposed date, then accept or reject."
    );

    return res.status(200).json({ request });
  } catch (err) {
    console.error("[quoteRequest]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};



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



/**
 * PATCH /api/requests/:id/respond
 * Role: HOME_USER
 * action "accept" → status = ACCEPTED (collectorId remains null; admin assigns later)
 * action "reject" → status = REJECTED, collectorId defensively cleared
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

    if (action === "accept") {
      // Move to ACCEPTED — admin will assign collector next via schedulePickup
      const request = await prisma.scrapRequest.update({
        where: { id: req.params.id },
        data: { status: "ACCEPTED" },
      });

      await notifyAdmins(
        "A user has accepted a quote. Please assign a collector for the scheduled pickup."
      );

      return res.status(200).json({ request });
    }

    // action === "reject"
    const request = await prisma.scrapRequest.update({
      where: { id: req.params.id },
      data: {
        status: "REJECTED",
        collectorId: null, // defensive clear
      },
    });

    await notifyAdmins(
      `A user has rejected a quote for request ${request.id}.`
    );

    return res.status(200).json({ request });
  } catch (err) {
    console.error("[respondToQuote]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};



/**
 * PATCH /api/requests/:id/schedule
 * Role: ADMIN
 * Assigns a collector and moves status → SCHEDULED.
 * This is the ONLY place collectorId is ever written to the database.
 * Requires request to be in ACCEPTED status (user has accepted the quote).
 * Optionally accepts a new scheduledDate; otherwise keeps the date set during quoteRequest.
 */
export const schedulePickup = async (req, res) => {
  try {
    const { collectorId, scheduledDate } = req.body;

    if (!collectorId) {
      return res.status(400).json({ error: "collectorId is required." });
    }

    // Verify the request exists and is in ACCEPTED status
    const existing = await prisma.scrapRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Request not found." });
    }

    if (existing.status !== "ACCEPTED") {
      return res
        .status(400)
        .json({ error: "Request must be in ACCEPTED status to assign a collector." });
    }

    // Validate that collectorId belongs to a real COLLECTOR user
    const collectorUser = await prisma.user.findUnique({
      where: { id: collectorId },
    });

    if (!collectorUser || collectorUser.role !== "COLLECTOR") {
      return res.status(400).json({ error: "Invalid collector ID." });
    }

    // Determine final scheduled date: use new value if provided, otherwise keep existing
    const finalScheduledDate = scheduledDate
      ? new Date(scheduledDate)
      : existing.scheduledDate;

    const request = await prisma.scrapRequest.update({
      where: { id: req.params.id },
      data: {
        collectorId,
        status: "SCHEDULED",
        scheduledDate: finalScheduledDate,
      },
    });

    const formattedDate = finalScheduledDate
      ? new Date(finalScheduledDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "a date to be confirmed";

    // Notify the home user
    await createNotification(
      request.userId,
      `Your pickup has been scheduled. A collector has been assigned and will arrive on ${formattedDate}.`
    );

    // Notify the assigned collector
    await createNotification(
      collectorId,
      `You have been assigned a new pickup. Pickup address: ${existing.pickupAddress}. Scheduled date: ${formattedDate}.`
    );

    return res.status(200).json({ request });
  } catch (err) {
    console.error("[schedulePickup]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};



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



/**
 * PATCH /api/requests/:id/complete
 * Role: ADMIN
 * Marks request COMPLETED, auto-creates Inventory records per item,
 * generates a PDF receipt, and notifies the home user.
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

    // PDF Receipt Generation
    // Fetch the home user and assigned collector for the receipt
    const [homeUser, collector] = await Promise.all([
      prisma.user.findUnique({ where: { id: existing.userId } }),
      existing.collectorId
        ? prisma.user.findUnique({ where: { id: existing.collectorId } })
        : Promise.resolve(null),
    ]);

    let receiptPath = null;
    try {
      receiptPath = await generateReceipt(request, homeUser, collector);

      // Persist the receipt path on the ScrapRequest row
      await prisma.scrapRequest.update({
        where: { id: request.id },
        data: { receiptPath },
      });
    } catch (pdfErr) {
      // Non-fatal: log but do not fail the completion
      console.error("[completeRequest] PDF generation failed:", pdfErr);
    }


    await createNotification(
      request.userId,
      `Your scrap request #${request.id.slice(0, 8)} has been completed. Your receipt is ready to download!`
    );

    return res.status(200).json({ request: { ...request, receiptPath } });
  } catch (err) {
    console.error("[completeRequest]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};



/**
 * GET /api/requests/assigned
 * Role: COLLECTOR
 * Returns requests assigned to this collector that are in an active/visible status.
 * Only returns SCHEDULED, COLLECTED, or COMPLETED — never QUOTED or ACCEPTED,
 * which are admin-only workflow states where no collector has been assigned yet.
 * Supports optional ?status= to further narrow within the allowed set.
 */
export const getAssignedPickups = async (req, res) => {
  try {
    // Base filter: only statuses a collector should ever see
    const allowedStatuses = ["SCHEDULED", "COLLECTED", "COMPLETED"];

    const where = {
      collectorId: req.user.id,
      status: { in: allowedStatuses },
    };

    // Optional query-param narrows within the allowed set
    if (req.query.status && allowedStatuses.includes(req.query.status)) {
      where.status = req.query.status;
    }

    const requests = await prisma.scrapRequest.findMany({
      where,
      include: { user: true, collector: true },
      orderBy: { scheduledDate: "asc" },
    });

    return res.status(200).json({ requests });
  } catch (err) {
    console.error("[getAssignedPickups]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};



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
