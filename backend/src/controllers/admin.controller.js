// backend/src/controllers/admin.controller.js
// Task 7.1 — Admin Dashboard Stats Aggregation

import prisma from "../config/prisma.js";
import { generateRequestsCSV, generateInventoryCSV } from "../services/csv.service.js";

// ── getDashboardStats ─────────────────────────────────────────────────────────
// GET /api/admin/stats  [ADMIN only]
// Returns a single JSON object with all metrics needed by the admin dashboard.
export const getDashboardStats = async (req, res) => {
  try {
    // ── a. Users grouped by role ─────────────────────────────────────────────
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    });
    // Shape: { HOME_USER: n, ADMIN: n, COLLECTOR: n, BUYER: n }
    const userCounts = {};
    for (const row of usersByRole) {
      userCounts[row.role] = row._count.id;
    }

    // ── b. Active requests (PENDING | QUOTED | SCHEDULED) ────────────────────
    const activeRequestsCount = await prisma.scrapRequest.count({
      where: { status: { in: ["PENDING", "QUOTED", "SCHEDULED"] } },
    });

    // ── c. Pending buyer orders (status = PLACED) ────────────────────────────
    const pendingOrdersCount = await prisma.buyerOrder.count({
      where: { status: "PLACED" },
    });

    // ── d. Total revenue (sum of adminPrice where status = COMPLETED) ────────
    const revenueAggregate = await prisma.scrapRequest.aggregate({
      _sum: { adminPrice: true },
      where: { status: "COMPLETED" },
    });
    const totalRevenue = Number(revenueAggregate._sum.adminPrice ?? 0);

    // ── e. Weekly request counts — last 30 days ──────────────────────────────
    // Groups by ISO year-week (e.g. "2026-16").
    const weeklyRequests = await prisma.$queryRaw`
      SELECT
        DATE_FORMAT(createdAt, '%Y-%u') AS week,
        COUNT(*)                        AS count
      FROM ScrapRequest
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY week
      ORDER BY week ASC
    `;
    // BigInt → Number coercion for JSON serialisation
    const weeklyRequestCounts = weeklyRequests.map((r) => ({
      week: r.week,
      count: Number(r.count),
    }));

    // ── f. Material distribution (Inventory table, grouped by materialType) ──
    const materialDistribution = await prisma.$queryRaw`
      SELECT
        materialType,
        SUM(totalKg) AS totalWeight
      FROM Inventory
      GROUP BY materialType
      ORDER BY totalWeight DESC
    `;
    const materialData = materialDistribution.map((r) => ({
      materialType: r.materialType,
      totalWeight: Number(r.totalWeight),
    }));

    // ── g. Monthly revenue — last 6 months ───────────────────────────────────
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT
        DATE_FORMAT(createdAt, '%Y-%m') AS month,
        SUM(adminPrice)                 AS revenue
      FROM ScrapRequest
      WHERE status = 'COMPLETED'
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `;
    const monthlyRevenueData = monthlyRevenue.map((r) => ({
      month: r.month,
      revenue: Number(r.revenue ?? 0),
    }));

    // ── h. Average feedback rating ───────────────────────────────────────────
    const ratingAggregate = await prisma.feedback.aggregate({
      _avg: { rating: true },
      _count: { id: true },
    });
    const averageRating = ratingAggregate._avg.rating
      ? Number(ratingAggregate._avg.rating.toFixed(2))
      : null;
    const totalFeedbackCount = ratingAggregate._count.id;

    // ── Combine & respond ────────────────────────────────────────────────────
    return res.status(200).json({
      userCounts,
      activeRequestsCount,
      pendingOrdersCount,
      totalRevenue,
      weeklyRequestCounts,
      materialDistribution: materialData,
      monthlyRevenue: monthlyRevenueData,
      averageRating,
      totalFeedbackCount,
    });
  } catch (err) {
    console.error("[getDashboardStats]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── exportRequests ─────────────────────────────────────────────────────────────
// GET /api/admin/export/requests [ADMIN only]
export const exportRequests = async (req, res) => {
  try {
    const csvString = await generateRequestsCSV();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="scrapbridge-requests.csv"');
    return res.status(200).send(csvString);
  } catch (err) {
    console.error("[exportRequests]", err);
    return res.status(500).json({ error: "Failed to export requests CSV." });
  }
};

// ── exportInventory ────────────────────────────────────────────────────────────
// GET /api/admin/export/inventory [ADMIN only]
export const exportInventory = async (req, res) => {
  try {
    const csvString = await generateInventoryCSV();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="scrapbridge-inventory.csv"');
    return res.status(200).send(csvString);
  } catch (err) {
    console.error("[exportInventory]", err);
    return res.status(500).json({ error: "Failed to export inventory CSV." });
  }
};
