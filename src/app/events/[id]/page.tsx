import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Users, ShieldCheck, ArrowLeft, Clock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
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
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video relative rounded-lg overflow-hidden bg-muted border border-border group">
            {event.images && event.images.length > 0 ? (
              <Image 
                src={event.images[0].bannerPath || event.images[0].originalPath} 
                alt={event.title}
                fill
                unoptimized
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                <Calendar className="h-32 w-32" />
              </div>
            )}
             <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
               <div className="space-y-3">
                 <div className="flex items-center gap-2 flex-wrap">
                   <StatusBadge variant="info">
                     {event.category}
                   </StatusBadge>
                   {!event.approvedByAdmin && (
                     <StatusBadge variant="warning">Pending Approval</StatusBadge>
                   )}
                   <StatusBadge variant="success">
                     {Number(event.price ?? 0) === 0 ? "FREE" : `$${Number(event.price ?? 0).toFixed(2)}`}
                   </StatusBadge>
                 </div>
                 <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-foreground">
                   {event.title}
                 </h1>
               </div>
               <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border shadow-sm">
                 <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                   <Users className="h-4 w-4 text-primary" />
                 </div>
                 <div className="pr-2">
                   <p className="text-xs font-medium text-muted-foreground">Attending</p>
                   <p className="text-sm font-semibold text-foreground">{event.ticketsIssuedCount} / {event.capacity}</p>
                 </div>
               </div>
             </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">About the event</h2>
            <p className="text-base text-foreground/80 leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-background border-border hover:border-primary/30 transition-colors rounded-lg">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Date & Time</p>
                  <p className="text-base font-semibold text-foreground leading-tight">{formatDate(event.startTime)}</p>
                  <p className="text-xs text-muted-foreground">Ends {formatDate(event.endTime)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background border-border hover:border-primary/30 transition-colors rounded-lg">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Location</p>
                  <p className="text-base font-semibold text-foreground leading-tight">{event.location}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24 border-border bg-background overflow-hidden rounded-lg">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2 text-foreground">
                <Sparkles className="h-5 w-5 text-primary" />
                Ticket information
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-5 pt-3 space-y-6">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-base text-foreground">General admission</p>
                    <StatusBadge variant="info">Full access</StatusBadge>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-primary">
                    {Number(event.price ?? 0) === 0 ? "FREE" : `$${Number(event.price ?? 0).toFixed(2)}`}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center font-medium">
                      <Users className="mr-2 h-3 w-3" /> Availability
                    </span>
                    <span className="text-foreground font-semibold">{event.capacity - event.ticketsIssuedCount} spots left</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300" 
                      style={{ width: `${((event.capacity - event.ticketsIssuedCount) / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-verified" />
                    Verified booking
                  </div>
                  <StatusBadge variant="success">Guaranteed</StatusBadge>
                </div>
              </div>

              {session ? (
                <Button variant="default" className="w-full h-11 rounded-lg text-sm font-semibold" disabled={event.ticketsIssuedCount >= event.capacity} asChild>
                   <Link href={`/checkout/${event.id}`} className="w-full h-full flex items-center justify-center gap-2">
                    {event.ticketsIssuedCount >= event.capacity ? "Sold out" : (
                      <>
                        Get tickets
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </>
                    )}
                   </Link>
                </Button>
              ) : (
                <Button variant="outline" className="w-full h-11 rounded-lg text-sm font-semibold" asChild>
                   <Link href={`/login?redirect=/events/${event.id}`} className="w-full h-full flex items-center justify-center">
                    Log in to get tickets
                   </Link>
                </Button>
              )}

              <div className="flex items-center justify-center gap-2 pt-1">
                <Clock className="h-3 w-3 text-primary" />
                <p className="text-xs text-muted-foreground">
                  Tickets held for 10 minutes during checkout
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background border-border overflow-hidden rounded-lg">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hosted by</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-3 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center font-bold text-lg text-foreground border border-border">
                  {event.organizerId.substring(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Organizer {event.organizerId.substring(0, 4)}</p>
                  <div className="inline-flex items-center px-2 py-0.5 rounded bg-verified/10 border border-verified/20 text-[10px] font-semibold uppercase tracking-wider text-verified">
                    Verified organizer
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
