import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Users, ShieldCheck, ArrowLeft, Clock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { StatusBadge } from "@/components/ui/status-badge";
import { Prisma } from "@prisma/client";
import { ContactOrganizerDialog } from "../../../components/events/contact-organizer-dialog";

type EventWithDetails = Prisma.EventGetPayload<{
  include: { 
    organizer: { include: { organizerProfile: true } },
    images: true,
  }
}>;

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventData = await prisma.event.findUnique({
    where: { id },
    include: { 
      organizer: { include: { organizerProfile: true } },
      images: true,
    },
  });

  if (!eventData || (!eventData.approvedByAdmin && eventData.status !== "DRAFT")) {
    notFound();
  }

  const event = eventData as unknown as EventWithDetails;
  const session = await getSession();

  return (
    <div className="py-16 space-y-12">
      <Link
        href="/events"
        className="inline-flex items-center text-sm font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-all group"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="aspect-video relative rounded-[2.5rem] overflow-hidden bg-background border border-border/60 group shadow-card">
            {event.images && event.images.length > 0 ? (
              <img 
                src={event.images[0].bannerPath || event.images[0].originalPath} 
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-foreground/5 group-hover:scale-110 transition-transform duration-700">
                <Calendar className="h-48 w-48 opacity-10" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80" />
             <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <StatusBadge variant="info" className="bg-aura-primary/10 border-aura-primary/20 text-aura-primary">
                     {event.category}
                   </StatusBadge>
                   {!event.approvedByAdmin && (
                     <StatusBadge variant="warning">Pending Approval</StatusBadge>
                   )}
                   <StatusBadge variant="success" className="bg-aura-secondary/10 border-aura-secondary/20 text-aura-secondary">
                     {(event as any).price === 0 ? "FREE" : `$${(event as any).price.toFixed(2)}`}
                   </StatusBadge>
                 </div>
                 <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-foreground drop-shadow-sm">
                   {event.title}
                 </h1>
               </div>
               <div className="flex items-center gap-2 bg-background/60 backdrop-blur-xl p-4 rounded-2xl border border-border shadow-glass">
                 <div className="h-10 w-10 rounded-xl bg-aura-primary/10 flex items-center justify-center border border-aura-primary/20">
                   <Users className="h-5 w-5 text-aura-primary" />
                 </div>
                 <div className="pr-4">
                   <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Attending</p>
                   <p className="text-sm font-black text-foreground">{event.ticketsIssuedCount} / {event.capacity}</p>
                 </div>
               </div>
             </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground/40">About the Event</h2>
              <div className="h-px flex-1 bg-gradient-to-l from-border/60 to-transparent" />
            </div>
            <p className="text-xl text-foreground/70 dark:text-foreground/60 leading-relaxed font-medium">
              {event.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-background border-border/60 shadow-card hover:border-aura-primary/30 transition-all duration-300 rounded-[2rem]">
              <CardContent className="p-8 flex items-start gap-6">
                <div className="h-14 w-14 rounded-2xl bg-aura-primary/10 flex items-center justify-center text-aura-primary shrink-0 border border-aura-primary/20">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Date & Time</p>
                  <p className="text-lg font-bold text-foreground leading-tight">{formatDate(event.startTime)}</p>
                  <p className="text-xs font-black text-foreground/30 uppercase tracking-widest">Ends {formatDate(event.endTime)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background border-border/60 shadow-card hover:border-aura-secondary/30 transition-all duration-300 rounded-[2rem]">
              <CardContent className="p-8 flex items-start gap-6">
                <div className="h-14 w-14 rounded-2xl bg-aura-secondary/10 flex items-center justify-center text-aura-secondary shrink-0 border border-aura-secondary/20">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Location</p>
                  <p className="text-lg font-bold text-foreground leading-tight">{event.location}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="sticky top-24 border-border/60 bg-background/60 backdrop-blur-2xl shadow-card overflow-hidden rounded-[2.5rem] group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-aura-primary via-aura-secondary to-aura-primary" />
            
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3 text-foreground">
                <Sparkles className="h-6 w-6 text-aura-primary animate-pulse" />
                Ticket access
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-10 pt-4 space-y-10">
              <div className="p-8 rounded-3xl bg-aura-primary/5 border border-aura-primary/20 space-y-4 group-hover:bg-aura-primary/10 transition-all duration-500">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-black text-xl tracking-tight text-foreground">General admission</p>
                    <StatusBadge variant="info" className="bg-aura-primary/10 text-aura-primary border-aura-primary/20">Full Access</StatusBadge>
                  </div>
                  <div className="text-4xl font-black tracking-tighter text-aura-primary drop-shadow-glow-aura">
                    {(event as any).price === 0 ? "FREE" : `$${(event as any).price.toFixed(2)}`}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-foreground/40 flex items-center">
                      <Users className="mr-2 h-3 w-3" /> Availability
                    </span>
                    <span className="text-foreground font-black">{event.capacity - event.ticketsIssuedCount} spots left</span>
                  </div>
                  <div className="w-full bg-foreground/[0.03] rounded-full h-2 overflow-hidden border border-border/60">
                    <div 
                      className="h-full bg-gradient-to-r from-aura-primary to-aura-secondary shadow-glow-aura transition-all duration-1000" 
                      style={{ width: `${((event.capacity - event.ticketsIssuedCount) / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-foreground/[0.03] border border-border/60">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    Verification
                  </div>
                  <StatusBadge variant="success">Guaranteed</StatusBadge>
                </div>
              </div>

              {session ? (
                <Button className="w-full h-20 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] bg-aura-primary hover:bg-aura-primary/90 text-white shadow-glow-aura p-0 transition-all hover:scale-[1.02] active:scale-95 group/btn cursor-pointer" disabled={event.ticketsIssuedCount >= event.capacity} asChild>
                   <Link href={`/checkout/${event.id}`} className="w-full h-full flex items-center justify-center gap-3">
                    {event.ticketsIssuedCount >= event.capacity ? "Sold out" : (
                      <>
                        Get your ticket
                        <ArrowRight className="h-6 w-6 transition-transform group-hover/btn:translate-x-2" />
                      </>
                    )}
                   </Link>
                </Button>
              ) : (
                <Button className="w-full h-20 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] variant-glass p-0 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer" asChild>
                   <Link href={`/login?redirect=/events/${event.id}`} className="w-full h-full flex items-center justify-center">
                    Log in to get ticket
                   </Link>
                </Button>
              )}

              <div className="flex items-center justify-center gap-2 pt-2">
                <Clock className="h-3 w-3 text-aura-primary animate-pulse" />
                <p className="text-[9px] text-foreground/30 font-black uppercase tracking-widest">
                  10-minute neural hold active // secure
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background border-border/60 shadow-card overflow-hidden group rounded-[2rem]">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground/40">Hosted By</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-[1.25rem] bg-gradient-to-br from-aura-primary/10 to-aura-secondary/10 flex items-center justify-center font-black text-2xl text-foreground border border-border/60 group-hover:shadow-glow-aura transition-all duration-500">
                  {event.organizerId.substring(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <p className="font-black text-foreground uppercase tracking-tight">Organizer {event.organizerId.substring(0, 4)}</p>
                  <div className="inline-flex items-center px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[9px] font-black uppercase tracking-widest text-green-600 dark:text-green-400">
                    Verified Provider
                  </div>
                </div>
              </div>

              {session && session.userId !== event.organizerId && (
                <ContactOrganizerDialog 
                  organizerId={event.organizerId}
                  organizerName={`Organizer ${event.organizerId.substring(0, 4)}`}
                  eventId={event.id}
                  eventTitle={event.title}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
