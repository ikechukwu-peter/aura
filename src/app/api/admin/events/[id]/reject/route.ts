import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session || (session.role !== "ADMIN" && (session.role as string) !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // When rejecting, we set status to CLOSED so it disappears from the pending list
    const event = await prisma.event.update({
      where: { id },
      data: {
        approvedByAdmin: false,
        status: "CLOSED",
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "REJECT_EVENT",
        entityType: "EVENT",
        entityId: id,
        metadata: JSON.stringify({ title: event.title }),
      },
    });

    // Redirect back to admin dashboard
    return new NextResponse(null, {
      status: 303,
      headers: { Location: "/admin/dashboard" },
    });
  } catch (error: any) {
    console.error("Event rejection error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
