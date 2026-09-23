import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConversationView } from "@/components/messages/conversation-view";
import { MessageSquare } from "lucide-react";

export default async function OrganizerConversationPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await getSession();
  const { userId } = await params;

  if (!session || session.role !== "ORGANIZER") {
    redirect("/login");
  }

  // Get other user's info
  const otherUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!otherUser) {
    notFound();
  }

  // Mark messages from this user as read
  await (prisma as any).message.updateMany({
    where: {
      senderId: userId,
      receiverId: session.userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return (
    <div className="container py-16 space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary backdrop-blur-md">
          <MessageSquare className="h-4 w-4 mr-2" />
          Conversation
        </div>
        <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
          Conversation
        </h1>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Communicating with {otherUser.name || otherUser.email}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <ConversationView 
          currentUserId={session.userId}
          otherUserId={userId}
          otherUserName={otherUser.name || otherUser.email || "Unknown User"}
          backHref="/organizer/messages"
        />
      </div>
    </div>
  );
}
