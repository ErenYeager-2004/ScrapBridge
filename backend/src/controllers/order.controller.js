import prisma from "../config/prisma.js";
import { createNotification } from "../services/notification.service.js";

// ── placeOrder ────────────────────────────────────────────────────────────────

/**
 * POST /api/orders
 * Role: BUYER
 *
 * Reserves quantityKg from the inventory atomically:
 *  1. Fetch inventory inside the transaction (row-level lock via update).
 *  2. Compute availableKg = totalKg - reservedKg.
 *  3. Guard: quantityKg must not exceed availableKg.
 *  4. Increment reservedKg by quantityKg.
 *  5. Recompute and set available flag.
 *  6. Create BuyerOrder with status PLACED.
 */
export const placeOrder = async (req, res) => {
  try {
    const { inventoryId, quantityKg } = req.body;
    const buyerId = req.user.id;

    if (!inventoryId || !quantityKg) {
      return res.status(400).json({ error: "inventoryId and quantityKg are required." });
    }

    const parsedQty = parseFloat(quantityKg);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({ error: "quantityKg must be a positive number." });
    }

    // Atomic transaction — reserve stock + create order
    const order = await prisma.$transaction(async (tx) => {
      // Fetch current inventory state inside the transaction
      const inventory = await tx.inventory.findUnique({
        where: { id: inventoryId },
      });

      if (!inventory) {
        throw Object.assign(new Error("Inventory item not found."), { statusCode: 404 });
      }

      if (!inventory.available) {
        throw Object.assign(new Error("This inventory item is no longer available."), { statusCode: 400 });
      }

      const currentTotal    = parseFloat(inventory.totalKg);
      const currentReserved = parseFloat(inventory.reservedKg);
      const currentAvailable = currentTotal - currentReserved;

      if (parsedQty > currentAvailable) {
        throw Object.assign(
          new Error(`Insufficient stock. Only ${currentAvailable.toFixed(2)} kg remaining.`),
          { statusCode: 400 }
        );
      }

      const newReservedKg = currentReserved + parsedQty;

      // Increment reservedKg and update available flag
      await tx.inventory.update({
        where: { id: inventoryId },
        data: {
          reservedKg: { increment: parsedQty },
          available: (currentTotal - newReservedKg) > 0,
        },
      });

      // Calculate order total
      const totalPrice = parsedQty * parseFloat(inventory.pricePerKg);

      // Create the order
      const newOrder = await tx.buyerOrder.create({
        data: {
          buyerId,
          inventoryId,
          quantityKg: parsedQty,
          totalPrice,
          status: "PLACED",
        },
      });

      return newOrder;
    });

    // Notify all admins (outside transaction — non-critical)
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    await Promise.all(
      admins.map((admin) =>
        createNotification(
          admin.id,
          `New buyer order placed (Order #${order.id.slice(0, 8)}). Review and confirm.`
        )
      )
    );

    return res.status(201).json({ message: "Order placed successfully.", order });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error("[POST /api/orders]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── getMyOrders ───────────────────────────────────────────────────────────────

/**
 * GET /api/orders/my
 * Role: BUYER
 * Returns all orders for the logged-in buyer, with inventory data included.
 */
export const getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const orders = await prisma.buyerOrder.findMany({
      where: { buyerId },
      include: {
        inventory: {
          include: {
            request: {
              select: {
                pickupAddress: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ orders });
  } catch (err) {
    console.error("[GET /api/orders/my]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── getAllOrders ──────────────────────────────────────────────────────────────

/**
 * GET /api/orders
 * Role: ADMIN
 * Returns all BuyerOrders with buyer info and inventory info.
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.buyerOrder.findMany({
      include: {
        buyer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        inventory: {
          select: {
            id: true,
            materialType: true,
            totalKg: true,
            reservedKg: true,
            pricePerKg: true,
            available: true,
            requestId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ orders });
  } catch (err) {
    console.error("[GET /api/orders]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── confirmOrder ──────────────────────────────────────────────────────────────

/**
 * PATCH /api/orders/:id/confirm
 * Role: ADMIN
 *
 * Finalises the sale:
 *  - Decrements inventory.totalKg by order.quantityKg  (stock is sold)
 *  - Decrements inventory.reservedKg by order.quantityKg (reservation released)
 *  - Updates order status → CONFIRMED
 *  - Notifies buyer
 */
export const confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.buyerOrder.findUnique({
      where: { id },
      include: {
        inventory: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (order.status !== "PLACED") {
      return res.status(400).json({
        error: `Cannot confirm an order with status ${order.status}.`,
      });
    }

    const qty           = parseFloat(order.quantityKg);
    const currentTotal    = parseFloat(order.inventory.totalKg);
    const currentReserved = parseFloat(order.inventory.reservedKg);

    const newTotalKg    = currentTotal - qty;
    const newReservedKg = currentReserved - qty;

    await prisma.$transaction(async (tx) => {
      // Decrement totalKg and reservedKg; recompute available flag
      await tx.inventory.update({
        where: { id: order.inventoryId },
        data: {
          totalKg:    { decrement: qty },
          reservedKg: { decrement: qty },
          available:  (newTotalKg - newReservedKg) > 0,
        },
      });

      // Update order status
      await tx.buyerOrder.update({
        where: { id },
        data: { status: "CONFIRMED" },
      });
    });

    // Notify buyer
    await createNotification(
      order.buyerId,
      `Your order (Order #${id.slice(0, 8)}) has been confirmed. It will be delivered soon.`
    );

    return res.status(200).json({ message: "Order confirmed." });
  } catch (err) {
    console.error("[PATCH /api/orders/:id/confirm]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── deliverOrder ──────────────────────────────────────────────────────────────

/**
 * PATCH /api/orders/:id/deliver
 * Role: ADMIN
 * Updates order status → DELIVERED. No inventory changes — stock was already
 * decremented at confirmation.
 */
export const deliverOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.buyerOrder.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (order.status !== "CONFIRMED") {
      return res.status(400).json({
        error: `Cannot deliver an order with status ${order.status}.`,
      });
    }

    await prisma.buyerOrder.update({
      where: { id },
      data: { status: "DELIVERED" },
    });

    // Notify buyer
    await createNotification(
      order.buyerId,
      `Your order (Order #${id.slice(0, 8)}) has been marked as delivered. Thank you!`
    );

    return res.status(200).json({ message: "Order marked as delivered." });
  } catch (err) {
    console.error("[PATCH /api/orders/:id/deliver]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// ── cancelOrder ───────────────────────────────────────────────────────────────

/**
 * PATCH /api/orders/:id/cancel
 * Role: ADMIN
 *
 * Cancels a PLACED order and releases the reservation:
 *  - Decrements inventory.reservedKg by order.quantityKg (releases held stock)
 *  - Recomputes available flag (item may reappear for buyers)
 *  - Updates order status → CANCELLED
 *  - Notifies buyer
 */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.buyerOrder.findUnique({
      where: { id },
      include: { inventory: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (order.status !== "PLACED") {
      return res.status(400).json({
        error: `Only PLACED orders can be cancelled. Current status: ${order.status}.`,
      });
    }

    const qty            = parseFloat(order.quantityKg);
    const currentTotal    = parseFloat(order.inventory.totalKg);
    const currentReserved = parseFloat(order.inventory.reservedKg);

    const newReservedKg = currentReserved - qty;

    await prisma.$transaction(async (tx) => {
      // Release the reservation
      await tx.inventory.update({
        where: { id: order.inventoryId },
        data: {
          reservedKg: { decrement: qty },
          available:  (currentTotal - newReservedKg) > 0,
        },
      });

      // Mark order cancelled
      await tx.buyerOrder.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
    });

    // Notify buyer
    await createNotification(
      order.buyerId,
      `Your order (Order #${id.slice(0, 8)}) has been cancelled. The reserved stock has been released.`
    );

    return res.status(200).json({ message: "Order cancelled and stock released." });
  } catch (err) {
    console.error("[PATCH /api/orders/:id/cancel]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};
