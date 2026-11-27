import { connection } from "next/server";
import { CalendarDays, MapPin } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import {
  FeatureCard,
  NewsCard,
  NewsPageHead,
  SectionHeading,
  SideCard,
} from "@/components/article-ui";
import { getHomeArticles, getUpcomingPublicEvents } from "@/lib/articles";
import { formatDateTime } from "@/lib/format";

export const instant = false;

export default async function Home() {
  await connection();
  const [{ featured, rest }, events] = await Promise.all([
    getHomeArticles(),
    getUpcomingPublicEvents(),
  ]);
  const side = rest.slice(0, 2);
  const grid = rest.slice(2, 5);

  return (
    <PublicShell>
      <NewsPageHead />

      {featured ? (
        <>
          {/* Tin nổi bật (trái) + 2 tin (phải) */}
          <div className="grid gap-5 md:grid-cols-[1.25fr_1fr]">
            <FeatureCard a={featured} />
            {side.length > 0 && (
              <div className="grid content-start gap-5">
                {side.map((a) => (
                  <SideCard key={a.id} a={a} />
                ))}
              </div>
            )}
          </div>

          {/* Thêm vài tin mới */}
          {grid.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((a) => (
                <NewsCard key={a.id} a={a} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-muted-foreground">
          Chưa có tin tức nào được đăng.
        </div>
      )}

      {/* Hoạt động sắp tới (sự kiện toàn trường) */}
      {events.length > 0 && (
        <section id="hoat-dong" className="flex scroll-mt-20 flex-col gap-4">
          <SectionHeading href="/tin-tuc" hrefLabel="Tất cả tin">
            Hoạt động sắp tới
          </SectionHeading>
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-center gap-4 border-b p-4 last:border-b-0">
                <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-sky-100 text-[#0072bc] dark:bg-sky-900/30 dark:text-sky-300">
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
                <span className="hidden shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 sm:inline dark:bg-amber-900/40 dark:text-amber-300">
                  Toàn trường
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </PublicShell>
  );
}
