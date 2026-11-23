import Link from "next/link";
import { CalendarDays, CalendarPlus, Lock, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { formatDate, formatDateTime } from "@/lib/format";
import { defaultRange, parseDateInput } from "@/lib/grading";
import { confirmDeadline, lcdWindow, type LcdWindow } from "@/lib/attendance";
import { buttonVariants } from "@/components/ui/button";
import { Tag } from "@/components/status-badge";
import { cn } from "cn";

/** LCĐ: các sự kiện (toàn trường + khoa mình) trong khoảng thời gian, mặc định từ 01/08 tới nay */
export default async function LcdEventsPage({ searchParams }: PageProps<"/lien-chi/su-kien">) {
  const me = await requireRole("LCD");
  if (!me.faculty) {
    return <p className="text-muted-foreground">Tài khoản chưa được gán khoa. Liên hệ Đoàn trường.</p>;
  }
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const now = new Date();
  const def = defaultRange(now);
  const tu = str("tu") || def.from;
  const den = str("den") || def.to;
  const from = parseDateInput(tu);
  const to = parseDateInput(den, true);

  const scope = { OR: [{ faculty: null }, { faculty: me.faculty }] };
  const select = {
    id: true,
    title: true,
    date: true,
    location: true,
    faculty: true,
    createdById: true,
    participations: { where: { user: { faculty: me.faculty } }, select: { status: true } },
  } as const;

  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({ where: { ...scope, date: { gt: now } }, orderBy: { date: "asc" }, select }),
    from && to && from <= to
      ? prisma.event.findMany({
          where: { ...scope, date: { gte: from, lte: to.getTime() < now.getTime() ? to : now } },
          orderBy: { date: "desc" },
          select,
        })
      : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Các sự kiện</h1>
          <p className="text-muted-foreground">
            Sự kiện toàn trường và của khoa {me.faculty}. Sau khi sự kiện diễn ra, Liên chi Đoàn có 7 ngày để
            xác nhận <b>Tham gia</b> cho sinh viên; quá hạn sự kiện bị khoá.
          </p>
        </div>
        <Link href="/lien-chi/su-kien/moi" className={buttonVariants({ className: "h-10 px-4" })}>
          <CalendarPlus className="size-4" />
          Thêm sự kiện
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Sắp diễn ra ({upcoming.length})</h2>
        <EventList events={upcoming} now={now} myId={me.id} empty="Chưa có sự kiện sắp diễn ra." />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">Đã diễn ra{past ? ` (${past.length})` : ""}</h2>
          <form action="/lien-chi/su-kien" className="flex flex-wrap items-end gap-2 text-sm">
            <label className="flex flex-col gap-1">
              Từ ngày
              <input type="date" name="tu" defaultValue={tu} className="h-9 rounded-lg border border-input bg-background px-2" />
            </label>
            <label className="flex flex-col gap-1">
              Đến ngày
              <input type="date" name="den" defaultValue={den} className="h-9 rounded-lg border border-input bg-background px-2" />
            </label>
            <button type="submit" className={buttonVariants({ variant: "outline", className: "h-9" })}>
              Xem
            </button>
          </form>
        </div>
        {past ? (
          <EventList events={past} now={now} myId={me.id} empty="Không có sự kiện nào trong khoảng thời gian này." />
        ) : (
          <p className="text-destructive">Khoảng ngày không hợp lệ.</p>
        )}
      </section>
    </div>
  );
}

type Ev = {
  id: string;
  title: string;
  date: Date;
  location: string | null;
  faculty: string | null;
  createdById: string | null;
  participations: { status: string }[];
};

const WINDOW_TAG: Record<LcdWindow, { label: (d: Date) => string; className: string }> = {
  upcoming: { label: () => "Sắp diễn ra · chỉ xem", className: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200" },
  open: {
    label: (d) => `Đang xác nhận · hạn ${formatDate(confirmDeadline(d))}`,
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  },
  locked: { label: () => "Đã khoá", className: "bg-muted text-muted-foreground" },
};

function EventList({ events, now, myId, empty }: { events: Ev[]; now: Date; myId: string; empty: string }) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-background p-8 text-center text-muted-foreground">{empty}</div>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {events.map((ev) => {
        const w = lcdWindow(ev.date, now);
        const tag = WINDOW_TAG[w];
        const attended = ev.participations.filter((p) => p.status === "CONFIRMED").length;
        const body = (
          <>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 font-semibold">
                {w === "locked" && <Lock className="size-4 shrink-0 text-muted-foreground" />}
                {ev.title}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" />
                  {formatDateTime(ev.date)}
                </span>
                {ev.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {ev.location}
                  </span>
                )}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Tag tone="blue">{ev.faculty ?? "Toàn trường"}</Tag>
              {ev.createdById === myId && <Tag tone="green">Khoa tự tạo</Tag>}
              <Tag>
                {ev.participations.length} SV khoa đăng ký · {attended} tham gia
              </Tag>
              <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tag.className)}>
                {tag.label(ev.date)}
              </span>
            </div>
          </>
        );
        const cls = "flex flex-col gap-2 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between";
        return (
          <li key={ev.id}>
            {w === "locked" ? (
              <div className={cn(cls, "opacity-75")}>{body}</div>
            ) : (
              <Link href={`/lien-chi/su-kien/${ev.id}`} className={cn(cls, "hover:border-[#0072bc]/50 hover:bg-muted/30")}>
                {body}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
