"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  startTime: string;
  organizer: {
    name: string | null;
  };
}

interface DeploymentRequestsProps {
  initialEvents: Event[];
}

export function DeploymentRequests({ initialEvents }: DeploymentRequestsProps) {
  const [events, setEvents] = useState(initialEvents);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (eventId: string, action: "APPROVE" | "REJECT") => {
    setProcessingId(eventId);
    try {
      const response = await fetch("/api/admin/events/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, action }),
      });

      if (!response.ok) throw new Error("Failed to process action");

      setEvents(events.filter(e => e.id !== eventId));
      toast.success(action === "APPROVE" ? "Event approved and published" : "Event rejected");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  if (events.length === 0) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="h-12 w-12 text-foreground/10 mx-auto" />
        <p className="text-xs font-black uppercase tracking-widest text-foreground/20 italic">No pending deployments found.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {events.map((event) => (
        <div key={event.id} className="p-8 hover:bg-foreground/[0.01] transition-all flex items-center justify-between gap-6 group">
          <div className="space-y-1">
            <h4 className="font-black uppercase tracking-tight group-hover:text-aura-primary transition-colors">{event.title}</h4>
            <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
              By {event.organizer.name || "Anonymous Agent"} • {formatDate(event.startTime)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="glass" 
              size="sm" 
              className="h-10 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest text-aura-primary hover:bg-aura-primary/10 cursor-pointer disabled:opacity-50"
              onClick={() => handleAction(event.id, "APPROVE")}
              disabled={processingId === event.id}
            >
              {processingId === event.id ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
              Approve
            </Button>
            <Button 
              variant="glass" 
              size="sm" 
              className="h-10 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
              onClick={() => handleAction(event.id, "REJECT")}
              disabled={processingId === event.id}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
