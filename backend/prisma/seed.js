import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB seed...');

  // 1. Create users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const homeuser = await prisma.user.upsert({
    where: { email: 'homeuser@test.com' },
    update: {},
    create: {
      name: 'Home User',
      email: 'homeuser@test.com',
      password: passwordHash,
      phone: '1234567890',
      role: 'HOME_USER',
      isVerified: true
    }
  });

  const collector = await prisma.user.upsert({
    where: { email: 'collector@test.com' },
    update: {},
    create: {
      name: 'Collector',
      email: 'collector@test.com',
      password: passwordHash,
      phone: '1234567891',
      role: 'COLLECTOR',
      isVerified: true
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@test.com',
      password: passwordHash,
      phone: '1234567892',
      role: 'ADMIN',
      isVerified: true
    }
  });

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@test.com' },
    update: {},
    create: {
      name: 'Buyer',
      email: 'buyer@test.com',
      password: passwordHash,
      phone: '1234567893',
      role: 'BUYER',
      isVerified: true
    }
  });
  console.log('Created users');

  // 2. Create ScrapRequests
  const reqPending = await prisma.scrapRequest.create({
    data: {
      userId: homeuser.id,
      status: 'PENDING',
      items: [{ materialType: 'PAPER', estimatedWeight: 5 }],
      photos: [],
      pickupAddress: '123 Main St, Springfield',
      contactPhone: '1234567890'
    }
  });

  const reqQuoted = await prisma.scrapRequest.create({
    data: {
      userId: homeuser.id,
      collectorId: collector.id,
      status: 'QUOTED',
      items: [{ materialType: 'PLASTIC', estimatedWeight: 10 }],
      photos: [],
      pickupAddress: '123 Main St, Springfield',
      contactPhone: '1234567890',
      adminPrice: 50.00,
      adminNotes: 'Good quality'
    }
  });

  const reqCompleted = await prisma.scrapRequest.create({
    data: {
      userId: homeuser.id,
      collectorId: collector.id,
      status: 'COMPLETED',
      items: [{ materialType: 'STEEL', estimatedWeight: 20 }],
      photos: [],
      pickupAddress: '123 Main St, Springfield',
      contactPhone: '1234567890',
      adminPrice: 200.00
    }
  });
  console.log('Created scrap requests');

  // 3. Create Inventory linked to completed request
  const inventory = await prisma.inventory.create({
    data: {
      requestId: reqCompleted.id,
      materialType: 'STEEL',
      totalKg: 20,
      reservedKg: 0,
      pricePerKg: 15.00,
      available: true
    }
  });
  console.log('Created inventory');

  // 4. Create Order
  const order = await prisma.buyerOrder.create({
    data: {
      buyerId: buyer.id,
      inventoryId: inventory.id,
      quantityKg: 10,
      totalPrice: 150.00,
      status: 'PLACED'
    }
  });
  
  await prisma.inventory.update({
    where: { id: inventory.id },
    data: { reservedKg: { increment: 10 } }
  });
  console.log('Created order');

  // 5. Create Feedback
  await prisma.feedback.create({
    data: {
      requestId: reqCompleted.id,
      userId: homeuser.id,
      rating: 5,
      comment: 'Excellent service, right on time!'
    }
  });
  console.log('Created feedback');

  console.log('DB seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
