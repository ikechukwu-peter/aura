import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { transferCode } = await request.json();

    if (!transferCode) {
      return NextResponse.json({ error: "Transfer code is required" }, { status: 400 });
    }

    // 1. Find the transfer record
    const transfer = await (prisma as any).ticketTransfer.findUnique({
      where: { transferCode },
      include: { ticket: true },
    });

    if (!transfer) {
      return NextResponse.json({ error: "Invalid transfer code" }, { status: 404 });
    }

    if (transfer.status !== "PENDING") {
      return NextResponse.json({ error: "Transfer has already been processed or cancelled" }, { status: 400 });
    }

    if (new Date() > transfer.expiresAt) {
      return NextResponse.json({ error: "Transfer code has expired" }, { status: 400 });
    }

    // 2. Process transfer in a transaction
    await prisma.$transaction(async (tx) => {
      // Update ticket owner
      await tx.ticket.update({
        where: { id: transfer.ticketId },
        data: { userId: session.userId },
      });

      // Update transfer status
      await (tx as any).ticketTransfer.update({
        where: { id: transfer.id },
        data: { status: "COMPLETED" },
      });

      // Log the action
      await tx.auditLog.create({
        data: {
          actorId: session.userId,
          action: "TICKET_TRANSFER_COMPLETED",
          entityType: "TICKET",
          entityId: transfer.ticketId,
          metadata: JSON.stringify({ transferId: transfer.id, senderId: transfer.senderId }),
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Claim error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to claim ticket" },
      { status: 500 }
    );
  }
}
