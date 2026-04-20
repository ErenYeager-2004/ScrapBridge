import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  // ── Seed Admin ──────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: "ADMIN" },
    create: {
      name: "Super Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
      isVerified: true,
    },
  });

  // ── Seed Home User ──────────────────────────────────────────
  const homeUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: { role: "HOME_USER" },
    create: {
      name: "Test Home User",
      email: "user@example.com",
      password: hashedPassword,
      role: "HOME_USER",
      isVerified: true,
    },
  });

  // ── Seed Collector ──────────────────────────────────────────
  const collector = await prisma.user.upsert({
    where: { email: "collector@example.com" },
    update: { role: "COLLECTOR" },
    create: {
      name: "Test Collector",
      email: "collector@example.com",
      password: hashedPassword,
      role: "COLLECTOR",
      isVerified: true,
    },
  });

  // ── Seed Buyer ──────────────────────────────────────────────
  const buyer = await prisma.user.upsert({
    where: { email: "buyer@example.com" },
    update: { role: "BUYER" },
    create: {
      name: "Test Buyer",
      email: "buyer@example.com",
      password: hashedPassword,
      role: "BUYER",
      isVerified: true,
    },
  });

  console.log("\n✅ Seed complete! Test accounts:");
  console.log("─".repeat(45));
  console.log(`   Admin     → ${admin.email}`);
  console.log(`   Home User → ${homeUser.email}`);
  console.log(`   Collector → ${collector.email}`);
  console.log(`   Buyer     → ${buyer.email}`);
  console.log(`   Password  → ${password}  (all accounts)`);
  console.log("─".repeat(45));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
