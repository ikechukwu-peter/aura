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
    const { role } = await req.json();

    const allowedRoles = (session.role as string) === "SUPER_ADMIN" 
      ? ["USER", "ORGANIZER", "ADMIN"] 
      : ["USER", "ORGANIZER"];

    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role or insufficient permissions" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Admins cannot see or modify other Admins or Super Admins
    if ((session.role as string) === "ADMIN" && (user.role === "ADMIN" || (user.role as string) === "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const oldRole = user.role;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    // If changing to ORGANIZER, ensure they have a profile
    if (role === "ORGANIZER") {
      await prisma.organizerProfile.upsert({
        where: { userId: id },
        update: {},
        create: {
          userId: id,
          displayName: updatedUser.name || updatedUser.email.split("@")[0],
          verified: true,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: `updated user role from ${oldRole} to ${role}`,
        entityType: "USER",
        entityId: id,
        metadata: JSON.stringify({ oldRole, newRole: role }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
