import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Calendar, MapPin, Ticket, Edit, Settings, AlertTriangle, ShieldAlert } from "lucide-react";
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
          <div className="relative h-40 w-40 rounded-6xl bg-foreground/3 border border-border/60 flex items-center justify-center backdrop-blur-xl shadow-2xl group overflow-hidden">
            <AlertTriangle className="h-20 w-20 text-primary/40 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>

        <div className="text-center space-y-6 max-w-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
              <ShieldAlert className="h-3 w-3 mr-2" />
              Event Not Found
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase text-foreground leading-none">
              Event Not Found
            </h1>
          </div>
          <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.3em] leading-relaxed">
            The event record <span className="text-primary/60 font-mono">[{id.substring(0, 12)}...]</span> could not be retrieved. It may have been archived or removed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button asChild variant="default" className="h-16 flex-1 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] group">
            <Link href="/organizer/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-16 flex-1 rounded-2xl border-border/40 font-black uppercase tracking-[0.2em] text-[10px]">
            <Link href="/organizer/events/new">
              Create New Event
            </Link>
          </Button>
        </div>

        <div className="pt-12 border-t border-border/40 w-full max-w-xs text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/70 italic">
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
          className="inline-flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Dashboard
        </Link>
        <div className="flex gap-4">
          <Button asChild variant="outline" size="sm" className="rounded-xl border-border/40 font-black uppercase tracking-widest text-[10px]">
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
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
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
            <Card className="rounded-[2.5rem] border-border/60 bg-foreground/2 shadow-none overflow-hidden group">
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Schedule</p>
                  <p className="font-bold uppercase text-sm">{formatDate(event.startTime)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[2.5rem] border-border/60 bg-foreground/2 shadow-none overflow-hidden group">
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-verified/10 flex items-center justify-center border border-verified/20 text-verified group-hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</p>
                  <p className="font-bold uppercase text-sm">{event.location}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-primary/20 bg-primary/5 shadow-none overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                <Settings className="h-3 w-3" /> Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tickets Sold</p>
                    <p className="text-4xl font-black tracking-tighter text-primary">
                      {event.ticketsIssuedCount} <span className="text-lg text-primary/40">/ {event.capacity}</span>
                    </p>
                  </div>
                  <Ticket className="h-8 w-8 text-primary/20 mb-1" />
                </div>
                <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${(event.ticketsIssuedCount / event.capacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-primary/10">
                <Button asChild variant="default" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                  <Link href={`/organizer/checkin?eventId=${event.id}`}>
                    Check-in Scanner
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-14 rounded-2xl border-border font-black uppercase tracking-widest text-[10px]">
                  <Link href={`/organizer/events/${event.id}/attendees`}>
                    View Attendees
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
