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
        <Button variant="outline" className="w-full h-10 rounded-lg font-medium text-sm gap-2">
          <MessageSquare className="h-4 w-4" />
          Contact organizer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-border rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Contact <span className="text-primary">{organizerName}</span></DialogTitle>
          <DialogDescription className="text-xs font-medium text-muted-foreground">
            Regarding: {eventTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Type your message here..."
            value={message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
            className="min-h-37.5 bg-background border-border rounded-lg focus:border-primary/50 transition-colors text-sm"
          />
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSendMessage} 
            disabled={sending || !message.trim()}
            variant="default"
            className="w-full h-10 rounded-lg font-medium text-sm gap-2"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
