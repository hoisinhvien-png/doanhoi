import { requireRole } from "@/lib/dal";
import { getFaculties } from "@/lib/queries";
import { createEvent } from "@/app/actions/events";
import { EventForm } from "../event-form";

export default async function NewEventPage() {
  await requireRole("ADMIN");
  const faculties = await getFaculties();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Thêm sự kiện</h1>
      <EventForm action={createEvent} faculties={faculties} submitLabel="Tạo sự kiện" />
    </div>
  );
}
