import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventCreateForm } from "@/components/organizer/event-create-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;

  if (!session || session.role !== "ORGANIZER") {
    redirect("/login");
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      images: true,
    },
  });

  if (!event) notFound();

  // Verify ownership
  if (event.organizerId !== session.userId) {
    redirect("/organizer/dashboard");
  }

  return (
    <div className="container">
      <EventCreateForm initialData={event} isEditing={true} />
    </div>
  );
}
