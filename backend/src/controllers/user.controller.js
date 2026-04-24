import prisma from "../config/prisma.js";
import bcryptjs from "bcryptjs";

// a. getAllUsers
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, sortBy = "createdAt", order = "desc" } = req.query;

    const where = {
      role: { not: "ADMIN" },
    };

    if (role && ["HOME_USER", "COLLECTOR", "BUYER"].includes(role)) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
      // Note: We omit `mode: 'insensitive'` here because Prisma with MySQL
      // throws a validation error for it (MySQL is case-insensitive by default).
    }

    const validSortFields = ["createdAt", "name"];
    const validOrders = ["asc", "desc"];

    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = validOrders.includes(order) ? order : "desc";

    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      include: {
        _count: {
          select: {
            requests: true,
            assignedPickups: true,
            orders: true,
            feedback: true,
          },
        },
      },
    });

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user;
      return rest;
    });

    return res
      .status(200)
      .json({ users: usersWithoutPassword, total: users.length });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// b. getUserById
export const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        requests: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            adminPrice: true,
            createdAt: true,
            scheduledDate: true,
            items: true,
            pickupAddress: true,
          },
        },
        assignedPickups: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            scheduledDate: true,
            createdAt: true,
            pickupAddress: true,
          },
        },
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            inventory: { select: { materialType: true, pricePerKg: true } },
          },
        },
        feedback: {
          select: { id: true, rating: true, comment: true, createdAt: true },
        },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "ADMIN")
      return res.status(403).json({ message: "Cannot view admin accounts" });

    const { password, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch (err) {
    console.error("[GET /api/admin/users/:id]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// c. createUser
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!["HOME_USER", "COLLECTOR", "BUYER"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role must be HOME_USER, COLLECTOR, or BUYER." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "A user with this email already exists." });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        isVerified: true,
        verificationToken: null,
        resetToken: null,
        resetTokenExpiry: null,
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error("[POST /api/admin/users]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// d. updateUser
export const updateUser = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "ADMIN")
      return res.status(403).json({ message: "Cannot modify admin accounts" });

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, phone: phone || null },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return res.status(200).json(userWithoutPassword);
  } catch (err) {
    console.error("[PUT /api/admin/users/:id]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// e. deleteUser
export const deleteUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "ADMIN")
      return res.status(403).json({ message: "Cannot delete admin accounts" });

    if (user.role === "HOME_USER") {
      const activeRequests = await prisma.scrapRequest.count({
        where: {
          userId: req.params.id,
          status: { notIn: ["COMPLETED", "REJECTED"] },
        },
      });
      if (activeRequests > 0) {
        return res.status(409).json({
          message: `Cannot delete user. They have ${activeRequests} active scrap request(s). Resolve or reject them first.`,
        });
      }
    } else if (user.role === "COLLECTOR") {
      const activePickups = await prisma.scrapRequest.count({
        where: {
          collectorId: req.params.id,
          status: { notIn: ["COMPLETED", "REJECTED"] },
        },
      });
      if (activePickups > 0) {
        return res.status(409).json({
          message: `Cannot delete collector. They are assigned to ${activePickups} active pickup(s). Reassign them first.`,
        });
      }
    } else if (user.role === "BUYER") {
      const activeOrders = await prisma.buyerOrder.count({
        where: {
          buyerId: req.params.id,
          status: { in: ["PLACED", "CONFIRMED"] },
        },
      });
      if (activeOrders > 0) {
        return res.status(409).json({
          message: `Cannot delete buyer. They have ${activeOrders} active order(s). Fulfil or cancel them first.`,
        });
      }
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    return res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("[DELETE /api/admin/users/:id]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};
