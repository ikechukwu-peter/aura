import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Shield, Activity, Clock, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AuditLogsPage() {
  const session = await getSession();

  if (
    !session ||
    (session.role !== "ADMIN" && (session.role as string) !== "SUPER_ADMIN")
  ) {
    redirect("/login");
  }

  const logsData = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      actor: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
    take: 100,
  });

  const logs = logsData as any[];

  return (
    <div className="container py-16 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-aura-primary/20 bg-aura-primary/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-aura-primary backdrop-blur-md">
            <Shield className="h-4 w-4 mr-2" />
            System Audit
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-foreground">
            Registry{" "}
            <span className="bg-gradient-to-r from-aura-primary to-aura-secondary bg-clip-text text-transparent">
              LOGS
            </span>
          </h1>
        </div>

        <div className="flex gap-4">
          <Button
            variant="glass"
            className="rounded-2xl h-14 px-8 group/btn"
            asChild
          >
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-3 h-4 w-4 transition-transform group-hover/btn:-translate-x-1" />
              Back to Hub
            </Link>
          </Button>
        </div>
      </div>

      <Card className="bg-background border-border/60 overflow-hidden rounded-[2.5rem] shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-foreground/[0.02]">
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  Timestamp
                </th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  Actor
                </th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  Action
                </th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  Entity
                </th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  Metadata
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-foreground/[0.01] transition-colors group"
                >
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-foreground/20" />
                      <span className="text-xs font-bold font-mono text-foreground/60">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-black uppercase tracking-tight text-foreground">
                        {log.actor?.name || "System"}
                      </span>
                      <span className="text-[10px] font-medium text-foreground/40">
                        {log.actor?.email || "automated@eventpass.io"}
                      </span>
                    </div>
                  </td>
                  <td className="p-8">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        log.action.includes("REJECT") ||
                        log.action.includes("DELETE")
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                          : log.action.includes("APPROVE") ||
                              log.action.includes("CREATE")
                            ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                            : "bg-aura-primary/10 text-aura-primary border-aura-primary/20"
                      }`}
                    >
                      {log.action.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-foreground/20" />
                      <span className="text-xs font-bold text-foreground/60 uppercase tracking-widest">
                        {log.entityType}
                      </span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                      <code className="text-[10px] bg-foreground/[0.03] px-2 py-1 rounded font-mono text-foreground/40 border border-border/40">
                        {log.metadata}
                      </code>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="p-10 rounded-[2.5rem] bg-aura-primary/5 border border-aura-primary/10 flex items-center gap-6">
        <Activity className="h-6 w-6 text-aura-primary" />
        <p className="text-xs font-black text-foreground/40 leading-relaxed uppercase tracking-widest">
          All system operations are cryptographically signed and immutable in
          the AURA registry.
        </p>
      </div>
    </div>
  );
}
