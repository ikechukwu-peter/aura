import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EventCreateForm } from "@/components/organizer/event-create-form";

export default async function NewEventPage() {
  const session = await getSession();

  if (!session || session.role !== "ORGANIZER") {
    redirect("/login");
  }

  return (
    <div className="container">
      <EventCreateForm />
    </div>
  );
}
