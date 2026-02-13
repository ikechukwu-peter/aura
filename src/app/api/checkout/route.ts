import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateTicketToken } from "@/lib/qr";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: eventId, quantity = 1 } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    if (quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // 1. Check if event exists and has capacity
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { tickets: { where: { userId: session.userId } } },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventPrice = (event as any).price || 0;

    if (event.status !== "PUBLISHED" || !event.approvedByAdmin) {
      return NextResponse.json({ error: "Event is not available" }, { status: 400 });
    }

    const availableCapacity = event.capacity - event.ticketsIssuedCount;
    if (availableCapacity < quantity) {
      return NextResponse.json(
        { error: `Only ${availableCapacity} tickets remaining for this event.` },
        { status: 400 }
      );
    }

    // 2. Check if user already has a ticket and respect limit
    if (event.tickets.length + quantity > event.ticketsPerUserLimit) {
      const remainingLimit = event.ticketsPerUserLimit - event.tickets.length;
      return NextResponse.json(
        { error: remainingLimit > 0 
          ? `You can only acquire ${remainingLimit} more ticket(s).` 
          : `You have already reached the limit of ${event.ticketsPerUserLimit} tickets for this event.` 
        },
        { status: 400 }
      );
    }

    // 3. Create tickets in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Re-check capacity inside transaction
      const currentEvent = await tx.event.findUnique({
        where: { id: eventId },
        select: { ticketsIssuedCount: true, capacity: true },
      });

      if (!currentEvent || (currentEvent.capacity - currentEvent.ticketsIssuedCount) < quantity) {
        throw new Error("Event capacity reached during transaction");
      }

      const tickets = [];
      
      for (let i = 0; i < quantity; i++) {
        const ticketCode = `TKT-${uuidv4().substring(0, 8).toUpperCase()}`;
        const ticketId = uuidv4();

        // Generate QR payload
        const qrPayload = await generateTicketToken({
          ticketId,
          ticketCode,
          eventId,
          userId: session.userId,
        });

        const ticket = await (tx.ticket as any).create({
          data: {
            id: ticketId,
            code: ticketCode,
            eventId,
            userId: session.userId,
            qrPayload,
            status: "ISSUED",
            pricePaid: eventPrice,
          },
        });

        // Log the action for each ticket
        await tx.auditLog.create({
          data: {
            actorId: session.userId,
            action: "TICKET_PURCHASE",
            entityType: "TICKET",
            entityId: ticket.id,
            metadata: JSON.stringify({ eventId, ticketCode, quantity }),
          },
        });

        tickets.push(ticket);
      }

      await tx.event.update({
        where: { id: eventId },
        data: { ticketsIssuedCount: { increment: quantity } },
      });

      return tickets;
    });

    return NextResponse.json({ success: true, tickets: result });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}
