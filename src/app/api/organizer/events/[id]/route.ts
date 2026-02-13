import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session || session.role !== "ORGANIZER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizerId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, location, category, startTime, endTime, capacity, ticketsPerUserLimit, image } = body;

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        location,
        category,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        capacity,
        ticketsPerUserLimit,
        images: image ? {
          deleteMany: {},
          create: {
            originalPath: image.originalPath,
            bannerPath: image.bannerPath,
            thumbPath: image.thumbPath,
            width: image.width,
            height: image.height,
            size: image.size,
          }
        } : undefined,
        status: "DRAFT",
        approvedByAdmin: false,
      },
      include: {
        images: true,
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "UPDATE_EVENT",
        entityType: "EVENT",
        entityId: id,
        metadata: JSON.stringify({ title, category }),
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    console.error("Event update error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session || session.role !== "ORGANIZER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizerId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Start a transaction to delete all related records
    await prisma.$transaction([
      prisma.eventImage.deleteMany({ where: { eventId: id } }),
      prisma.ticket.deleteMany({ where: { eventId: id } }),
      prisma.reservation.deleteMany({ where: { eventId: id } }),
      prisma.event.delete({ where: { id } }),
    ]);

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "DELETE_EVENT",
        entityType: "EVENT",
        entityId: id,
        metadata: JSON.stringify({ title: event.title }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Event deletion error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
