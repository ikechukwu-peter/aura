import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Calendar, MapPin, Users, Ticket, Edit, Settings, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { DeleteEventButton } from "@/components/organizer/delete-event-button";

export default async function OrganizerEventDetailsPage({
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
      _count: {
        select: { tickets: true, reservations: true },
      },
    },
  });

  // This handles the "404" state specifically for organizer events
  if (!event) {
    return (
      <div className="container py-24 flex flex-col items-center justify-center min-h-[70vh] space-y-12">
        <div className="relative">
          {/* Animated Glow Effects */}
          <div className="absolute -inset-10 bg-indigo-500/10 blur-[80px] rounded-full animate-pulse" />
          <div className="absolute -inset-10 bg-cyan-500/5 blur-[60px] rounded-full animate-pulse delay-700" />
          
          <div className="relative h-40 w-40 rounded-[3rem] bg-foreground/[0.03] border border-border/60 flex items-center justify-center backdrop-blur-xl shadow-2xl group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <AlertTriangle className="h-20 w-20 text-indigo-500/40 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>

        <div className="text-center space-y-6 max-w-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
              <ShieldAlert className="h-3 w-3 mr-2" />
              Event Not Found
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase text-foreground leading-none">
              Lost in <span className="text-indigo-600">Transit</span>
            </h1>
          </div>
          <p className="text-foreground/40 text-xs font-black uppercase tracking-[0.3em] leading-relaxed">
            The event record <span className="text-indigo-500/60 font-mono">[{id.substring(0, 12)}...]</span> could not be retrieved from our secure ledger. It may have been archived or moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button asChild className="h-16 flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-glow-indigo group">
            <Link href="/organizer/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
          </Button>
          <Button asChild variant="glass" className="h-16 flex-1 rounded-2xl border-border/40 font-black uppercase tracking-[0.2em] text-[10px]">
            <Link href="/organizer/events/new">
              Create New Event
            </Link>
          </Button>
        </div>

        <div className="pt-12 border-t border-border/40 w-full max-w-xs text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-foreground/20 italic">
            Reference ID: {id}
          </p>
        </div>
      </div>
    );
  }

  // Verify ownership
  if (event.organizerId !== session.userId) {
    redirect("/organizer/dashboard");
  }

  return (
    <div className="container py-16 space-y-12">
      <div className="flex items-center justify-between">
        <Link
          href="/organizer/dashboard"
          className="inline-flex items-center text-xs font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-all group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Dashboard
        </Link>
        <div className="flex gap-4">
          <Button asChild variant="glass" size="sm" className="rounded-xl border-border/40 font-black uppercase tracking-widest text-[10px]">
            <Link href={`/organizer/events/${event.id}/edit`}>
              <Edit className="h-3 w-3 mr-2" /> Edit Event
            </Link>
          </Button>
          <DeleteEventButton eventId={event.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600">
              {event.status}
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-foreground">
              {event.title}
            </h1>
            <p className="text-xl text-foreground/60 font-medium leading-relaxed max-w-2xl">
              {event.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-[2.5rem] border-border/60 bg-foreground/[0.02] shadow-none overflow-hidden group">
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-600 group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Schedule</p>
                  <p className="font-bold uppercase text-sm">{formatDate(event.startTime)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[2.5rem] border-border/60 bg-foreground/[0.02] shadow-none overflow-hidden group">
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-600 group-hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Location</p>
                  <p className="font-bold uppercase text-sm">{event.location}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-indigo-500/20 bg-indigo-500/5 shadow-none overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-indigo-600/60 flex items-center gap-2">
                <Settings className="h-3 w-3" /> Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Tickets Sold</p>
                    <p className="text-4xl font-black tracking-tighter text-indigo-600">
                      {event.ticketsIssuedCount} <span className="text-lg text-indigo-600/40">/ {event.capacity}</span>
                    </p>
                  </div>
                  <Ticket className="h-8 w-8 text-indigo-600/20 mb-1" />
                </div>
                <div className="h-2 w-full bg-indigo-600/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-1000" 
                    style={{ width: `${(event.ticketsIssuedCount / event.capacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-indigo-500/10">
                <Button asChild className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 shadow-glow-indigo font-black uppercase tracking-widest text-[10px]">
                  <Link href={`/organizer/checkin?eventId=${event.id}`}>
                    Launch Validator
                  </Link>
                </Button>
                <Button asChild variant="glass" className="w-full h-14 rounded-2xl border-indigo-500/20 font-black uppercase tracking-widest text-[10px]">
                  <Link href={`/organizer/events/${event.id}/attendees`}>
                    View Attendee List
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
