import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || ((session.role as string) !== "ADMIN" && (session.role as string) !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { isBlocked } = await req.json();

    if (typeof isBlocked !== "boolean") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Admins cannot block other Admins or Super Admins
    if (session.role === "ADMIN" && (user.role === "ADMIN" || (user.role as string) === "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Don't allow blocking yourself
    if (id === session.userId) {
      return NextResponse.json({ error: "Cannot block your own account" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBlocked } as any,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: isBlocked ? "BLOCK_USER" : "UNBLOCK_USER",
        entityType: "USER",
        entityId: id,
        metadata: JSON.stringify({ isBlocked }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to block user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
