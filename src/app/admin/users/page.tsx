import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UserManagementTable } from "@/components/admin/user-management-table";

export default async function AdminUsersPage() {
  const session = await getSession();

  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN" as UserRole)) {
    redirect("/login");
  }

  // Admin can only see USER and ORGANIZER. Super Admin can see everyone.
  const where = session.role === "ADMIN" 
    ? { role: { in: ["USER", "ORGANIZER"] as UserRole[] } } 
    : { id: { not: session.userId } }; // Super Admin sees everyone except themselves

  const usersData = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBlocked: true,
      createdAt: true,
    } as any,
  });

  // Convert dates to strings for the client component
  const users = (usersData as any[]).map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as string,
    isBlocked: !!user.isBlocked,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <div className="container py-16 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-xs font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-all group mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Overseer
          </Link>
          <div className="inline-flex items-center rounded-full border border-aura-primary/20 bg-aura-primary/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-aura-primary backdrop-blur-md">
            <Users className="h-4 w-4 mr-2" />
            Population Registry
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-foreground">
            Registry <span className="bg-gradient-to-r from-aura-primary via-aura-secondary to-aura-accent bg-clip-text text-transparent animate-gradient-x">ENTRIES</span>
          </h1>
        </div>
      </div>

      <UserManagementTable initialUsers={users} currentUserRole={session.role as string} />
    </div>
  );
}
