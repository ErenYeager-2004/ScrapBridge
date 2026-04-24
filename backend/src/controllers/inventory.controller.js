import prisma from "../config/prisma.js";

/*
 * addComputedFields — appends availableKg (Number) to each inventory record.
 * Buyers only ever receive availableKg; admins also receive totalKg + reservedKg.
 *
 * @param {object[]} records   - Raw Prisma Inventory records
 * @param {boolean}  adminView - If true, expose totalKg + reservedKg as well
 */
function addComputedFields(records, adminView = false) {
  return records.map((inv) => {
    const totalKg    = parseFloat(inv.totalKg);
    const reservedKg = parseFloat(inv.reservedKg);
    const availableKg = totalKg - reservedKg;

    const base = {
      ...inv,
      availableKg,
    };

    if (!adminView) {
      // Strip sensitive reservation fields from buyer responses
      const { reservedKg: _r, totalKg: _t, ...rest } = base;
      return { ...rest, availableKg };
    }

    return base;
  });
}

// ── getInventory ──────────────────────────────────────────────────────────────

/*
 * getInventory
 * GET /api/inventory
 * Role: ADMIN | BUYER
 *
 * Returns Inventory records where available = true (managed by controllers).
 * Supports query params: ?materialType=, ?minWeight=, ?maxPrice=
 *
 * Response: each record includes a computed `availableKg` field.
 * Buyers do NOT see totalKg or reservedKg.
 */
export const getInventory = async (req, res) => {
  try {
    const { materialType, minWeight, maxPrice } = req.query;

    const where = { available: true };

    if (materialType) {
      where.materialType = materialType.toUpperCase();
    }
    if (minWeight) {
      // Filter on totalKg as a proxy; the fine-grained availableKg guard is on the client.
      where.totalKg = { ...where.totalKg, gte: parseFloat(minWeight) };
    }
    if (maxPrice) {
      where.pricePerKg = { ...where.pricePerKg, lte: parseFloat(maxPrice) };
    }

    const rawInventory = await prisma.inventory.findMany({
      where,
      include: {
        request: {
          select: {
            createdAt: true,
            pickupAddress: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const isAdmin = req.user?.role === "ADMIN";
    const inventory = addComputedFields(rawInventory, isAdmin);

    return res.status(200).json({ inventory });
  } catch (err) {
    console.error("[GET /api/inventory]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── getAllInventory ───────────────────────────────────────────────────────────

/*
 * getAllInventory
 * GET /api/inventory/all
 * Role: ADMIN
 *
 * Returns ALL inventory records (available and unavailable) with:
 * - totalKg, reservedKg, availableKg (computed), pricePerKg, available
 * - source request info and order summaries
 */
export const getAllInventory = async (req, res) => {
  try {
    const rawInventory = await prisma.inventory.findMany({
      include: {
        request: {
          select: {
            id: true,
            createdAt: true,
            pickupAddress: true,
            status: true,
          },
        },
        orders: {
          select: {
            id: true,
            status: true,
            quantityKg: true,
            totalPrice: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const inventory = addComputedFields(rawInventory, /* adminView= */ true);

    return res.status(200).json({ inventory });
  } catch (err) {
    console.error("[GET /api/inventory/all]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};
