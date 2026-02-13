import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Calendar, AlertCircle, Activity } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { DeploymentRequests } from "@/components/admin/deployment-requests";

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session || ((session.role as string) !== "ADMIN" && (session.role as string) !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const [totalUsers, totalEvents, pendingEventsData, auditLogsData] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.event.findMany({
      where: { approvedByAdmin: false, status: "DRAFT" },
      include: { organizer: true } as any,
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { actor: true },
    }),
  ]);

  const pendingEvents = pendingEventsData as any[];
  const auditLogs = auditLogsData as any[];

  return (
    <div className="container py-16 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-aura-primary/20 bg-aura-primary/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-aura-primary backdrop-blur-md mb-4">
            <Shield className="h-4 w-4 mr-2" />
            Neural Infrastructure
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none text-foreground">
            Core <span className="bg-gradient-to-r from-aura-primary via-aura-secondary to-aura-accent bg-clip-text text-transparent animate-gradient-x uppercase">Overseer</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link href="/admin/users" className="block">
          <Card className="relative overflow-hidden group bg-background border-border/60 hover:border-aura-primary/30 transition-all duration-300 shadow-card rounded-[2rem] h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-aura-primary">
              <Users className="h-12 w-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Total citizens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tighter text-foreground group-hover:text-aura-primary transition-colors">
                {totalUsers.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="relative overflow-hidden group bg-background border-border/60 hover:border-aura-secondary/30 transition-all duration-300 shadow-card rounded-[2rem]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-aura-secondary">
            <Calendar className="h-12 w-12" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Active events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter text-foreground group-hover:text-aura-secondary transition-colors">
              {totalEvents.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group bg-background border-border/60 hover:border-amber-500/30 transition-all duration-300 shadow-card rounded-[2rem]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-amber-500">
            <AlertCircle className="h-12 w-12" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Pending verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter text-amber-500">
              {pendingEvents.length}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group bg-background border-border/60 hover:border-aura-accent/30 transition-all duration-300 shadow-card rounded-[2rem]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-aura-accent">
            <Activity className="h-12 w-12" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Neural status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter text-aura-accent uppercase">
              Optimal
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 rounded-[2.5rem] bg-background border border-border/60 shadow-card overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-border/40 bg-foreground/[0.01]">
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Deployment requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DeploymentRequests initialEvents={pendingEvents} />
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] bg-background border border-border/60 shadow-card overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-border/40 bg-foreground/[0.01]">
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
              <Activity className="h-5 w-5 text-aura-primary" />
              Audit records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex gap-4">
                  <div className="h-2 w-2 rounded-full bg-aura-primary mt-1.5 shrink-0 shadow-glow-aura" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground/70 leading-relaxed">
                      <span className="text-foreground font-black">{log.actor.name || "System"}</span> {log.action}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20">
                      {formatDate(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="glass" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest mt-4 cursor-pointer" asChild>
                <Link href="/admin/audit">Full audit history</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
