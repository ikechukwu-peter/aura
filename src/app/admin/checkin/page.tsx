"use client";

import { TicketScanner } from "@/components/organizer/ticket-scanner";

export default function AdminCheckinPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      <TicketScanner role="ADMIN" />
    </div>
  );
}
