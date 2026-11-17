import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { reviewParticipations } from "@/app/actions/participations";
import { cn } from "cn";
import { ReviewTable } from "./review-table";

const TABS = [
  { key: "PENDING", label: "Chờ duyệt" },
  { key: "CONFIRMED", label: "Đã duyệt" },
  { key: "REJECTED", label: "Từ chối" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default async function ReviewPage({ searchParams }: PageProps<"/lien-chi/duyet">) {
  const me = await requireRole("LCD");
  const sp = await searchParams;
  const tab: TabKey = TABS.some((t) => t.key === sp.tt) ? (sp.tt as TabKey) : "PENDING";
  const eventId = typeof sp.sk === "string" && sp.sk ? sp.sk : undefined;

  if (!me.faculty) {
    return (
      <p className="text-muted-foreground">
        Tài khoản chưa được gán khoa. Liên hệ Đoàn trường để được gán khoa quản lý.
      </p>
    );
  }

  const inFaculty = { user: { faculty: me.faculty } };
  const [rows, counts, events] = await Promise.all([
    prisma.eventParticipation.findMany({
      where: { ...inFaculty, status: tab, ...(eventId ? { eventId } : {}) },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { name: true, studentId: true, className: true } },
        event: { select: { title: true, date: true } },
      },
    }),
    prisma.eventParticipation.groupBy({
      by: ["status"],
      where: { ...inFaculty, ...(eventId ? { eventId } : {}) },
      _count: true,
    }),
    // Sự kiện có sinh viên khoa mình đăng ký (cho ô lọc)
    prisma.event.findMany({
      where: { participations: { some: inFaculty } },
      orderBy: { date: "desc" },
      select: { id: true, title: true },
    }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const href = (t: string) =>
    `/lien-chi/duyet?tt=${t}${eventId ? `&sk=${eventId}` : ""}`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Duyệt đăng ký</h1>
        <p className="text-muted-foreground">Sinh viên khoa {me.faculty}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={href(t.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                tab === t.key ? "bg-background shadow-sm" : "text-muted-foreground"
              )}
            >
              {t.label} ({countOf(t.key)})
            </Link>
          ))}
        </div>
        <form className="flex gap-2" action="/lien-chi/duyet">
          <input type="hidden" name="tt" value={tab} />
          <select
            name="sk"
            defaultValue={eventId ?? ""}
            className="h-9 max-w-64 rounded-lg border border-input bg-background px-2 text-sm"
          >
            <option value="">Tất cả sự kiện</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
          <button type="submit" className="h-9 rounded-lg border px-3 text-sm hover:bg-muted">
            Lọc
          </button>
        </form>
      </div>

      <ReviewTable
        key={`${tab}-${eventId ?? ""}`}
        tab={tab}
        rows={rows.map((r) => ({
          id: r.id,
          studentId: r.user.studentId ?? "",
          name: r.user.name,
          className: r.user.className ?? "",
          eventTitle: r.event.title,
          eventDate: r.event.date.toISOString(),
          createdAt: r.createdAt.toISOString(),
        }))}
        approve={reviewParticipations.bind(null, "CONFIRMED")}
        reject={reviewParticipations.bind(null, "REJECTED")}
        reset={reviewParticipations.bind(null, "PENDING")}
      />
    </div>
  );
}
