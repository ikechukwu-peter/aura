import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Shield,
  Zap,
  Ticket,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatDate, formatPrice } from "@/lib/utils";
import { getSession } from "@/lib/auth";
import { FeaturedEventsSkeleton } from "@/components/events/featured-events-skeleton";
import { FeaturedEventsError } from "@/components/events/featured-events-error";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="flex flex-col gap-24 pb-12 w-full">
      <section className="py-10 sm:py-16 md:py-24">
        <div className="max-w-3xl space-y-8">
          <h1 className="reveal serif text-5xl sm:text-6xl md:text-7xl font-semibold leading-[0.95] text-foreground">
            Tickets you can trust.
            <br />
            <span className="text-primary">Events you won&apos;t forget.</span>
          </h1>

          <p className="reveal text-lg text-muted-foreground leading-relaxed max-w-xl">
            Aura handles the complexity of high-demand ticketing so organizers and
            attendees don&apos;t have to. Atomic capacity locks, cryptographically
            verified tickets, and self-healing reconciliation — built to handle
            millions of concurrent users.
          </p>

          <div className="reveal flex flex-col sm:flex-row gap-3 pt-2">
            <Button size="lg" asChild>
              <Link href="/events" className="inline-flex items-center gap-2">
                Browse events
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {session ? (
              <Button size="lg" variant="outline" asChild>
                <Link
                  href={
                    session.role === "ADMIN" ||
                    (session.role as string) === "SUPER_ADMIN"
                      ? "/admin/dashboard"
                      : session.role === "ORGANIZER"
                        ? "/organizer/dashboard"
                        : "/dashboard"
                  }
                >
                  Go to dashboard
                </Link>
              </Button>
            ) : (
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">Create account</Link>
              </Button>
            )}
          </div>

          <div className="reveal grid grid-cols-3 gap-6 pt-8 border-t border-border max-w-lg">
            <div>
              <div className="serif text-2xl font-semibold text-foreground">0</div>
              <div className="text-xs text-muted-foreground mt-1">
                Double-sales ever
              </div>
            </div>
            <div>
              <div className="serif text-2xl font-semibold text-foreground">
                4-tier
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Fraud protection
              </div>
            </div>
            <div>
              <div className="serif text-2xl font-semibold text-foreground">
                10 min
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Reservation TTL
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="space-y-10">
        <div className="space-y-3 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
            How it works
          </p>
          <h2 className="serif text-3xl sm:text-4xl font-semibold text-foreground">
            Built for integrity, designed for people.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-7 space-y-5 card-hover">
            <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="serif text-xl font-semibold text-foreground">
                No double bookings
              </h3>
              <CardDescription>
                Every ticket is reserved with an atomic compare-and-swap against
                the database. If capacity isn&apos;t there at the exact moment of
                write, the transaction rolls back — guaranteed.
              </CardDescription>
            </div>
          </Card>

          <Card className="p-7 space-y-5 card-hover">
            <div className="h-11 w-11 rounded-lg bg-verified/10 text-verified flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="serif text-xl font-semibold text-foreground">
                Verified every scan
              </h3>
              <CardDescription>
                QR codes are signed JWTs generated server-side. Scanning validates
                the signature live — screenshots, duplicates, and fakes are
                rejected at the door.
              </CardDescription>
            </div>
          </Card>

          <Card className="p-7 space-y-5 card-hover">
            <div className="h-11 w-11 rounded-lg bg-foreground/10 text-foreground flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="serif text-xl font-semibold text-foreground">
                Self-healing state
              </h3>
              <CardDescription>
                A background reconciler walks every event, compares active
                reservations against issued tickets, and repairs capacity drift.
                Servers can crash — inventory stays correct.
              </CardDescription>
            </div>
          </Card>
        </div>
      </section>

      {/* Featured Events */}
      <section className="space-y-10">
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
              Coming up
            </p>
            <h2 className="serif text-3xl sm:text-4xl font-semibold text-foreground">
              Featured events
            </h2>
          </div>
          <Button
            variant="ghost"
            className="text-sm hidden sm:inline-flex items-center gap-1.5"
            asChild
          >
            <Link href="/events">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <Suspense fallback={<FeaturedEventsSkeleton />}>
          <FeaturedEventsList />
        </Suspense>
      </section>
    </div>
  );
}

async function FeaturedEventsList() {
  let featuredEvents;

  try {
    featuredEvents = await prisma.event.findMany({
      where: { status: "PUBLISHED", approvedByAdmin: true },
      take: 3,
      orderBy: { startTime: "asc" },
    });
  } catch {
    return <FeaturedEventsError />;
  }

  if (featuredEvents!.length === 0) {
    return (
      <Card className="py-20 text-center">
        <div className="space-y-2">
          <Ticket className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No events scheduled right now.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {featuredEvents!.map((event) => (
        <Link
          key={event.id}
          href={`/events/${event.id}`}
          className="group block"
        >
          <Card className="overflow-hidden h-full p-0 flex flex-col card-hover">
            <div className="aspect-4/3 relative bg-accent/60 overflow-hidden border-b border-border">
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 group-hover:scale-105 transition-transform duration-500">
                <Calendar className="h-20 w-20" />
              </div>
              <div className="absolute top-3 left-3">
                <span className="inline-flex rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-foreground border border-border">
                  {event.category}
                </span>
              </div>
              <div className="absolute bottom-3 right-3">
                <span className="inline-flex rounded-md bg-primary text-primary-foreground px-2 py-1 text-xs font-semibold">
                  {formatPrice(event.price)}
                </span>
              </div>
            </div>
            <CardHeader className="p-5 pb-3 flex-1 space-y-2">
              <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                {event.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-3 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(event.startTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{event.location}</span>
              </div>
            </CardContent>
            <CardFooter className="p-5 pt-3 flex items-center justify-between hairline">
              <span className="text-xs text-muted-foreground">
                {Math.max(0, event.capacity - event.ticketsIssuedCount)} tickets
                left
              </span>
              <span className="text-xs font-medium text-primary inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                Details <ArrowRight className="h-3 w-3" />
              </span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
