import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Ticket, Users, Calendar, ArrowUpRight, CheckCircle, BarChart3, TrendingUp } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { OrganizerAnalytics } from "@/components/organizer/analytics";
import { SalesTrend } from "@/components/organizer/sales-trend";
import { StatusBadge } from "@/components/ui/status-badge";

type EventWithStats = Prisma.EventGetPayload<{
  include: {
    _count: {
      select: { tickets: true, reservations: true },
    },
  },
}> & { price: number; capacity: number; ticketsIssuedCount: number };

type TicketWithEvent = Prisma.TicketGetPayload<{
  include: {
    event: true;
  };
}> & { pricePaid: number; issuedAt: Date };

export default async function OrganizerDashboard() {
  const session = await getSession();

  if (!session || session.role !== "ORGANIZER") {
    redirect("/login");
  }

  const events = (await prisma.event.findMany({
    where: { organizerId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { tickets: true, reservations: true },
      },
    },
  })) as EventWithStats[];

  const totalTicketsSold = events.reduce((acc, event) => acc + event.ticketsIssuedCount, 0);
  const totalCapacity = events.reduce((acc, event) => acc + event.capacity, 0);

  const chartData = events.slice(0, 5).map(e => ({
    name: e.title.length > 15 ? e.title.substring(0, 15) + "..." : e.title,
    sold: e.ticketsIssuedCount,
    capacity: e.capacity
  })).reverse();

  const totalRevenue = events.reduce((acc, event) => acc + (event.ticketsIssuedCount * (event.price || 0)), 0);

  // Fetch sales trend for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentTickets = (await prisma.ticket.findMany({
    where: {
      event: { organizerId: session.userId },
      issuedAt: { gte: thirtyDaysAgo },
    },
    orderBy: { issuedAt: "asc" },
    include: {
      event: true,
    },
  })) as TicketWithEvent[];

  // Group tickets by date
  const salesByDate: Record<string, { date: string; sales: number; revenue: number }> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    salesByDate[dateStr] = { date: dateStr.split('-').slice(1).join('/'), sales: 0, revenue: 0 };
  }

  recentTickets.forEach(ticket => {
    const dateStr = ticket.issuedAt.toISOString().split('T')[0];
    if (salesByDate[dateStr]) {
      salesByDate[dateStr].sales += 1;
      salesByDate[dateStr].revenue += ticket.pricePaid || 0;
    }
  });

  const salesTrendData = Object.values(salesByDate).reverse();

  return (
    <div className="container py-16 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary backdrop-blur-md">
            <BarChart3 className="h-4 w-4 mr-2" />
            Organizer Dashboard
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
            Organizer <span className="text-primary">DASHBOARD</span>
          </h1>
        </div>
        <Button variant="default" size="lg" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs cursor-pointer" asChild>
          <Link href="/organizer/events/new" className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Create Event
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group border-primary/20 bg-primary/5 shadow-none rounded-4xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
            <Ticket className="h-12 w-12" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">Total Tickets Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter text-primary">
              {totalTicketsSold.toLocaleString()}
            </div>
            <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest mt-2">
              Across {events.length} events
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-border/60 bg-foreground/2 shadow-none rounded-4xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="h-12 w-12" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Capacity Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter">
              {totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0}%
            </div>
            <div className="w-full bg-foreground/5 rounded-full h-2 mt-4 overflow-hidden border border-border">
               <div
                 className="bg-primary h-full transition-all duration-1000"
                 style={{ width: `${totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0}%` }}
               />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-border/60 bg-foreground/2 shadow-none rounded-4xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar className="h-12 w-12" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter">
              {events.filter(e => e.status === "PUBLISHED").length}
            </div>
            <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest mt-2">
              Live events
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-primary/20 bg-primary/5 shadow-none rounded-4xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
            <ArrowUpRight className="h-12 w-12" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter text-primary">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest mt-2">
              Gross Volume
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 rounded-[2.5rem] bg-background border border-border/60 shadow-card overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-border/40 bg-foreground/1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sales Trend
              </CardTitle>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Last 30 Days
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <SalesTrend data={salesTrendData} />
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] bg-background border border-border/60 shadow-card overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-border/40 bg-foreground/1">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary" />
              Payouts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 space-y-6">
            <div className="p-6 rounded-2xl bg-foreground/3 border border-border/60 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Available for Payout</span>
                <span className="text-xl font-black text-primary">${(totalRevenue * 0.9).toLocaleString()}</span>
              </div>
              <Button variant="default" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] cursor-pointer">
                Request Payout
              </Button>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Recent Activity</h4>
              <div className="text-center py-8">
                <p className="text-xs font-bold text-muted-foreground/70 italic">No recent payouts detected in the system.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 rounded-[2.5rem] bg-background border border-border/60 shadow-card overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-border/40 bg-foreground/1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                Performance
              </CardTitle>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Last 5 Events
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <OrganizerAnalytics data={chartData} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black tracking-tighter uppercase">Recent <span className="text-primary">Events</span></h2>
          <Link href="/organizer/events" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            View All Events
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {events.map((event) => (
            <div key={event.id} className="group p-6 rounded-3xl bg-foreground/2 border border-border/60 hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-foreground/3 border border-border/60 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">{formatDate(event.startTime).split(' ')[0]}</span>
                  <span className="text-lg font-black">{formatDate(event.startTime).split(' ')[1]}</span>
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors">{event.title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> {event.ticketsIssuedCount} / {event.capacity}
                    </span>
                    <StatusBadge variant={event.status === "PUBLISHED" ? "success" : "warning"}>
                      {event.status}
                    </StatusBadge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="h-10 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest cursor-pointer" asChild>
                  <Link href={`/organizer/events/${event.id}`}>Manage event</Link>
                </Button>
                <Button variant="outline" size="sm" className="h-10 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest cursor-pointer" asChild>
                  <Link href={`/organizer/events/${event.id}/edit`}>Edit</Link>
                </Button>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <Card className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-foreground/2 border-dashed border-border shadow-none">
              <div className="h-24 w-24 rounded-3xl bg-foreground/3 flex items-center justify-center border border-border text-foreground/10 transition-all duration-300">
                <Plus className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight uppercase">No events yet</h3>
                <p className="text-muted-foreground max-w-md">Create your first event to start selling tickets.</p>
              </div>
              <Button variant="default" className="h-12 px-8 font-black uppercase tracking-widest text-xs" asChild>
                <Link href="/organizer/events/new">Create Your First Event</Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
