"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteEventButtonProps {
  eventId: string;
}

export function DeleteEventButton({ eventId }: DeleteEventButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/organizer/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete event");
      }

      toast.success("Event deleted successfully");
      setIsOpen(false);
      router.push("/organizer/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="rounded-xl font-black uppercase tracking-widest text-[10px]">
          <Trash2 className="h-3 w-3 mr-2" /> Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background/80 backdrop-blur-2xl border-white/10 rounded-[2.5rem] p-0 overflow-hidden max-w-md">
        <div className="p-8 space-y-6">
          <DialogHeader className="space-y-4">
            <div className="h-16 w-16 rounded-[1.5rem] bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 mx-auto">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-2 text-center">
              <DialogTitle className="text-3xl font-black uppercase tracking-tighter italic">Critical Action</DialogTitle>
              <DialogDescription className="text-foreground/40 font-black uppercase tracking-widest text-[10px] leading-relaxed">
                This will permanently purge the event and all associated ticket data. This operation is irreversible.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <DialogFooter className="flex-col sm:flex-col gap-3">
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full h-14 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-glow-red"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Purging Ledger...
                </>
              ) : (
                "Confirm Permanent Deletion"
              )}
            </Button>
            <Button
              variant="glass"
              onClick={() => setIsOpen(false)}
              className="w-full h-14 rounded-2xl border-white/10 font-black uppercase tracking-widest text-[10px]"
            >
              Abort Mission
            </Button>
          </DialogFooter>
        </div>
        <div className="bg-white/5 py-3 px-8 flex justify-center items-center gap-2 border-t border-white/5">
           <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
           <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Security clearance required // encrypted</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
