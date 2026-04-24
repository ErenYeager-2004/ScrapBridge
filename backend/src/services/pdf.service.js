/**
 * pdf.service.js
 * Generates a ScrapBridge pickup receipt PDF using pdfkit.
 */

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Receipts directory: backend/receipts/
const RECEIPTS_DIR = path.resolve(__dirname, "../../receipts");

/**
 * Formats a number as Indian Rupee currency string: ₹ X,XXX
 * @param {number|string} amount
 * @returns {string}
 */
const formatINR = (amount) => {
  const num = parseFloat(amount || 0);
  return `\u20B9 ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formats a Date object to a human-readable string.
 * e.g. "22 April 2026, 11:30 AM"
 * @param {Date|string} date
 * @returns {string}
 */
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Generates a PDF pickup receipt and saves it to backend/receipts/.
 *
 * @param {object} request  - ScrapRequest record from Prisma (with items, adminPrice, etc.)
 * @param {object} user     - User record (name, phone)
 * @param {object} collector - Collector record (name) or null
 * @returns {Promise<string>} Relative path to the saved PDF, e.g. "receipts/receipt-<id>.pdf"
 */
export const generateReceipt = (request, user, collector) => {
  return new Promise((resolve, reject) => {
    // Ensure the receipts directory exists
    if (!fs.existsSync(RECEIPTS_DIR)) {
      fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
    }

    const filename = `receipt-${request.id}.pdf`;
    const absolutePath = path.join(RECEIPTS_DIR, filename);
    const relativePath = `receipts/${filename}`;

    // Parse items (stored as JSON in DB)
    let items = request.items;
    if (typeof items === "string") {
      try { items = JSON.parse(items); } catch { items = []; }
    }
    if (!Array.isArray(items)) items = [];

    // PDF Setup
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(absolutePath);

    doc.pipe(stream);

    // Brand colours
    const GREEN  = "#1A7A4A";
    const DARK   = "#1a1a2e";
    const GRAY   = "#6b7280";
    const LIGHT  = "#f9fafb";

    // Header Banner
    doc
      .rect(0, 0, doc.page.width, 100)
      .fill(GREEN);

    doc
      .fillColor("#ffffff")
      .fontSize(28)
      .font("Helvetica-Bold")
      .text("ScrapBridge v2.0", 50, 25, { align: "left" });

    doc
      .fontSize(12)
      .font("Helvetica")
      .text("Digitalising India's Scrap Collection Pipeline", 50, 58, { align: "left" });

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("PICKUP RECEIPT", 50, 58, { align: "right" });

    // Reset fill colour after banner
    doc.fillColor(DARK);

    // Receipt Meta
    const metaTop = 120;

    doc
      .roundedRect(40, metaTop, doc.page.width - 80, 60, 6)
      .fill(LIGHT);

    doc
      .fillColor(GRAY)
      .fontSize(9)
      .font("Helvetica")
      .text("RECEIPT ID", 60, metaTop + 10)
      .text("DATE ISSUED", 300, metaTop + 10);

    doc
      .fillColor(DARK)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(request.id, 60, metaTop + 24, { width: 220, ellipsis: true })
      .text(formatDate(request.updatedAt), 300, metaTop + 24);

    // Section helper
    let y = metaTop + 80;

    const sectionTitle = (title) => {
      doc
        .rect(40, y, doc.page.width - 80, 22)
        .fill(GREEN);

      doc
        .fillColor("#ffffff")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(title, 50, y + 6);

      y += 28;
      doc.fillColor(DARK);
    };

    const row = (label, value, indent = 50) => {
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(GRAY)
        .text(label, indent, y, { continued: false });

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor(DARK)
        .text(value || "N/A", indent + 120, y - 12, { width: 350 });

      y += 18;
    };

    // Customer Details
    sectionTitle("CUSTOMER DETAILS");
    row("Name",          user?.name   || "N/A");
    row("Phone",         user?.phone  || "N/A");
    row("Pickup Address", request.pickupAddress || "N/A");
    y += 6;

    // Collector Details
    sectionTitle("COLLECTOR DETAILS");
    row("Collector Name", collector?.name || "N/A");
    row("Scheduled Date", formatDate(request.scheduledDate));
    y += 6;

    // Materials Table
    sectionTitle("MATERIALS");

    // Table header
    doc
      .rect(40, y, doc.page.width - 80, 20)
      .fill("#e5e7eb");

    doc
      .fillColor(DARK)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("#",             50,  y + 5)
      .text("Material Type", 80,  y + 5)
      .text("Est. Weight",   300, y + 5)
      .text("Notes",         420, y + 5);

    y += 22;
    doc.fillColor(DARK);

    if (items.length === 0) {
      doc.fontSize(10).font("Helvetica").fillColor(GRAY).text("No materials recorded.", 50, y);
      y += 18;
    } else {
      items.forEach((item, idx) => {
        const rowBg = idx % 2 === 0 ? "#ffffff" : LIGHT;
        doc.rect(40, y, doc.page.width - 80, 18).fill(rowBg);

        doc
          .fillColor(DARK)
          .fontSize(9)
          .font("Helvetica")
          .text(String(idx + 1),                              50,  y + 4)
          .text(item.materialType || "N/A",                   80,  y + 4)
          .text(`${parseFloat(item.estimatedWeight || 0)} kg`, 300, y + 4)
          .text(item.notes || "-",                             420, y + 4, { width: 120 });

        y += 20;
      });
    }

    y += 10;

    // Total Price
    doc
      .rect(40, y, doc.page.width - 80, 36)
      .fill(GREEN);

    doc
      .fillColor("#ffffff")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("TOTAL PRICE", 60, y + 10)
      .text(formatINR(request.adminPrice), 0, y + 10, {
        align: "right",
        width: doc.page.width - 60,
      });

    y += 50;

    // Footer
    doc
      .moveTo(40, y)
      .lineTo(doc.page.width - 40, y)
      .strokeColor("#d1fae5")
      .lineWidth(1)
      .stroke();

    y += 14;

    doc
      .fillColor(GREEN)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(
        "Thank you for using ScrapBridge. Your contribution helps the environment.",
        40,
        y,
        { align: "center", width: doc.page.width - 80 }
      );

    doc
      .fillColor(GRAY)
      .fontSize(8)
      .font("Helvetica")
      .text(
        "This is a computer-generated receipt and does not require a signature.",
        40,
        y + 16,
        { align: "center", width: doc.page.width - 80 }
      );

    // Finalise
    doc.end();

    stream.on("finish", () => resolve(relativePath));
    stream.on("error",  (err) => reject(err));
  });
};
