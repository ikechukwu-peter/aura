import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, User, Calendar, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function UserMessagesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const messages = await (prisma as any).message.findMany({
    where: {
      OR: [
        { receiverId: session.userId },
        { senderId: session.userId },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: { id: true, name: true, email: true },
      },
      receiver: {
        select: { id: true, name: true, email: true },
      },
      event: {
        select: { id: true, title: true },
      },
    },
  });

  const conversationsMap = new Map();
  (messages as any[]).forEach((msg) => {
    const otherUser = msg.senderId === session.userId ? msg.receiver : msg.sender;
    const conversationId = otherUser.id;
    
    if (!conversationsMap.has(conversationId)) {
      conversationsMap.set(conversationId, {
        user: otherUser,
        lastMessage: msg,
        unreadCount: msg.receiverId === session.userId && !msg.isRead ? 1 : 0,
      });
    } else if (msg.receiverId === session.userId && !msg.isRead) {
      conversationsMap.get(conversationId).unreadCount++;
    }
  });

  const conversations = Array.from(conversationsMap.values());

  return (
    <div className="container py-16 space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center rounded-full border border-aura-secondary/20 bg-aura-secondary/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-aura-secondary backdrop-blur-md">
          <MessageSquare className="h-4 w-4 mr-2" />
          Neural Link
        </div>
        <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
          My <span className="bg-gradient-to-r from-aura-secondary to-aura-accent bg-clip-text text-transparent animate-gradient-x">MESSAGES</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <Link key={conv.user.id} href={`/dashboard/messages/${conv.user.id}`}>
              <Card className="group border-border/60 bg-foreground/[0.02] hover:border-aura-secondary/30 hover:bg-aura-secondary/5 transition-all duration-300 rounded-[2rem] overflow-hidden">
                <CardContent className="p-8 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-foreground/[0.03] border border-border/60 flex items-center justify-center relative">
                      <User className="h-8 w-8 text-foreground/20" />
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-aura-secondary text-[10px] font-black text-white flex items-center justify-center shadow-glow-aura">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-aura-secondary transition-colors">
                        {conv.user.name || conv.user.email}
                      </h3>
                      <div className="flex items-center gap-4">
                        {conv.lastMessage.event && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-aura-primary flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {conv.lastMessage.event.title}
                          </span>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                          {formatDate(conv.lastMessage.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/60 line-clamp-1 mt-2">
                        {conv.lastMessage.senderId === session.userId ? "You: " : ""}{conv.lastMessage.content}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-foreground/20 group-hover:text-aura-secondary group-hover:translate-x-2 transition-all" />
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="py-24 text-center space-y-6 bg-foreground/[0.02] border-dashed border-border rounded-[2.5rem]">
            <div className="h-24 w-24 rounded-3xl bg-foreground/[0.03] flex items-center justify-center mx-auto border border-border text-foreground/10">
              <MessageSquare className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight uppercase">No neural links</h3>
              <p className="text-foreground/40 max-w-md mx-auto">You haven't sent or received any messages yet.</p>
              <Button asChild variant="glass" className="mt-4 rounded-xl font-black uppercase tracking-widest text-[10px]">
                <Link href="/events">Explore Events</Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
