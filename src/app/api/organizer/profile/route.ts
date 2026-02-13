import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ORGANIZER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.organizerProfile.findUnique({
      where: { userId: session.userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    if (!profile) {
      // Create a default profile if it doesn't exist
      const newProfile = await prisma.organizerProfile.create({
        data: {
          userId: session.userId,
          displayName: session.userId.substring(0, 8), // Default name
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      });
      return NextResponse.json(newProfile);
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ORGANIZER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { displayName, bio } = body;

    const profile = await prisma.organizerProfile.update({
      where: { userId: session.userId },
      data: {
        displayName,
        bio,
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
