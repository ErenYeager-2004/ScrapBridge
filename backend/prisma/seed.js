import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DB seed...');

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 1 — USERS (11 total)
  // ─────────────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const [user1, user2, user3, seedstock] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'user1@test.com' },
      update: {},
      create: { name: 'User1', email: 'user1@test.com', password: passwordHash, phone: '9000000001', role: 'HOME_USER', isVerified: true }
    }),
    prisma.user.upsert({
      where: { email: 'user2@test.com' },
      update: {},
      create: { name: 'User2', email: 'user2@test.com', password: passwordHash, phone: '9000000002', role: 'HOME_USER', isVerified: true }
    }),
    prisma.user.upsert({
      where: { email: 'user3@test.com' },
      update: {},
      create: { name: 'User3', email: 'user3@test.com', password: passwordHash, phone: '9000000003', role: 'HOME_USER', isVerified: true }
    }),
    prisma.user.upsert({
      where: { email: 'seedstock@scrapbridge.com' },
      update: {},
      create: { name: 'Seed Stock', email: 'seedstock@scrapbridge.com', password: passwordHash, phone: '9000000004', role: 'HOME_USER', isVerified: true }
    }),
  ]);

  const [collector1, collector2, collector3] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'collector1@test.com' },
      update: {},
      create: { name: 'Collector1', email: 'collector1@test.com', password: passwordHash, phone: '9000000011', role: 'COLLECTOR', isVerified: true }
    }),
    prisma.user.upsert({
      where: { email: 'collector2@test.com' },
      update: {},
      create: { name: 'Collector2', email: 'collector2@test.com', password: passwordHash, phone: '9000000012', role: 'COLLECTOR', isVerified: true }
    }),
    prisma.user.upsert({
      where: { email: 'collector3@test.com' },
      update: {},
      create: { name: 'Collector3', email: 'collector3@test.com', password: passwordHash, phone: '9000000013', role: 'COLLECTOR', isVerified: true }
    }),
  ]);

  const [buyer1, buyer2, buyer3] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'buyer1@test.com' },
      update: {},
      create: { name: 'Buyer1', email: 'buyer1@test.com', password: passwordHash, phone: '9000000021', role: 'BUYER', isVerified: true }
    }),
    prisma.user.upsert({
      where: { email: 'buyer2@test.com' },
      update: {},
      create: { name: 'Buyer2', email: 'buyer2@test.com', password: passwordHash, phone: '9000000022', role: 'BUYER', isVerified: true }
    }),
    prisma.user.upsert({
      where: { email: 'buyer3@test.com' },
      update: {},
      create: { name: 'Buyer3', email: 'buyer3@test.com', password: passwordHash, phone: '9000000023', role: 'BUYER', isVerified: true }
    }),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@scrapbridge.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@scrapbridge.com', password: passwordHash, phone: '9000000099', role: 'ADMIN', isVerified: true }
  });

  console.log('✅ Users created (11)');

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 2 — SCRAP REQUESTS (22 total)
  // ─────────────────────────────────────────────────────────────────────────
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  // Helper: relative date from now
  const daysFromNow = (d) => new Date(now + d * DAY);

  // ── User1 requests (R01–R06) ──────────────────────────────────────────────

  // R01: PENDING, PAPER
  const R01 = await prisma.scrapRequest.create({ data: {
    userId: user1.id,
    status: 'PENDING',
    items: [{ materialType: 'PAPER', estimatedWeight: 5 }],
    photos: [],
    pickupAddress: '12 Maple Street, Mumbai',
    contactPhone: '9000000001'
  }});

  // R02: PENDING, PLASTIC
  const R02 = await prisma.scrapRequest.create({ data: {
    userId: user1.id,
    status: 'PENDING',
    items: [{ materialType: 'PLASTIC', estimatedWeight: 8 }],
    photos: [],
    pickupAddress: '12 Maple Street, Mumbai',
    contactPhone: '9000000001'
  }});

  // R03: QUOTED, STEEL — proposed date +7 days, no collectorId
  const R03 = await prisma.scrapRequest.create({ data: {
    userId: user1.id,
    status: 'QUOTED',
    items: [{ materialType: 'STEEL', estimatedWeight: 15 }],
    photos: [],
    pickupAddress: '12 Maple Street, Mumbai',
    contactPhone: '9000000001',
    adminPrice: 750,
    adminNotes: 'Good quality steel. Proposed pickup in 7 days.',
    scheduledDate: daysFromNow(7)
  }});

  // R04: ACCEPTED, COPPER — user accepted; collector not yet assigned
  const R04 = await prisma.scrapRequest.create({ data: {
    userId: user1.id,
    collectorId: null,
    status: 'ACCEPTED',
    items: [{ materialType: 'COPPER', estimatedWeight: 6 }],
    photos: [],
    pickupAddress: '12 Maple Street, Mumbai',
    contactPhone: '9000000001',
    adminPrice: 1200,
    adminNotes: 'Proposed date confirmed by user. Collector assignment pending.',
    scheduledDate: daysFromNow(4)
  }});

  // R05: COMPLETED, ALUMINIUM — collector1, → Inventory + Feedback
  const R05 = await prisma.scrapRequest.create({ data: {
    userId: user1.id,
    collectorId: collector1.id,
    status: 'COMPLETED',
    items: [{ materialType: 'ALUMINIUM', estimatedWeight: 12 }],
    photos: [],
    pickupAddress: '12 Maple Street, Mumbai',
    contactPhone: '9000000001',
    adminPrice: 960,
    scheduledDate: daysFromNow(2)
  }});

  // R06: COMPLETED, BRASS — collector2, → Inventory + Feedback
  const R06 = await prisma.scrapRequest.create({ data: {
    userId: user1.id,
    collectorId: collector2.id,
    status: 'COMPLETED',
    items: [{ materialType: 'BRASS', estimatedWeight: 10 }],
    photos: [],
    pickupAddress: '12 Maple Street, Mumbai',
    contactPhone: '9000000001',
    adminPrice: 1500,
    scheduledDate: daysFromNow(2)
  }});

  // ── User2 requests (R07–R12) ──────────────────────────────────────────────

  // R07: PENDING, CARDBOARD
  const R07 = await prisma.scrapRequest.create({ data: {
    userId: user2.id,
    status: 'PENDING',
    items: [{ materialType: 'CARDBOARD', estimatedWeight: 20 }],
    photos: [],
    pickupAddress: '34 Oak Lane, Delhi',
    contactPhone: '9000000002'
  }});

  // R08: PENDING, GLASS
  const R08 = await prisma.scrapRequest.create({ data: {
    userId: user2.id,
    status: 'PENDING',
    items: [{ materialType: 'GLASS', estimatedWeight: 7 }],
    photos: [],
    pickupAddress: '34 Oak Lane, Delhi',
    contactPhone: '9000000002'
  }});

  // R09: QUOTED, EWASTE — proposed date +6 days, no collectorId
  const R09 = await prisma.scrapRequest.create({ data: {
    userId: user2.id,
    status: 'QUOTED',
    items: [{ materialType: 'EWASTE', estimatedWeight: 4 }],
    photos: [],
    pickupAddress: '34 Oak Lane, Delhi',
    contactPhone: '9000000002',
    adminPrice: 2000,
    adminNotes: 'E-waste requires careful handling. Proposed pickup in 6 days.',
    scheduledDate: daysFromNow(6)
  }});

  // R10: ACCEPTED, PAPER — user accepted; collector not yet assigned
  const R10 = await prisma.scrapRequest.create({ data: {
    userId: user2.id,
    collectorId: null,
    status: 'ACCEPTED',
    items: [{ materialType: 'PAPER', estimatedWeight: 9 }],
    photos: [],
    pickupAddress: '34 Oak Lane, Delhi',
    contactPhone: '9000000002',
    adminPrice: 360,
    adminNotes: 'Proposed date confirmed by user. Collector assignment pending.',
    scheduledDate: daysFromNow(3)
  }});

  // R11: COMPLETED, PLASTIC — collector2, → Inventory + Feedback
  const R11 = await prisma.scrapRequest.create({ data: {
    userId: user2.id,
    collectorId: collector2.id,
    status: 'COMPLETED',
    items: [{ materialType: 'PLASTIC', estimatedWeight: 18 }],
    photos: [],
    pickupAddress: '34 Oak Lane, Delhi',
    contactPhone: '9000000002',
    adminPrice: 720,
    scheduledDate: daysFromNow(2)
  }});

  // R12: COMPLETED, STEEL — collector3, → Inventory + Feedback
  const R12 = await prisma.scrapRequest.create({ data: {
    userId: user2.id,
    collectorId: collector3.id,
    status: 'COMPLETED',
    items: [{ materialType: 'STEEL', estimatedWeight: 25 }],
    photos: [],
    pickupAddress: '34 Oak Lane, Delhi',
    contactPhone: '9000000002',
    adminPrice: 1875,
    scheduledDate: daysFromNow(2)
  }});

  // ── User3 requests (R13–R18) ──────────────────────────────────────────────

  // R13: PENDING, PET_BOTTLES
  const R13 = await prisma.scrapRequest.create({ data: {
    userId: user3.id,
    status: 'PENDING',
    items: [{ materialType: 'PET_BOTTLES', estimatedWeight: 6 }],
    photos: [],
    pickupAddress: '78 Pine Road, Bengaluru',
    contactPhone: '9000000003'
  }});

  // R14: PENDING, ALUMINIUM
  const R14 = await prisma.scrapRequest.create({ data: {
    userId: user3.id,
    status: 'PENDING',
    items: [{ materialType: 'ALUMINIUM', estimatedWeight: 9 }],
    photos: [],
    pickupAddress: '78 Pine Road, Bengaluru',
    contactPhone: '9000000003'
  }});

  // R15: QUOTED, COPPER — proposed date +5 days, no collectorId
  const R15 = await prisma.scrapRequest.create({ data: {
    userId: user3.id,
    status: 'QUOTED',
    items: [{ materialType: 'COPPER', estimatedWeight: 5 }],
    photos: [],
    pickupAddress: '78 Pine Road, Bengaluru',
    contactPhone: '9000000003',
    adminPrice: 1000,
    adminNotes: 'High-grade copper. Proposed pickup in 5 days.',
    scheduledDate: daysFromNow(5)
  }});

  // R16: ACCEPTED, BRASS — user accepted; collector not yet assigned
  const R16 = await prisma.scrapRequest.create({ data: {
    userId: user3.id,
    collectorId: null,
    status: 'ACCEPTED',
    items: [{ materialType: 'BRASS', estimatedWeight: 7 }],
    photos: [],
    pickupAddress: '78 Pine Road, Bengaluru',
    contactPhone: '9000000003',
    adminPrice: 1050,
    adminNotes: 'Proposed date confirmed by user. Collector assignment pending.',
    scheduledDate: daysFromNow(2)
  }});

  // R17: COMPLETED, CARDBOARD — collector1, → Inventory + Feedback
  const R17 = await prisma.scrapRequest.create({ data: {
    userId: user3.id,
    collectorId: collector1.id,
    status: 'COMPLETED',
    items: [{ materialType: 'CARDBOARD', estimatedWeight: 30 }],
    photos: [],
    pickupAddress: '78 Pine Road, Bengaluru',
    contactPhone: '9000000003',
    adminPrice: 600,
    scheduledDate: daysFromNow(2)
  }});

  // R18: COMPLETED, GLASS — collector3, → Inventory + Feedback
  const R18 = await prisma.scrapRequest.create({ data: {
    userId: user3.id,
    collectorId: collector3.id,
    status: 'COMPLETED',
    items: [{ materialType: 'GLASS', estimatedWeight: 14 }],
    photos: [],
    pickupAddress: '78 Pine Road, Bengaluru',
    contactPhone: '9000000003',
    adminPrice: 700,
    scheduledDate: daysFromNow(2)
  }});

  // ── Seed Stock requests (R19–R20) — extra inventory only ─────────────────

  // R19: COMPLETED, EWASTE — collector1, → Inventory only (no feedback)
  const R19 = await prisma.scrapRequest.create({ data: {
    userId: seedstock.id,
    collectorId: collector1.id,
    status: 'COMPLETED',
    items: [{ materialType: 'EWASTE', estimatedWeight: 10 }],
    photos: [],
    pickupAddress: '99 Stock Depot, Chennai',
    contactPhone: '9000000004',
    adminPrice: 5000,
    scheduledDate: daysFromNow(2)
  }});

  // R20: COMPLETED, PET_BOTTLES — collector2, → Inventory only (no feedback)
  const R20 = await prisma.scrapRequest.create({ data: {
    userId: seedstock.id,
    collectorId: collector2.id,
    status: 'COMPLETED',
    items: [{ materialType: 'PET_BOTTLES', estimatedWeight: 20 }],
    photos: [],
    pickupAddress: '99 Stock Depot, Chennai',
    contactPhone: '9000000004',
    adminPrice: 600,
    scheduledDate: daysFromNow(2)
  }});

  // ── Live collector state requests (R21–R22) ───────────────────────────────

  // R21: SCHEDULED, STEEL — collector1, appears in AssignedPickups
  const R21 = await prisma.scrapRequest.create({ data: {
    userId: user1.id,
    collectorId: collector1.id,
    status: 'SCHEDULED',
    items: [{ materialType: 'STEEL', estimatedWeight: 10 }],
    photos: [],
    pickupAddress: '12 Maple Street, Mumbai',
    contactPhone: '9000000001',
    adminPrice: 500,
    scheduledDate: daysFromNow(1)
  }});

  // R22: COLLECTED, COPPER — collector2, pending admin completion
  const R22 = await prisma.scrapRequest.create({ data: {
    userId: user2.id,
    collectorId: collector2.id,
    status: 'COLLECTED',
    items: [{ materialType: 'COPPER', estimatedWeight: 8 }],
    photos: [],
    pickupAddress: '34 Oak Lane, Delhi',
    contactPhone: '9000000002',
    adminPrice: 1600,
    scheduledDate: daysFromNow(-1) // yesterday
  }});

  console.log('✅ ScrapRequests created (22)');

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 3 — INVENTORY (8 entries)
  // One row per COMPLETED request. Reserved/total kg accounts for all orders below.
  //
  // INV01 (ALUMINIUM, R05):  totalKg=12, reservedKg=5  — ORD01 (5kg PLACED)
  // INV02 (BRASS, R06):      totalKg=10, reservedKg=4  — ORD04 (4kg CONFIRMED)
  // INV03 (PLASTIC, R11):    totalKg=18, reservedKg=14 — ORD02 (8kg PLACED) + ORD07 (6kg PLACED)
  // INV04 (STEEL, R12):      totalKg=15, reservedKg=0  — ORD05 (10kg DELIVERED; 25-10=15 at seed time)
  // INV05 (CARDBOARD, R17):  totalKg=30, reservedKg=20 — ORD08 (15kg CONFIRMED) + ORD11 (5kg PLACED)
  // INV06 (GLASS, R18):      totalKg=14, reservedKg=7  — ORD03 (7kg PLACED)
  // INV07 (EWASTE, R19):     totalKg=10, reservedKg=5  — ORD09 (3kg PLACED) + ORD10 (2kg CONFIRMED)
  // INV08 (PET_BOTTLES, R20):totalKg=20, reservedKg=8  — ORD06 (8kg PLACED)
  // ─────────────────────────────────────────────────────────────────────────

  const INV01 = await prisma.inventory.create({ data: {
    requestId: R05.id, materialType: 'ALUMINIUM', totalKg: 12, reservedKg: 5, pricePerKg: 80, available: true
  }});

  const INV02 = await prisma.inventory.create({ data: {
    requestId: R06.id, materialType: 'BRASS', totalKg: 10, reservedKg: 4, pricePerKg: 150, available: true
  }});

  const INV03 = await prisma.inventory.create({ data: {
    requestId: R11.id, materialType: 'PLASTIC', totalKg: 18, reservedKg: 14, pricePerKg: 40, available: true
  }});

  // INV04: ORD05 was DELIVERED — 10 kg already removed from stock.
  // Seed reflects post-delivery state: totalKg = 25 − 10 = 15, reservedKg = 0.
  const INV04 = await prisma.inventory.create({ data: {
    requestId: R12.id, materialType: 'STEEL', totalKg: 15, reservedKg: 0, pricePerKg: 75, available: true
  }});

  const INV05 = await prisma.inventory.create({ data: {
    requestId: R17.id, materialType: 'CARDBOARD', totalKg: 30, reservedKg: 20, pricePerKg: 20, available: true
  }});

  const INV06 = await prisma.inventory.create({ data: {
    requestId: R18.id, materialType: 'GLASS', totalKg: 14, reservedKg: 7, pricePerKg: 50, available: true
  }});

  const INV07 = await prisma.inventory.create({ data: {
    requestId: R19.id, materialType: 'EWASTE', totalKg: 10, reservedKg: 5, pricePerKg: 500, available: true
  }});

  const INV08 = await prisma.inventory.create({ data: {
    requestId: R20.id, materialType: 'PET_BOTTLES', totalKg: 20, reservedKg: 8, pricePerKg: 30, available: true
  }});

  console.log('✅ Inventory created (8)');

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 4 — BUYER ORDERS (11 total)
  // ─────────────────────────────────────────────────────────────────────────

  // Buyer1 orders
  await prisma.buyerOrder.create({ data: { buyerId: buyer1.id, inventoryId: INV01.id, quantityKg: 5,  totalPrice: 400,  status: 'PLACED'     }}); // ORD01
  await prisma.buyerOrder.create({ data: { buyerId: buyer1.id, inventoryId: INV03.id, quantityKg: 8,  totalPrice: 320,  status: 'PLACED'     }}); // ORD02
  await prisma.buyerOrder.create({ data: { buyerId: buyer1.id, inventoryId: INV06.id, quantityKg: 7,  totalPrice: 350,  status: 'PLACED'     }}); // ORD03
  await prisma.buyerOrder.create({ data: { buyerId: buyer1.id, inventoryId: INV07.id, quantityKg: 2,  totalPrice: 1000, status: 'CONFIRMED'  }}); // ORD10

  // Buyer2 orders
  await prisma.buyerOrder.create({ data: { buyerId: buyer2.id, inventoryId: INV02.id, quantityKg: 4,  totalPrice: 600,  status: 'CONFIRMED'  }}); // ORD04
  await prisma.buyerOrder.create({ data: { buyerId: buyer2.id, inventoryId: INV04.id, quantityKg: 10, totalPrice: 750,  status: 'DELIVERED'  }}); // ORD05
  await prisma.buyerOrder.create({ data: { buyerId: buyer2.id, inventoryId: INV08.id, quantityKg: 8,  totalPrice: 240,  status: 'PLACED'     }}); // ORD06
  await prisma.buyerOrder.create({ data: { buyerId: buyer2.id, inventoryId: INV05.id, quantityKg: 5,  totalPrice: 100,  status: 'PLACED'     }}); // ORD11

  // Buyer3 orders
  await prisma.buyerOrder.create({ data: { buyerId: buyer3.id, inventoryId: INV03.id, quantityKg: 6,  totalPrice: 240,  status: 'PLACED'     }}); // ORD07
  await prisma.buyerOrder.create({ data: { buyerId: buyer3.id, inventoryId: INV05.id, quantityKg: 15, totalPrice: 300,  status: 'CONFIRMED'  }}); // ORD08
  await prisma.buyerOrder.create({ data: { buyerId: buyer3.id, inventoryId: INV07.id, quantityKg: 3,  totalPrice: 1500, status: 'PLACED'     }}); // ORD09

  console.log('✅ Buyer orders created (11)');

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 5 — FEEDBACK (6 entries)
  // Only user1/user2/user3 COMPLETED requests. Seed stock requests get none.
  // ─────────────────────────────────────────────────────────────────────────

  await prisma.feedback.create({ data: { requestId: R05.id, userId: user1.id, rating: 5, comment: 'Fast pickup, great service!' }});
  await prisma.feedback.create({ data: { requestId: R06.id, userId: user1.id, rating: 4, comment: 'Good experience, slight delay.' }});
  await prisma.feedback.create({ data: { requestId: R11.id, userId: user2.id, rating: 5, comment: 'Very professional collector.' }});
  await prisma.feedback.create({ data: { requestId: R12.id, userId: user2.id, rating: 3, comment: 'Could improve communication.' }});
  await prisma.feedback.create({ data: { requestId: R17.id, userId: user3.id, rating: 5, comment: 'Excellent! Highly recommended.' }});
  await prisma.feedback.create({ data: { requestId: R18.id, userId: user3.id, rating: 4, comment: 'Smooth process overall.' }});

  console.log('✅ Feedback created (6)');

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 6 — NOTIFICATIONS (11 total, all unread)
  // ─────────────────────────────────────────────────────────────────────────

  await Promise.all([
    // user1
    prisma.notification.create({ data: { userId: user1.id, message: 'Your scrap pickup request has been quoted. Review the price and proposed date, then accept or reject.', read: false }}),
    prisma.notification.create({ data: { userId: user1.id, message: 'Your pickup has been scheduled. A collector has been assigned.', read: false }}),
    // user2
    prisma.notification.create({ data: { userId: user2.id, message: 'Your scrap pickup request has been quoted. Review the price and proposed date, then accept or reject.', read: false }}),
    prisma.notification.create({ data: { userId: user2.id, message: 'Your pickup has been scheduled. A collector has been assigned.', read: false }}),
    // user3
    prisma.notification.create({ data: { userId: user3.id, message: 'Your scrap pickup request has been quoted. Review the price and proposed date, then accept or reject.', read: false }}),
    prisma.notification.create({ data: { userId: user3.id, message: 'Your pickup has been scheduled. A collector has been assigned.', read: false }}),
    // collectors
    prisma.notification.create({ data: { userId: collector1.id, message: 'You have been assigned a new pickup. Please check your assigned pickups.', read: false }}),
    prisma.notification.create({ data: { userId: collector2.id, message: 'You have been assigned a new pickup. Please check your assigned pickups.', read: false }}),
    prisma.notification.create({ data: { userId: collector3.id, message: 'You have been assigned a new pickup. Please check your assigned pickups.', read: false }}),
    // admin
    prisma.notification.create({ data: { userId: admin.id, message: 'A user has accepted a quote. Please assign a collector for the scheduled pickup.', read: false }}),
    prisma.notification.create({ data: { userId: admin.id, message: 'A new scrap pickup request has been submitted and is awaiting review.', read: false }}),
  ]);

  console.log('✅ Notifications created (11)');

  console.log('\n🎉 DB seed complete! Summary:');
  console.log('   👤 Users:         11 (user1–3, collector1–3, buyer1–3, seedstock, admin)');
  console.log('   📦 Requests:      22 (R01–R22)');
  console.log('   🏭 Inventory:      8 (INV01–INV08)');
  console.log('   🛒 Orders:        11 (ORD01–ORD11)');
  console.log('   ⭐ Feedback:       6');
  console.log('   🔔 Notifications: 11');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
