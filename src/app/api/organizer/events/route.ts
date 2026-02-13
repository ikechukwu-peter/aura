import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ORGANIZER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, location, category, startTime, endTime, capacity, ticketsPerUserLimit, image } = body;

    if (!title || !startTime || !endTime || !capacity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        category,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        capacity,
        ticketsPerUserLimit: ticketsPerUserLimit || 5,
        organizerId: session.userId,
        status: "DRAFT",
        approvedByAdmin: false,
        images: image ? {
          create: {
            originalPath: image.originalPath,
            bannerPath: image.bannerPath,
            thumbPath: image.thumbPath,
            width: image.width,
            height: image.height,
            size: image.size,
          }
        } : undefined,
      },
      include: {
        images: true,
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "CREATE_EVENT",
        entityType: "EVENT",
        entityId: event.id,
        metadata: JSON.stringify({ title, category }),
      },
    });

    return NextResponse.json(event);
  } catch (error: any) {
    console.error("Event creation error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
