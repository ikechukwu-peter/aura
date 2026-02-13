import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Users, Mail, Ticket, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Prisma } from "@prisma/client";

type EventWithAttendees = Prisma.EventGetPayload<{
  include: {
    tickets: {
      include: {
        user: true;
      };
    };
  };
}>;

export default async function EventAttendeesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;

  if (!session || session.role !== "ORGANIZER") {
    redirect("/login");
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      tickets: {
        include: {
          user: true,
        },
        orderBy: {
          issuedAt: "desc",
        },
      },
    },
  }) as EventWithAttendees | null;

  if (!event) notFound();

  if (event.organizerId !== session.userId) {
    redirect("/organizer/dashboard");
  }

  return (
    <div className="container py-16 space-y-12">
      <div className="flex flex-col space-y-4">
        <Link
          href={`/organizer/events/${id}`}
          className="inline-flex items-center text-xs font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-all group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Event
        </Link>
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter uppercase text-foreground leading-none">
            Attendee <span className="text-indigo-600">Manifest</span>
          </h1>
          <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.3em]">
            {event.title} // {event.tickets.length} Registered
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {event.tickets.length === 0 ? (
          <Card className="rounded-[2.5rem] border-dashed border-border/60 bg-transparent py-20">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              <Users className="h-12 w-12 text-foreground/10" />
              <div className="space-y-1">
                <p className="text-sm font-black uppercase tracking-tight">No attendees yet</p>
                <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">Tickets are waiting to be claimed</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          event.tickets.map((ticket) => (
            <Card key={ticket.id} className="rounded-3xl border-border/60 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all overflow-hidden group">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
                    <Users className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black uppercase tracking-tight text-lg leading-none">
                      {ticket.user?.name || "Anonymous User"}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                        <Mail className="h-3 w-3" />
                        {ticket.user?.email || "No Email"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 md:gap-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20">Ticket ID</p>
                    <div className="flex items-center gap-2">
                      <Ticket className="h-3 w-3 text-indigo-500/40" />
                      <span className="font-mono text-xs font-bold text-indigo-600/60 uppercase">{ticket.code}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20">Status</p>
                    <div className="flex items-center gap-2">
                      {ticket.status === "USED" ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Checked In</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                          <Clock className="h-3 w-3 text-amber-500" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 min-w-[120px]">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20">Acquired</p>
                    <p className="text-[10px] font-black uppercase tracking-tight text-foreground/60">{formatDate(ticket.issuedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
