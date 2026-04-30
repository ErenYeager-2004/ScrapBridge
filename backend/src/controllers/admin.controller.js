

import prisma from "../config/prisma.js";
import { generateRequestsCSV, generateInventoryCSV } from "../services/csv.service.js";

// getDashboardStats
// GET /api/admin/stats [ADMIN ONLY]
// Returns metrics for the admin dashboard.
export const getDashboardStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Users grouped by role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    });

    const userCounts = {};
    for (const row of usersByRole) {
      userCounts[row.role] = row._count.id;
    }

    // Active requests count
    const activeRequestsCount = await prisma.scrapRequest.count({
      where: { status: { in: ["PENDING", "QUOTED", "SCHEDULED"] } },
    });

    // Pending buyer orders count
    const pendingOrdersCount = await prisma.buyerOrder.count({
      where: { status: "PLACED" },
    });

    // Total revenue calculation (filtered by days)
    const revenueAggregate = await prisma.scrapRequest.aggregate({
      _sum: { adminPrice: true },
      where: { 
        status: "COMPLETED",
        updatedAt: { gte: cutoffDate }
      },
    });
    const totalRevenue = Number(revenueAggregate._sum.adminPrice ?? 0);

    // Daily request counts (filtered by days)
    const dailyRequests = await prisma.$queryRaw`
      SELECT
        DATE_FORMAT(createdAt, '%Y-%m-%d') AS day,
        COUNT(*)                        AS count
      FROM ScrapRequest
      WHERE createdAt >= ${cutoffDate}
      GROUP BY day
      ORDER BY day ASC
    `;

    const dailyRequestCounts = dailyRequests.map((r) => ({
      day: r.day,
      count: Number(r.count),
    }));

    // Material distribution by type (filtered by days)
    const materialDistribution = await prisma.$queryRaw`
      SELECT
        materialType,
        SUM(totalKg) AS totalWeight
      FROM Inventory
      WHERE createdAt >= ${cutoffDate}
      GROUP BY materialType
      ORDER BY totalWeight DESC
    `;
    const materialData = materialDistribution.map((r) => ({
      materialType: r.materialType,
      totalWeight: Number(r.totalWeight),
    }));

    // Monthly revenue (last 6 months)
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

    // Average feedback rating
    const ratingAggregate = await prisma.feedback.aggregate({
      _avg: { rating: true },
      _count: { id: true },
    });
    const averageRating = ratingAggregate._avg.rating
      ? Number(ratingAggregate._avg.rating.toFixed(2))
      : null;
    const totalFeedbackCount = ratingAggregate._count.id;

    // Respond with combined metrics
    return res.status(200).json({
      userCounts,
      activeRequestsCount,
      pendingOrdersCount,
      totalRevenue,
      dailyRequestCounts,
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

// exportRequests
// GET /api/admin/export/requests [ADMIN ONLY]
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

// exportInventory
// GET /api/admin/export/inventory [ADMIN ONLY]
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

// getCollectors
// GET /api/admin/collectors [ADMIN ONLY]
// Returns all users with role COLLECTOR
export const getCollectors = async (req, res) => {
  try {
    const collectors = await prisma.user.findMany({
      where: { role: "COLLECTOR" },
      select: { id: true, name: true, email: true, phone: true },
    });
    return res.status(200).json({ collectors });
  } catch (err) {
    console.error("[getCollectors]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};
