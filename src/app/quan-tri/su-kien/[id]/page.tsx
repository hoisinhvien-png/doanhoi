import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { getFaculties } from "@/lib/queries";
import { formatDate, formatDateTime, toLocalInputValue } from "@/lib/format";
import { confirmDeadline } from "@/lib/attendance";
import { deleteEvent, updateEvent } from "@/app/actions/events";
import { setAttendance } from "@/app/actions/participations";
import { AttendanceTable } from "@/components/attendance-table";
import { EventForm } from "../event-form";
import { DeleteEventButton } from "@/components/delete-event-button";

export default async function EditEventPage({ params }: PageProps<"/quan-tri/su-kien/[id]">) {
  await requireRole("ADMIN");
  const { id } = await params;
  const ev = await prisma.event.findUnique({
    where: { id },
    include: {
      participations: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, studentId: true, className: true, faculty: true } } },
      },
    },
  });
  if (!ev) notFound();
  const faculties = await getFaculties();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Sửa sự kiện</h1>
        <EventForm
          action={updateEvent.bind(null, ev.id)}
          faculties={faculties}
          submitLabel="Lưu thay đổi"
          initial={{
            title: ev.title,
            date: toLocalInputValue(ev.date),
            location: ev.location ?? "",
            faculty: ev.faculty ?? "",
            description: ev.description ?? "",
            registrationOpen: ev.registrationOpen,
          }}
        />
      </div>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Sinh viên đăng ký ({ev.participations.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            Diễn ra {formatDateTime(ev.date)}. LCĐ xác nhận tham gia đến hết ngày{" "}
            {formatDate(confirmDeadline(ev.date))}; Đoàn trường đổi được trạng thái bất cứ lúc nào.
          </p>
        </div>
        <AttendanceTable
          canEdit
          showFaculty
          markAttended={setAttendance.bind(null, ev.id, true)}
          markAbsent={setAttendance.bind(null, ev.id, false)}
          rows={ev.participations.map((p) => ({
            id: p.id,
            studentId: p.user.studentId ?? "",
            name: p.user.name,
            className: p.user.className ?? "",
            faculty: p.user.faculty ?? "",
            status: p.status,
            createdAt: p.createdAt.toISOString(),
          }))}
        />
      </section>

      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <h2 className="font-semibold text-destructive">Xoá sự kiện</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Xoá cả {ev.participations.length} lượt đăng ký của sự kiện này. Không khôi phục được.
        </p>
        <DeleteEventButton action={deleteEvent.bind(null, ev.id)} title={ev.title} />
      </section>
    </div>
  );
}
