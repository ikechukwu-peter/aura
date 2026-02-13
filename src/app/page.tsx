import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Shield, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  const featuredEvents = await prisma.event.findMany({
    where: { status: "PUBLISHED", approvedByAdmin: true },
    take: 3,
    orderBy: { startTime: "asc" },
  });

  return (
    <div className="flex flex-col gap-16 pb-16 w-full">
      {/* Hero Section */}
      <section className="relative py-24 md:py-36 overflow-hidden w-full">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-aura-primary/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-aura-secondary/10 blur-[100px] rounded-full -z-10" />
        
        <div className="w-full relative z-10">
          <div className="max-w-4xl space-y-8">
            <div className="inline-flex items-center rounded-full border border-aura-primary/20 bg-aura-primary/5 px-6 py-2 text-xs font-bold tracking-wide text-aura-primary backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-1000">
              <Sparkles className="h-4 w-4 mr-3 animate-pulse" />
              The future of ticketing is here
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-foreground">
              Aura <span className="bg-gradient-to-r from-aura-primary via-aura-secondary to-aura-accent bg-clip-text text-transparent animate-gradient-x text-shadow-glow">Experience</span>
            </h1>
            <p className="text-xl text-foreground/70 dark:text-foreground/60 max-w-2xl leading-relaxed font-medium tracking-normal">
              The world's most advanced event infrastructure. <br />
              <span className="text-aura-primary/60 font-semibold">Built on speed, secured by Aura Neural Systems.</span>
            </p>
            <div className="flex flex-wrap gap-4 pt-6">
              <Button size="xl" className="h-20 px-12 shadow-glow-aura rounded-2xl text-base font-bold transition-all hover:scale-[1.02] active:scale-95 group cursor-pointer bg-aura-primary hover:bg-aura-primary/90" asChild>
                <Link href="/events" className="flex items-center gap-3">
                  Browse events <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              {session ? (
                <Button size="xl" variant="glass" className="h-20 px-12 rounded-2xl text-base font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border-aura-primary/20 text-aura-primary" asChild>
                  <Link href={(session.role === "ADMIN" || (session.role as string) === "SUPER_ADMIN") ? "/admin/dashboard" : session.role === "ORGANIZER" ? "/organizer/dashboard" : "/dashboard"}>
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <Button size="xl" variant="glass" className="h-20 px-12 rounded-2xl text-base font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border-aura-primary/20 text-aura-primary" asChild>
                  <Link href="/register">Create account</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-10 space-y-8 group bg-background border-border/60 hover:border-aura-primary/30 transition-all duration-500 rounded-[2.5rem] shadow-card hover:shadow-2xl hover:shadow-aura-primary/10 hover:-translate-y-1">
            <div className="h-20 w-20 rounded-3xl bg-aura-primary/10 flex items-center justify-center text-aura-primary group-hover:bg-aura-primary/20 group-hover:shadow-glow-aura transition-all duration-500 border border-aura-primary/20">
              <Shield className="h-10 w-10" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Secure ticketing</h3>
              <p className="text-foreground/70 dark:text-foreground/50 leading-relaxed">
                Anti-fraud QR codes and cryptographic verification ensure your tickets are always safe.
              </p>
            </div>
          </Card>
          <Card className="p-10 space-y-8 group bg-background border-border/60 hover:border-aura-secondary/30 transition-all duration-500 rounded-[2.5rem] shadow-card hover:shadow-2xl hover:shadow-aura-secondary/10 hover:-translate-y-1">
            <div className="h-20 w-20 rounded-3xl bg-aura-secondary/10 flex items-center justify-center text-aura-secondary group-hover:bg-aura-secondary/20 group-hover:shadow-glow-aura transition-all duration-500 border border-aura-secondary/20">
              <Zap className="h-10 w-10" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Instant access</h3>
              <p className="text-foreground/70 dark:text-foreground/50 leading-relaxed">
                Our high-performance engine guarantees no overselling and instant ticket holds.
              </p>
            </div>
          </Card>
          <Card className="p-10 space-y-8 group bg-background border-border/60 hover:border-aura-accent/30 transition-all duration-500 rounded-[2.5rem] shadow-card hover:shadow-2xl hover:shadow-aura-accent/10 hover:-translate-y-1">
            <div className="h-20 w-20 rounded-3xl bg-aura-accent/10 flex items-center justify-center text-aura-accent group-hover:bg-aura-accent/20 group-hover:shadow-glow-aura transition-all duration-500 border border-aura-accent/20">
              <Calendar className="h-10 w-10" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Smart discovery</h3>
              <p className="text-foreground/70 dark:text-foreground/50 leading-relaxed">
                Find exactly what you're looking for with advanced search and personalized filters.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Featured Events */}
      <section className="w-full space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-aura-primary rounded-full" />
              <h2 className="text-sm font-bold tracking-widest text-aura-primary">Spotlight</h2>
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground">Featured events</h2>
            <p className="text-foreground/60 text-xl font-medium">The most anticipated experiences happening soon.</p>
          </div>
          <Button variant="link" className="text-aura-primary font-bold tracking-wider text-sm p-0 group cursor-pointer" asChild>
            <Link href="/events" className="flex items-center gap-2">
              View all events <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {featuredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden group flex flex-col p-0 bg-background border-border/60 hover:border-aura-primary/20 transition-all duration-500 rounded-[2.5rem] shadow-card hover:shadow-2xl">
              <div className="aspect-[16/11] relative bg-foreground/[0.03] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-foreground/10 group-hover:scale-110 transition-transform duration-700">
                   <Calendar className="h-24 w-24 opacity-10" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 rounded-full bg-background/60 backdrop-blur-xl border border-border text-[10px] font-bold tracking-wider text-foreground">
                    {event.category}
                  </span>
                </div>
              </div>
              <CardHeader className="flex-1 p-10 pb-6">
                <CardTitle className="text-3xl font-bold tracking-tight group-hover:text-aura-primary transition-colors duration-300 leading-tight text-foreground">
                  {event.title}
                </CardTitle>
                <div className="flex flex-col gap-5 mt-8">
                  <div className="flex items-center text-sm text-foreground/70 font-medium">
                    <div className="h-8 w-8 rounded-lg bg-aura-primary/10 flex items-center justify-center mr-4 border border-aura-primary/20">
                      <Calendar className="h-4 w-4 text-aura-primary" />
                    </div>
                    {formatDate(event.startTime)}
                  </div>
                  <div className="flex items-center text-sm text-foreground/70 font-medium">
                    <div className="h-8 w-8 rounded-lg bg-aura-secondary/10 flex items-center justify-center mr-4 border border-aura-secondary/20">
                      <MapPin className="h-4 w-4 text-aura-secondary" />
                    </div>
                    {event.location}
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="p-10 pt-0">
                <Button className="w-full h-16 rounded-2xl group/btn font-bold text-sm shadow-glow-aura transition-all hover:scale-[1.02] cursor-pointer bg-aura-primary hover:bg-aura-primary/90" variant="default" asChild>
                  <Link href={`/events/${event.id}`} className="w-full h-full flex items-center justify-center gap-3">
                    Get tickets
                    <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
