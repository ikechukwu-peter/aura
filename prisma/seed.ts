import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { TicketingService } from "../src/services/ticketing";
import { UserRole, EventStatus } from "@prisma/client";

async function main() {
  const isProduction = process.env.NODE_ENV === "production";
  const forceSeed = process.env.ENABLE_SEEDING === "true";

  console.log(`Seeding database (Env: ${process.env.NODE_ENV || 'development'})...`);

  // Safety check: Only run full seed in development, or if explicitly forced
  if (isProduction && !forceSeed) {
    console.warn("⚠️  Skipping full seed in production. To force seeding, set ENABLE_SEEDING=true.");
    
    // In production, we ONLY ensure the Super Admin exists if it doesn't
    const passwordHash = await bcrypt.hash("Password123!", 10);
    await prisma.user.upsert({
      where: { email: "superadmin@example.com" },
      update: {},
      create: {
        email: "superadmin@example.com",
        name: "Supreme Overseer",
        passwordHash,
        role: UserRole.SUPER_ADMIN,
      },
    });
    console.log("✅ Super Admin check completed.");
    return;
  }

  // 1. Clear existing data (Only in non-prod or forced)
  console.log("🧹 Cleaning up existing data...");
  await prisma.auditLog.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.eventImage.deleteMany();
  await prisma.event.deleteMany();
  await prisma.organizerProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const passwordHash = await bcrypt.hash("Password123!", 10);

  await prisma.user.create({
    data: {
      email: "superadmin@example.com",
      name: "Supreme Overseer",
      passwordHash,
      role: UserRole.SUPER_ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "System Admin",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: "organizer@example.com",
      name: "Event Pro",
      passwordHash,
      role: UserRole.ORGANIZER,
      organizerProfile: {
        create: {
          displayName: "Pro Events Inc.",
          bio: "We organize the best tech conferences.",
          verified: true,
        },
      },
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      name: "John Doe",
      passwordHash,
      role: UserRole.USER,
    },
  });

  console.log("👥 Users created.");

  // 3. Create Events
  const events = [
    {
      title: "Global Tech Summit 2026",
      description: "The largest gathering of tech innovators.",
      location: "San Francisco, CA",
      category: "Technology",
      startTime: new Date("2026-06-15T09:00:00Z"),
      endTime: new Date("2026-06-17T18:00:00Z"),
      capacity: 500,
      status: EventStatus.PUBLISHED,
      organizerId: organizer.id,
      approvedByAdmin: true,
    },
    {
      title: "Indie Music Festival",
      description: "Celebrating independent artists from around the world.",
      location: "Austin, TX",
      category: "Music",
      startTime: new Date("2026-07-20T12:00:00Z"),
      endTime: new Date("2026-07-22T23:59:00Z"),
      capacity: 2000,
      status: EventStatus.PUBLISHED,
      organizerId: organizer.id,
      approvedByAdmin: true,
    },
    {
      title: "AI & Future Workshop",
      description: "Hands-on workshop on the future of AI.",
      location: "Remote / Online",
      category: "Education",
      startTime: new Date("2026-05-10T14:00:00Z"),
      endTime: new Date("2026-05-10T17:00:00Z"),
      capacity: 50,
      status: EventStatus.DRAFT,
      organizerId: organizer.id,
      approvedByAdmin: false,
    },
  ];

  for (const eventData of events) {
    await prisma.event.create({ data: eventData });
  }

  console.log("📅 Events created.");

  // 4. Sample Ticket for the user
  const techSummit = await prisma.event.findFirst({ where: { title: "Global Tech Summit 2026" } });
  if (techSummit) {
    await TicketingService.reserveTickets({
      userId: user.id,
      eventId: techSummit.id,
      quantity: 1,
      idempotencyKey: "seed-reservation-1",
    });

    const reservation = await prisma.reservation.findUnique({ where: { idempotencyKey: "seed-reservation-1" } });
    if (reservation) {
      await TicketingService.confirmReservation(reservation.id, user.id);
    }
  }

  console.log("✨ Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
