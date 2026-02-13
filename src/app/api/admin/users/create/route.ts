import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const createAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["USER", "ORGANIZER", "ADMIN", "SUPER_ADMIN"]),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role as string) !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, role } = createAdminSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role as UserRole,
        ...(role === "ORGANIZER" ? {
          organizerProfile: {
            create: {
              displayName: name,
              verified: true,
            }
          }
        } : {})
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: `created new user with role ${role}`,
        entityType: "USER",
        entityId: user.id,
        metadata: JSON.stringify({ email, role }),
      },
    });

    return NextResponse.json({ 
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
