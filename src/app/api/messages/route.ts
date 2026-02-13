import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, eventId, content } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json({ error: "Receiver and content are required" }, { status: 400 });
    }

    const message = await (prisma as any).message.create({
      data: {
        senderId: session.userId,
        receiverId,
        eventId,
        content,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("userId");
    const eventId = searchParams.get("eventId");

    const messages = await (prisma as any).message.findMany({
      where: {
        OR: [
          { senderId: session.userId, receiverId: otherUserId || undefined },
          { senderId: otherUserId || undefined, receiverId: session.userId },
        ],
        eventId: eventId || undefined,
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
        receiver: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { senderId } = await req.json();

    if (!senderId) {
      return NextResponse.json({ error: "Sender ID is required" }, { status: 400 });
    }

    await (prisma as any).message.updateMany({
      where: {
        senderId,
        receiverId: session.userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
