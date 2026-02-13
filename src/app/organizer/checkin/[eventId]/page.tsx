import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckinInterface } from "@/components/organizer/checkin-interface";

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await getSession();
  const { eventId } = await params;

  if (!session || (session.role !== "ORGANIZER" && session.role !== "ADMIN" && (session.role as string) !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) notFound();

  // Verify ownership
  if (session.role === "ORGANIZER" && event.organizerId !== session.userId) {
    redirect("/organizer/dashboard");
  }

  return (
    <div className="container py-12 max-w-lg mx-auto">
      <CheckinInterface event={event} />
    </div>
  );
}
