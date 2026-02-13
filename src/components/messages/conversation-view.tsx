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
      <div className="h-[600px] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-aura-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[700px] bg-foreground/[0.02] border border-border/60 rounded-[2.5rem] overflow-hidden">
      <div className="p-6 border-b border-border/60 bg-background/50 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={backHref} className="p-2 hover:bg-foreground/5 rounded-xl transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground/40" />
          </Link>
          <div className="h-12 w-12 rounded-xl bg-foreground/[0.03] border border-border/60 flex items-center justify-center">
            <User className="h-6 w-6 text-foreground/20" />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tight text-foreground">{otherUserName}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-green-500 animate-pulse">Connection Stable</p>
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
                  ? 'bg-aura-primary text-white shadow-glow-aura rounded-tr-none' 
                  : 'bg-background border border-border/60 text-foreground rounded-tl-none'
              }`}>
                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                <p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${isMe ? 'text-white/60' : 'text-foreground/30'}`}>
                  {formatDate(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
            <Send className="h-12 w-12" />
            <p className="text-xs font-black uppercase tracking-widest">No signals exchanged</p>
          </div>
        )}
      </div>

      <div className="p-8 bg-background/50 backdrop-blur-xl border-t border-border/60">
        <div className="flex gap-4 items-end">
          <Textarea
            placeholder="Input neural transmission..."
            value={newMessage}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
            className="min-h-[60px] max-h-[150px] bg-background border-border/60 rounded-2xl focus:border-aura-primary/50 transition-all font-medium"
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
            className="h-[60px] w-[60px] rounded-2xl bg-aura-primary hover:bg-aura-primary/90 text-white shadow-glow-aura shrink-0"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
