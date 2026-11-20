import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Lock, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { formatDate, formatDateTime } from "@/lib/format";
import { confirmDeadline, lcdWindow } from "@/lib/attendance";
import { setAttendance } from "@/app/actions/participations";
import { AttendanceTable } from "@/components/attendance-table";
import { Tag } from "@/components/status-badge";

/** LCĐ xem một sự kiện: sắp diễn ra thì chỉ xem; trong 7 ngày sau sự kiện thì xác nhận Tham gia */
export default async function LcdEventPage({ params }: PageProps<"/lien-chi/su-kien/[id]">) {
  const me = await requireRole("LCD");
  if (!me.faculty) notFound();
  const { id } = await params;
  const ev = await prisma.event.findFirst({
    where: { id, OR: [{ faculty: null }, { faculty: me.faculty }] },
    include: {
      participations: {
        where: { user: { faculty: me.faculty } },
        orderBy: [{ user: { className: "asc" } }, { user: { name: "asc" } }],
        include: { user: { select: { name: true, studentId: true, className: true } } },
      },
    },
  });
  if (!ev) notFound();

  const w = lcdWindow(ev.date, new Date());
  const deadline = confirmDeadline(ev.date);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/lien-chi/su-kien" className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Các sự kiện
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{ev.title}</h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-4" />
            {formatDateTime(ev.date)}
          </span>
          {ev.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" />
              {ev.location}
            </span>
          )}
          <Tag tone="blue">{ev.faculty ?? "Toàn trường"}</Tag>
        </p>
        {ev.description && <p className="text-sm whitespace-pre-line">{ev.description}</p>}
      </div>

      {w === "upcoming" && (
        <p className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:bg-sky-900/30 dark:text-sky-100">
          Sự kiện chưa diễn ra: chỉ xem danh sách đăng ký. Sau khi sự kiện diễn ra, Liên chi Đoàn xác nhận
          Tham gia đến hết ngày {formatDate(deadline)}.
        </p>
      )}
      {w === "open" && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
          Chọn sinh viên đã có mặt rồi bấm <b>Tham gia</b>. Hạn xác nhận: hết ngày <b>{formatDate(deadline)}</b>;
          sau đó chỉ Đoàn trường thay đổi được.
        </p>
      )}
      {w === "locked" && (
        <p className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          <Lock className="size-4" /> Đã quá hạn xác nhận ({formatDate(deadline)}). Sự kiện đã khoá; liên hệ Đoàn trường
          nếu cần điều chỉnh.
        </p>
      )}

      {w !== "locked" && (
        <AttendanceTable
          canEdit={w === "open"}
          markAttended={setAttendance.bind(null, ev.id, true)}
          markAbsent={setAttendance.bind(null, ev.id, false)}
          rows={ev.participations.map((p) => ({
            id: p.id,
            studentId: p.user.studentId ?? "",
            name: p.user.name,
            className: p.user.className ?? "",
            status: p.status,
            createdAt: p.createdAt.toISOString(),
          }))}
        />
      )}
    </div>
  );
}
