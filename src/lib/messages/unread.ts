import { prisma } from "@/lib/prisma";

export async function getUnreadMessageCount(userId: string) {
  try {
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
    return count;
  } catch (error) {
    console.error("Failed to get unread message count:", error);
    return 0;
  }
}
