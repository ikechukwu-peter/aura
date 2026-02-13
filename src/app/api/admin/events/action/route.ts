import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || (session.role !== "ADMIN" && (session.role as string) !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { eventId, action } = await request.json();

    if (!eventId || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    if (action === "APPROVE") {
      await prisma.event.update({
        where: { id: eventId },
        data: { 
          approvedByAdmin: true,
          status: "PUBLISHED" 
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: "EVENT_APPROVED",
          entityType: "EVENT",
          entityId: eventId,
          metadata: JSON.stringify({ approvedAt: new Date() }),
        },
      });
    } else {
      // For rejection, we might just mark it as draft or delete it, 
      // but let's just mark it as closed for now or handle it differently
      await prisma.event.update({
        where: { id: eventId },
        data: { 
          status: "CLOSED",
          approvedByAdmin: false 
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: "EVENT_REJECTED",
          entityType: "EVENT",
          entityId: eventId,
          metadata: JSON.stringify({ rejectedAt: new Date() }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin event action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
