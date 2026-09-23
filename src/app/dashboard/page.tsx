import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Ticket, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { QRManager } from "../../components/dashboard/qr-manager";
import { TransferModal } from "../../components/dashboard/transfer-modal";
import { ClaimTicketModal } from "../../components/dashboard/claim-ticket-modal";
import { TicketCard } from "@/components/ui/ticket-card";

export default async function UserDashboard() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const ticketsData = await prisma.ticket.findMany({
    where: { userId: session.userId },
    include: {
      event: {
        include: {
          images: true,
        },
      },
    },
    orderBy: { issuedAt: "desc" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tickets = ticketsData as any[];

  return (
    <div className="container py-16 space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
            <Sparkles className="h-4 w-4 mr-2" />
            My tickets
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none text-foreground">
            My <span className="text-primary uppercase">wallet</span>
          </h1>
        </div>
        <div className="shrink-0">
          <ClaimTicketModal />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div key={ticket.id} className="space-y-6">
              <TicketCard
                eventTitle={ticket.event.title}
                eventDate={formatDate(ticket.event.startTime)}
                eventLocation={ticket.event.location}
                ticketType="General Admission"
                ticketCode={ticket.code}
                qrPayload={ticket.qrPayload}
                showDownload={true}
              />
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <TransferModal 
                    ticketId={ticket.id} 
                    ticketCode={ticket.code} 
                    eventTitle={ticket.event.title} 
                  />
                </div>
                <QRManager 
                  ticketCode={ticket.code} 
                  qrPayload={ticket.qrPayload} 
                  eventTitle={ticket.event.title} 
                />
              </div>
            </div>
          ))
        ) : (
          <Card className="col-span-full py-32 text-center bg-card border-dashed border-border rounded-lg">
            <div className="h-24 w-24 rounded-3xl bg-foreground/3 flex items-center justify-center mx-auto border border-border text-muted-foreground/70">
              <Ticket className="h-12 w-12" />
            </div>
            <h3 className="mt-8 text-2xl font-black tracking-tight text-foreground">No tickets found</h3>
            <p className="text-muted-foreground mt-2 font-medium">You haven&apos;t acquired any event tickets yet.</p>
            <Link href="/events" className="mt-8 inline-flex h-12 items-center px-8 rounded-xl font-black uppercase tracking-widest text-[10px] cursor-pointer">
              Discover events
            </Link>
          </Card>
        )}
      </div>

      <div className="p-12 rounded-lg bg-primary/10 border border-primary/30 flex flex-col md:flex-row items-center gap-8">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/30">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h4 className="text-xl font-black tracking-tight text-foreground">Ticket protection</h4>
          <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed">
            Your tickets are secured and verified. Present the QR code at the venue for entry validation.
          </p>
        </div>
      </div>
    </div>
  );
}
