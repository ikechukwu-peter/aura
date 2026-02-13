"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ContactOrganizerDialogProps {
  organizerId: string;
  organizerName: string;
  eventId: string;
  eventTitle: string;
}

export function ContactOrganizerDialog({ organizerId, organizerName, eventId, eventTitle }: ContactOrganizerDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: organizerId,
          eventId,
          content: message,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      toast.success("Message sent successfully!");
      setMessage("");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="glass" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2">
          <MessageSquare className="h-4 w-4" />
          Contact Organizer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background/80 backdrop-blur-3xl border-border/60 rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Contact <span className="text-aura-primary">{organizerName}</span></DialogTitle>
          <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
            Regarding: {eventTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <Textarea
            placeholder="Type your message here..."
            value={message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
            className="min-h-[150px] bg-background/50 border-border/60 rounded-2xl focus:border-aura-primary/50 transition-all font-medium"
          />
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSendMessage} 
            disabled={sending || !message.trim()}
            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-glow-aura gap-2"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Neural Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
