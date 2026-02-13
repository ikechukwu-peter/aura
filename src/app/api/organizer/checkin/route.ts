import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTicketToken } from "@/lib/qr";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session || (session.role !== "ORGANIZER" && session.role !== "ADMIN" && (session.role as string) !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { qrToken, expectedEventId } = await req.json();

    if (!qrToken) {
      return NextResponse.json({ error: "QR token is required" }, { status: 400 });
    }

    // 1. Verify the QR token using the shared library
    const payload = await verifyTicketToken(qrToken);
    
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired ticket token" }, { status: 400 });
    }

    const { ticketId, ticketCode, eventId } = payload as any;

    // 1.5 Verify if this is the expected event (if specified)
    if (expectedEventId && eventId !== expectedEventId) {
      return NextResponse.json({ 
        error: "Ticket is for a different event",
        details: {
          expectedEventId,
          ticketEventId: eventId
        }
      }, { status: 400 });
    }

    // 2. Fetch ticket and event details
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found in database" }, { status: 404 });
    }

    if (ticket.code !== ticketCode || ticket.eventId !== eventId) {
      return NextResponse.json({ error: "Ticket data mismatch" }, { status: 400 });
    }

    // 3. Check ticket status
    if (ticket.status === "USED") {
      return NextResponse.json({ 
        error: "Ticket already used", 
        details: {
          usedAt: ticket.validatedAt,
          eventTitle: ticket.event.title,
          userName: ticket.user.name
        }
      }, { status: 400 });
    }

    if (ticket.status === "CANCELLED") {
      return NextResponse.json({ error: "Ticket has been cancelled" }, { status: 400 });
    }

    // 4. Mark ticket as used (validated)
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: "USED",
        validatedAt: new Date(),
        validatedBy: session.userId,
      },
    });

    // 5. Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "TICKET_CHECKIN",
        entityType: "TICKET",
        entityId: ticketId,
        metadata: JSON.stringify({ 
          eventTitle: ticket.event.title, 
          userName: ticket.user.name,
          ticketCode: ticket.code
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Check-in successful",
      ticket: {
        code: ticket.code,
        userName: ticket.user.name,
        userEmail: ticket.user.email,
        eventTitle: ticket.event.title,
        usedAt: updatedTicket.validatedAt,
      }
    });

  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
