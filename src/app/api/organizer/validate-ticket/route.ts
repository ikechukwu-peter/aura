import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTicketToken } from "@/lib/qr";
import { TicketStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || (session.role !== "ORGANIZER" && session.role !== "ADMIN" && (session.role as string) !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // 1. Verify token
    const payload = await verifyTicketToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or tampered ticket token" }, { status: 400 });
    }

    const { ticketId, eventId } = payload;

    // 2. Fetch ticket and event
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true, user: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found in database" }, { status: 404 });
    }

    // 3. Verify organizer ownership of the event
    if (session.role === "ORGANIZER" && ticket.event.organizerId !== session.userId) {
      return NextResponse.json({ error: "You are not authorized to validate tickets for this event" }, { status: 403 });
    }

    // 4. Check status
    if (ticket.status === TicketStatus.USED) {
      return NextResponse.json({ 
        error: "Ticket has already been used", 
        validatedAt: ticket.validatedAt,
        userName: ticket.user.name || ticket.user.email
      }, { status: 400 });
    }

    if (ticket.status !== TicketStatus.ISSUED) {
      return NextResponse.json({ error: `Ticket is in invalid status: ${ticket.status}` }, { status: 400 });
    }

    // 5. Mark as used
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.USED,
        validatedAt: new Date(),
        validatedBy: session.userId,
      },
    });

    // 6. Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "TICKET_VALIDATED",
        entityType: "TICKET",
        entityId: ticketId,
        metadata: JSON.stringify({ 
          eventId, 
          userId: ticket.userId,
          ticketCode: ticket.code 
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ticket validated successfully",
      eventTitle: ticket.event.title,
      userName: ticket.user.name || ticket.user.email,
      ticketCode: ticket.code,
    });
  } catch (error: any) {
    console.error("Ticket validation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
