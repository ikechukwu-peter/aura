import { prisma } from "@/lib/prisma";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Search as SearchIcon, ArrowRight, Zap } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
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
  let orderBy: Record<string, string> = { startTime: "asc" };
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
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-foreground">
            Find your next event
          </h1>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto">
          <form className="flex w-full md:w-auto items-center gap-4">
            <div className="relative flex-1 md:w-112.5">
              <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search events, locations, categories..."
                defaultValue={q}
                className="pl-14 h-12 bg-background border-border focus:border-primary/50 transition-all rounded-lg font-medium"
              />
            </div>
            <Button type="submit" variant="default" className="h-12 px-6 rounded-lg font-semibold">Search</Button>
          </form>
          
          <div className="flex justify-end">
            <EventFilters />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pb-4">
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
                variant={!category || category === "all" ? "default" : "outline"}
                className="rounded-full h-9 px-5 cursor-pointer text-sm font-medium"
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
                    variant={category === cat ? "default" : "outline"}
                    className="rounded-full h-9 px-5 cursor-pointer text-sm font-medium"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden group flex flex-col p-0 bg-background border border-border hover:border-primary/30 transition-colors rounded-lg">
              <div className="aspect-16/11 relative bg-muted overflow-hidden">
                {event.images && event.images.length > 0 ? (
                  <Image 
                    src={event.images[0].thumbPath || event.images[0].originalPath} 
                    alt={event.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                     <Zap className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="px-3 py-1 rounded-full bg-background/90 border border-border text-xs font-medium text-foreground">
                    {event.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-primary text-xs font-medium text-white">
                    {Number((event as unknown as Record<string, unknown>).price ?? 0) === 0 ? "Free" : `$${Number((event as unknown as Record<string, unknown>).price ?? 0).toFixed(2)}`}
                  </span>
                </div>
              </div>

              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors leading-tight text-foreground">
                  {event.title}
                </CardTitle>
                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3 border border-primary/20">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    {formatDate(event.startTime)}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center mr-3 border border-border">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {event.location}
                  </div>
                </div>
              </CardHeader>

              <CardFooter className="p-5 pt-0 mt-auto">
                <Button variant="default" className="w-full h-10 rounded-lg text-sm font-medium group/btn transition-all" asChild>
                  <Link href={`/events/${event.id}`}>
                    View details <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1 ml-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-16 text-center bg-muted/30 border-dashed border-border rounded-lg">
          <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center mx-auto border border-border text-muted-foreground/50">
            <SearchIcon className="h-8 w-8" />
          </div>
          <h3 className="mt-6 text-xl font-bold tracking-tight">No events found</h3>
          <p className="text-muted-foreground mt-2 font-medium">Try adjusting your search or filters to find what you&apos;re looking for.</p>
        </Card>
      )}
    </div>
  );
}
