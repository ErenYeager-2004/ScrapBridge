import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient
 */
const prisma = new PrismaClient();

export default prisma;
