import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }

  try {
    const count = await prisma.message.count({
      where: {
        receiverId: session.userId,
        isRead: false,
      },
    });
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
