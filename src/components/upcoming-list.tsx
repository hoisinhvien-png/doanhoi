import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import { Tag } from "@/components/status-badge";

type Ev = {
  id: string;
  title: string;
  date: Date;
  location: string | null;
  faculty: string | null;
  registrationOpen: boolean;
  _count: { participations: number };
};

/** Danh sách sự kiện sắp diễn ra */
export function UpcomingList({ events, linkBase }: { events: Ev[]; linkBase?: string }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-background p-4">
      <h2 className="font-semibold">Sự kiện sắp diễn ra</h2>
      {events.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Chưa có sự kiện sắp tới.</p>
      ) : (
        <ul className="flex flex-col divide-y">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                {linkBase ? (
                  <Link href={`${linkBase}/${e.id}`} className="font-medium hover:underline">{e.title}</Link>
                ) : (
                  <p className="font-medium">{e.title}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(e.date)}
                  {e.location ? ` · ${e.location}` : ""} · {e._count.participations} lượt đăng ký
                </p>
              </div>
              <div className="flex gap-1.5">
                <Tag tone="blue">{e.faculty ?? "Toàn trường"}</Tag>
                {!e.registrationOpen && <Tag>Đã đóng đăng ký</Tag>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
