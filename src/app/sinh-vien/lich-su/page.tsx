import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

export default async function StudentHistoryPage() {
  const me = await requireRole("STUDENT");
  const rows = await prisma.eventParticipation.findMany({
    where: { userId: me.id },
    orderBy: { event: { date: "desc" } },
    include: { event: { select: { title: true, date: true, location: true } } },
  });
  const confirmed = rows.filter((r) => r.status === "CONFIRMED").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Lịch sử tham gia</h1>
        <p className="text-muted-foreground">
          {rows.length} lượt đăng ký · {confirmed} lượt tham gia
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-background p-10 text-center text-muted-foreground">
          Bạn chưa đăng ký sự kiện nào.
        </div>
      ) : (
        <ul className="flex flex-col divide-y rounded-xl border bg-background">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-medium">{r.event.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(r.event.date)}
                  {r.event.location ? ` · ${r.event.location}` : ""}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
