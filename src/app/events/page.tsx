import { prisma } from "@/lib/prisma";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Search as SearchIcon, ArrowRight, Zap } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { EventFilters } from "@/components/events/event-filters";
import { Prisma } from "@prisma/client";

type EventWithImages = Prisma.EventGetPayload<{
  include: { images: true }
}>;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    q?: string; 
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
    location?: string;
    available?: string;
    freeOnly?: string;
  }>;
}) {
  const { q, category, minPrice, maxPrice, startDate, endDate, sort, location, available, freeOnly } = await searchParams;

  // Build the orderBy object based on the sort parameter
  let orderBy: any = { startTime: "asc" };
  if (sort === "date_desc") orderBy = { startTime: "desc" };
  else if (sort === "price_asc") orderBy = { price: "asc" };
  else if (sort === "price_desc") orderBy = { price: "desc" };
  else if (sort === "newest") orderBy = { createdAt: "desc" };

  const allEvents = (await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      approvedByAdmin: true,
      AND: [
        q ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { location: { contains: q } },
          ],
        } : {},
        category && category !== "all" ? { category: { equals: category } } : {},
        location ? { location: { contains: location } } : {},
        freeOnly === "true" ? { price: { equals: 0 } } : {
          AND: [
            minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
            maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
          ]
        },
        startDate ? { startTime: { gte: new Date(startDate) } } : {},
        endDate ? { 
          startTime: { 
            lte: (() => {
              const date = new Date(endDate);
              date.setHours(23, 59, 59, 999);
              return date;
            })()
          } 
        } : {},
      ] as Prisma.EventWhereInput[],
    },
    include: {
      images: true,
    },
    orderBy,
  })) as EventWithImages[];

  let events = allEvents;
  if (available === "true") {
    events = allEvents.filter(e => e.capacity > e.ticketsIssuedCount);
  }

  const categoriesData = await prisma.event.groupBy({
    by: ["category"],
    where: { status: "PUBLISHED", approvedByAdmin: true },
  });
  
  const categories = categoriesData.map(c => c.category);

  return (
    <div className="py-16 space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-5">
          <div className="inline-flex items-center rounded-full border border-aura-primary/20 bg-aura-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-aura-primary backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-aura-primary mr-3 animate-pulse shadow-glow-aura" />
            Discover experiences
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none text-foreground">
            Find your next <br />
            <span className="bg-gradient-to-r from-aura-primary via-aura-secondary to-aura-accent bg-clip-text text-transparent animate-gradient-x uppercase">adventure</span>
          </h1>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto">
          <form className="flex w-full md:w-auto items-center gap-4">
            <div className="relative flex-1 md:w-[450px]">
              <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
              <Input
                name="q"
                placeholder="Search events, locations, categories..."
                defaultValue={q}
                className="pl-14 h-16 bg-background border-border/60 backdrop-blur-md focus:border-aura-primary/50 transition-all rounded-2xl font-bold shadow-sm"
              />
            </div>
            <Button type="submit" className="h-16 px-10 shadow-glow-aura rounded-2xl font-black uppercase tracking-widest text-xs">Search</Button>
          </form>
          
          <div className="flex justify-end">
            <EventFilters categories={categories} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pb-4">
        {(() => {
          const currentParams = new URLSearchParams();
          if (q) currentParams.set("q", q);
          if (minPrice) currentParams.set("minPrice", minPrice);
          if (maxPrice) currentParams.set("maxPrice", maxPrice);
          if (startDate) currentParams.set("startDate", startDate);
          if (endDate) currentParams.set("endDate", endDate);
          if (location) currentParams.set("location", location);
          if (available) currentParams.set("available", available);
          if (freeOnly) currentParams.set("freeOnly", freeOnly);
          if (sort) currentParams.set("sort", sort);

          const allParams = new URLSearchParams(currentParams);
          allParams.delete("category");
          const allHref = `/events${allParams.toString() ? `?${allParams.toString()}` : ""}`;

          return (
            <>
              <Button
                variant={!category || category === "all" ? "default" : "glass"}
                className={`rounded-full h-11 px-8 cursor-pointer font-black uppercase tracking-widest text-[10px] ${(!category || category === "all") ? 'bg-aura-primary shadow-glow-aura border-aura-primary' : ''}`}
                asChild
              >
                <Link href={allHref}>All categories</Link>
              </Button>
              {categories.map((cat) => {
                const catParams = new URLSearchParams(currentParams);
                catParams.set("category", cat);
                return (
                  <Button
                    key={cat}
                    variant={category === cat ? "default" : "glass"}
                    className={`rounded-full h-11 px-8 cursor-pointer font-black uppercase tracking-widest text-[10px] ${category === cat ? 'bg-aura-primary shadow-glow-aura border-aura-primary' : ''}`}
                    asChild
                  >
                    <Link href={`/events?${catParams.toString()}`}>
                      {cat}
                    </Link>
                  </Button>
                );
              })}
            </>
          );
        })()}
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden group flex flex-col p-0 bg-background border border-border/60 hover:border-aura-primary/30 transition-all duration-500 rounded-[2.5rem] shadow-card hover:shadow-2xl">
              <div className="aspect-[16/11] relative bg-foreground/[0.03] overflow-hidden">
                {event.images && event.images.length > 0 ? (
                  <img 
                    src={event.images[0].thumbPath || event.images[0].originalPath} 
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-foreground/10 group-hover:scale-110 transition-transform duration-700">
                     <Zap className="h-24 w-24 opacity-10 text-aura-primary" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-background/60 backdrop-blur-xl border border-border text-[10px] font-black tracking-[0.2em] text-foreground">
                    {event.category}
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-aura-primary/80 backdrop-blur-xl border border-aura-primary/40 text-[10px] font-black tracking-[0.2em] text-white shadow-glow-aura">
                    {(event as any).price === 0 ? "Free" : `$${(event as any).price.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <CardHeader className="p-10 pb-6">
                <CardTitle className="text-3xl font-black tracking-tighter group-hover:text-aura-primary transition-colors duration-300 leading-none text-foreground">
                  {event.title}
                </CardTitle>
                <div className="flex flex-col gap-5 mt-8">
                  <div className="flex items-center text-sm text-foreground/70 font-black uppercase tracking-tight">
                    <div className="h-8 w-8 rounded-lg bg-aura-primary/10 flex items-center justify-center mr-4 border border-aura-primary/20">
                      <Calendar className="h-4 w-4 text-aura-primary" />
                    </div>
                    {formatDate(event.startTime)}
                  </div>
                  <div className="flex items-center text-sm text-foreground/70 font-black uppercase tracking-tight">
                    <div className="h-8 w-8 rounded-lg bg-aura-secondary/10 flex items-center justify-center mr-4 border border-aura-secondary/20">
                      <MapPin className="h-4 w-4 text-aura-secondary" />
                    </div>
                    {event.location}
                  </div>
                </div>
              </CardHeader>

              <CardFooter className="p-10 pt-0 mt-auto">
                <Button className="w-full h-14 rounded-2xl group/btn font-black uppercase tracking-widest text-[10px] shadow-glow-aura transition-all hover:scale-[1.02] cursor-pointer bg-aura-primary hover:bg-aura-primary/90" variant="default" asChild>
                  <Link href={`/events/${event.id}`}>
                    Secure Access <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-32 text-center bg-foreground/5 border-dashed border-border rounded-[2.5rem]">
          <div className="h-24 w-24 rounded-3xl bg-foreground/5 flex items-center justify-center mx-auto border border-border text-foreground/10">
            <SearchIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-8 text-2xl font-black tracking-tight uppercase">No events found</h3>
          <p className="text-foreground/40 mt-2 font-medium">Try adjusting your search or filters to find what you're looking for.</p>
        </Card>
      )}
    </div>
  );
}
