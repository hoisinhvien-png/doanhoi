import { Award, CalendarDays, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { formatDate, formatDateTime, startOfTodayVN } from "@/lib/format";
import { computeGrades, defaultRange, getGradingRules, parseDateInput } from "@/lib/grading";
import { schoolYear } from "@/lib/stats";
import { cancelRegistration, registerEvent } from "@/app/actions/participations";
import { Button } from "@/components/ui/button";
import { StatusBadge, Tag } from "@/components/status-badge";

/** Trang sinh viên: xếp loại đoàn viên + toàn bộ sự kiện trong năm học (Bổ sung 20/11/2026) */
export default async function StudentHome() {
  const me = await requireRole("STUDENT");
  const now = new Date();
  const sy = schoolYear(now);
  const range = defaultRange(now);
  const gradeFrom = parseDateInput(range.from)!;
  const gradeTo = parseDateInput(range.to, true)!;

  const [events, grades, rules] = await Promise.all([
    prisma.event.findMany({
      // Chỉ sự kiện toàn trường và của khoa mình — sự kiện khoa khác không hiển thị.
      where: { date: { gte: sy.from, lte: sy.to }, OR: [{ faculty: null }, { faculty: me.faculty }] },
      orderBy: { date: "asc" },
      include: { participations: { where: { userId: me.id }, select: { status: true } } },
    }),
    computeGrades({ from: gradeFrom, to: gradeTo, userId: me.id }),
    getGradingRules(),
  ]);
  const g = grades[0];
  const today = startOfTodayVN(now);
  const upcoming = events.filter((e) => e.date >= today);
  const past = events.filter((e) => e.date < today).reverse();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Xin chào, {me.name}</h1>
        <p className="text-muted-foreground">
          {me.username ? <b className="font-mono text-foreground">{me.username}</b> : null}
          {me.username ? " · " : ""}
          {me.studentId} · {me.className} · {me.faculty}
        </p>
      </div>

      <section className="grid gap-4 rounded-2xl border bg-gradient-to-br from-[#0072bc] to-[#0094d9] p-5 text-white sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded-2xl bg-white/20">
            <Award className="size-8" />
          </span>
          <div>
            <p className="text-sm text-white/80">Xếp loại đoàn viên</p>
            <p className="text-3xl font-extrabold">{g?.grade ?? "—"}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center sm:ml-6">
          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-2xl font-bold tabular-nums">{g?.score?.toFixed(2) ?? "—"}</p>
            <p className="text-xs text-white/80">Điểm (thang 10)</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-2xl font-bold tabular-nums">{g?.confirmed ?? 0}</p>
            <p className="text-xs text-white/80">Sự kiện tham gia</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-2xl font-bold tabular-nums">{g?.eligible ?? 0}</p>
            <p className="text-xs text-white/80">Sự kiện được tham gia</p>
          </div>
        </div>
        <p className="text-xs text-white/80 sm:col-span-2">
          Tính từ {formatDate(gradeFrom)} đến hôm nay: số sự kiện được xác nhận <b>Tham gia</b> ÷ số sự kiện toàn
          trường và của khoa mình × 10. Ngưỡng:{" "}
          {rules.map((r, i) => (
            <span key={r.id}>
              {i ? ", " : ""}
              {r.label} ≥ {r.minScore}
            </span>
          ))}
          . Sau mỗi sự kiện, Liên chi Đoàn xác nhận trong vòng 7 ngày.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          Sắp diễn ra · năm học {sy.label} ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <Empty>Chưa có sự kiện sắp diễn ra.</Empty>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {upcoming.map((ev) => {
              const mine = ev.participations[0];
              const eligible = !ev.faculty || ev.faculty === me.faculty;
              return (
                <article key={ev.id} className="flex flex-col gap-3 rounded-xl border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{ev.title}</h3>
                    {mine && <Tag tone="blue">Đã đăng ký tham gia</Tag>}
                  </div>
                  <EventMeta date={ev.date} location={ev.location} />
                  {ev.description && <p className="line-clamp-3 text-sm whitespace-pre-line">{ev.description}</p>}
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <Tag tone={eligible ? "blue" : "muted"}>{ev.faculty ?? "Toàn trường"}</Tag>
                    {!eligible ? (
                      <span className="text-xs text-muted-foreground">Dành cho sinh viên khoa {ev.faculty}</span>
                    ) : mine ? (
                      <form action={cancelRegistration.bind(null, ev.id)}>
                        <Button type="submit" variant="outline" className="h-9">Huỷ đăng ký</Button>
                      </form>
                    ) : ev.registrationOpen ? (
                      <form action={registerEvent.bind(null, ev.id)}>
                        <Button type="submit" className="h-9 px-5">Đăng ký tham gia</Button>
                      </form>
                    ) : (
                      <span className="text-xs text-muted-foreground">Đã đóng đăng ký</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Đã diễn ra ({past.length})</h2>
        {past.length === 0 ? (
          <Empty>Năm học này chưa có sự kiện nào diễn ra.</Empty>
        ) : (
          <ul className="flex flex-col divide-y rounded-xl border bg-background">
            {past.map((ev) => {
              const mine = ev.participations[0];
              return (
                <li key={ev.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">{ev.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(ev.date)}
                      {ev.location ? ` · ${ev.location}` : ""} · {ev.faculty ?? "Toàn trường"}
                    </p>
                  </div>
                  {mine ? (
                    <StatusBadge status={mine.status} />
                  ) : (
                    <span className="text-xs text-muted-foreground">Không đăng ký</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function EventMeta({ date, location }: { date: Date; location: string | null }) {
  return (
    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-4" />
        {formatDateTime(date)}
      </span>
      {location && (
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4" />
          {location}
        </span>
      )}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed bg-background p-8 text-center text-muted-foreground">{children}</div>
  );
}
