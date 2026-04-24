// backend/src/services/csv.service.js
// Task 8.1 — CSV Export Service

import { Parser } from "json2csv";
import prisma from "../config/prisma.js";

// ── generateRequestsCSV ──────────────────────────────────────────────────────────
export const generateRequestsCSV = async () => {
  const requests = await prisma.scrapRequest.findMany({
    include: {
      user: true,
      collector: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const data = requests.map((req) => {
    // Summarize items
    let itemsSummary = "";
    try {
      const items = typeof req.items === "string" ? JSON.parse(req.items) : req.items;
      if (Array.isArray(items)) {
        itemsSummary = items.map((i) => `${i.type} (${i.estimatedWeightKg}kg)`).join("; ");
      }
    } catch (err) {
      itemsSummary = "Invalid Items";
    }

    return {
      "Request ID": req.id,
      "User Name": req.user?.name || "N/A",
      "User Email": req.user?.email || "N/A",
      "Contact Phone": req.contactPhone,
      "Pickup Address": req.pickupAddress,
      Status: req.status,
      "Items Summary": itemsSummary,
      "Admin Price (₹)": req.adminPrice ? Number(req.adminPrice) : "N/A",
      "Collector Name": req.collector?.name || "N/A",
      "Scheduled Date": req.scheduledDate ? req.scheduledDate.toISOString() : "N/A",
      "Created At": req.createdAt.toISOString(),
    };
  });

  const fields = [
    "Request ID",
    "User Name",
    "User Email",
    "Contact Phone",
    "Pickup Address",
    "Status",
    "Items Summary",
    "Admin Price (₹)",
    "Collector Name",
    "Scheduled Date",
    "Created At",
  ];

  const parser = new Parser({ fields });
  return parser.parse(data);
};

// ── generateInventoryCSV ─────────────────────────────────────────────────────────
export const generateInventoryCSV = async () => {
  const inventory = await prisma.inventory.findMany({
    include: {
      request: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const data = inventory.map((inv) => ({
    "Inventory ID": inv.id,
    "Material Type": inv.materialType,
    "Total (kg)": Number(inv.totalKg),
    "Reserved (kg)": Number(inv.reservedKg),
    "Available": inv.available ? "Yes" : "No",
    "Price per kg (₹)": Number(inv.pricePerKg),
    "Source Request ID": inv.request?.id || "N/A",
    "Created At": inv.createdAt.toISOString(),
  }));

  const fields = [
    "Inventory ID",
    "Material Type",
    "Total (kg)",
    "Reserved (kg)",
    "Available",
    "Price per kg (₹)",
    "Source Request ID",
    "Created At",
  ];

  const parser = new Parser({ fields });
  return parser.parse(data);
};
