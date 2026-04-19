import { PrismaClient } from "@prisma/client";

// Singleton: this is the ONLY PrismaClient instance in the project.
// Every controller and service must import `prisma` from here.
const prisma = new PrismaClient();

export default prisma;
