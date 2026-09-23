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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete event");
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
      <DialogContent className="bg-background/80 backdrop-blur-2xl border-border rounded-[2.5rem] p-0 overflow-hidden max-w-md">
        <div className="p-8 space-y-6">
          <DialogHeader className="space-y-4">
            <div className="h-16 w-16 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 mx-auto">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-2 text-center">
              <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Delete Event</DialogTitle>
              <DialogDescription className="text-muted-foreground font-black uppercase tracking-widest text-[10px] leading-relaxed">
                This will permanently delete the event and all associated ticket data. This operation is irreversible.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <DialogFooter className="flex-col sm:flex-col gap-3">
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting Event...
                </>
              ) : (
                "Confirm Deletion"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-full h-14 rounded-2xl border-border font-black uppercase tracking-widest text-[10px]"
            >
              Cancel
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
