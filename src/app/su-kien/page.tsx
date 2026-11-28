import { connection } from "next/server";
import { CalendarDays, MapPin } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { getPublicEventLists, type PublicEvent } from "@/lib/articles";
import { formatDateTime } from "@/lib/format";

export const instant = false;

/** Một dòng sự kiện (dùng chung cho mục sắp tới và đã diễn ra) */
function EventRow({ ev, past }: { ev: PublicEvent; past?: boolean }) {
  return (
    <div className="flex items-center gap-4 border-b p-4 last:border-b-0">
      <div
        className={`grid size-14 shrink-0 place-items-center rounded-xl ${
          past
            ? "bg-muted text-muted-foreground"
            : "bg-sky-100 text-[#0072bc] dark:bg-sky-900/30 dark:text-sky-300"
        }`}
      >
        <CalendarDays className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{ev.title}</p>
        <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
          <span>{formatDateTime(ev.date)}</span>
          {ev.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {ev.location}
            </span>
          )}
        </p>
      </div>
      <span
        className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold sm:inline ${
          past
            ? "bg-muted text-muted-foreground"
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
        }`}
      >
        {past ? "Đã diễn ra" : "Sắp tới"}
      </span>
    </div>
  );
}

function EventSection({
  title,
  bar,
  events,
  past,
  empty,
}: {
  title: string;
  bar: string;
  events: PublicEvent[];
  past?: boolean;
  empty: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2.5 text-lg font-bold sm:text-xl">
        <span className={`h-5 w-1.5 rounded-full ${bar}`} />
        {title}
      </h2>
      {events.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          {events.map((ev) => (
            <EventRow key={ev.id} ev={ev} past={past} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">
          {empty}
        </div>
      )}
    </section>
  );
}

export default async function EventsPage() {
  await connection();
  const { upcoming, past } = await getPublicEventLists(5);

  return (
    <PublicShell>
      <div className="flex flex-col gap-1">
        <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#0072bc] dark:text-sky-300">
          Bản tin Đoàn – Hội
        </div>
        <h1 className="text-2xl font-extrabold text-[#00487a] sm:text-3xl dark:text-sky-100">
          Sự kiện
        </h1>
        <p className="text-sm text-muted-foreground sm:text-[15px]">
          Các hoạt động toàn trường của tuổi trẻ Trường Đại học Hà Tĩnh.
        </p>
      </div>

      <EventSection
        title="Sự kiện sắp tới"
        bar="bg-amber-400"
        events={upcoming}
        empty="Chưa có sự kiện sắp tới."
      />

      <EventSection
        title="Sự kiện đã diễn ra"
        bar="bg-[#0072bc]"
        events={past}
        past
        empty="Chưa có sự kiện đã diễn ra."
      />
    </PublicShell>
  );
}
