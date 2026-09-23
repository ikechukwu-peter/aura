"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, User, ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { name: string | null; email: string };
}

interface ConversationViewProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  backHref: string;
}

export function ConversationView({ currentUserId, otherUserId, otherUserName, backHref }: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?userId=${otherUserId}`);
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        setMessages(data);
        
        // Mark as read if there are unread messages from the other user
        const hasUnread = data.some((m: Message) => m.senderId === otherUserId && !m.isRead);
        if (hasUnread) {
          await fetch("/api/messages", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senderId: otherUserId }),
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [otherUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: otherUserId,
          content: newMessage,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      
      const sentMsg = await response.json();
      setMessages([...messages, sentMsg]);
      setNewMessage("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-150 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-175 bg-card border border-border/60 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-border/60 bg-background flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={backHref} className="p-2 hover:bg-foreground/5 rounded-xl transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div className="h-12 w-12 rounded-xl bg-foreground/3 border border-border/60 flex items-center justify-center">
            <User className="h-6 w-6 text-muted-foreground/70" />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tight text-foreground">{otherUserName}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-verified">Connected</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-5 rounded-3xl ${
                isMe 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-background border border-border/60 text-foreground rounded-tl-none'
              }`}>
                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                <p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${isMe ? 'text-white/60' : 'text-muted-foreground/70'}`}>
                  {formatDate(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
            <Send className="h-12 w-12" />
            <p className="text-xs font-black uppercase tracking-widest">No messages yet</p>
          </div>
        )}
      </div>

      <div className="p-8 bg-background border-t border-border/60">
        <div className="flex gap-4 items-end">
          <Textarea
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
            className="min-h-15 max-h-37.5 bg-background border-border/60 rounded-2xl focus:border-primary/50 transition-all font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            onClick={handleSend} 
            disabled={sending || !newMessage.trim()}
            variant="default"
            className="h-15 w-15 rounded-2xl shrink-0"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
