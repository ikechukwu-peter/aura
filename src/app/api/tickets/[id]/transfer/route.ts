import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const { id: ticketId } = await params;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { receiverEmail } = await request.json();

    if (!receiverEmail) {
      return NextResponse.json({ error: "Receiver email is required" }, { status: 400 });
    }

    // 1. Check if ticket exists and belongs to user
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (ticket.status !== "ISSUED") {
      return NextResponse.json({ error: "Ticket is not in a transferable state" }, { status: 400 });
    }

    // 2. Create transfer record
    const transferCode = `TRF-${uuidv4().substring(0, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

    const transfer = await (prisma as any).ticketTransfer.create({
      data: {
        ticketId,
        senderId: session.userId,
        receiverEmail,
        transferCode,
        expiresAt,
        status: "PENDING",
      },
    });

    // 3. Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "TICKET_TRANSFER_INITIATED",
        entityType: "TICKET",
        entityId: ticketId,
        metadata: JSON.stringify({ transferId: transfer.id, receiverEmail, transferCode }),
      },
    });

    return NextResponse.json({ 
      success: true, 
      transferCode, 
      expiresAt 
    });
  } catch (error: any) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate transfer" },
      { status: 500 }
    );
  }
}
