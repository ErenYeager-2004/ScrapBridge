import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient — Initialized for Prisma v5.
 *
 * In v5, the client manages its own connection using the `url`
 * from schema.prisma. No driver adapters are required.
 */
const prisma = new PrismaClient();

export default prisma;
