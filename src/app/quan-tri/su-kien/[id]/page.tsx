import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { getFaculties } from "@/lib/queries";
import { formatDateTime, toLocalInputValue } from "@/lib/format";
import { deleteEvent, updateEvent } from "@/app/actions/events";
import { StatusBadge } from "@/components/status-badge";
import { EventForm } from "../event-form";
import { DeleteEventButton } from "./delete-button";

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
        <h2 className="text-lg font-semibold">
          Sinh viên đăng ký ({ev.participations.length})
        </h2>
        {ev.participations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có ai đăng ký.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-background">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Mã SV</th>
                  <th className="px-3 py-2 font-medium">Họ tên</th>
                  <th className="px-3 py-2 font-medium">Lớp</th>
                  <th className="px-3 py-2 font-medium">Khoa</th>
                  <th className="px-3 py-2 font-medium">Đăng ký lúc</th>
                  <th className="px-3 py-2 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {ev.participations.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">{p.user.studentId}</td>
                    <td className="px-3 py-2">{p.user.name}</td>
                    <td className="px-3 py-2">{p.user.className}</td>
                    <td className="px-3 py-2">{p.user.faculty}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(p.createdAt)}</td>
                    <td className="px-3 py-2"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
