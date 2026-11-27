import Link from "next/link";
import { connection } from "next/server";
import { CalendarDays, MapPin } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { CoverImage, NewsCard, SectionHeading } from "@/components/article-ui";
import { articleDate, getHomeArticles, getUpcomingPublicEvents } from "@/lib/articles";
import { formatDate, formatDateTime } from "@/lib/format";

// Trang công khai lấy dữ liệu lúc có request (không prerender tĩnh).
export const instant = false;

export default async function Home() {
  await connection();
  const [{ featured, rest }, events] = await Promise.all([
    getHomeArticles(),
    getUpcomingPublicEvents(),
  ]);

  return (
    <PublicShell>
      {/* Tin nổi bật */}
      {featured ? (
        <Link
          href={`/tin-tuc/${featured.id}`}
          className="group grid overflow-hidden rounded-2xl border border-t-4 border-t-amber-400 bg-card shadow-sm transition hover:shadow-lg md:grid-cols-2"
        >
          <CoverImage
            src={featured.coverImage}
            alt={featured.title}
            className="aspect-[16/10] w-full object-cover md:h-full"
          />
          <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
            <span className="w-max rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              Tin nổi bật
            </span>
            <h1 className="text-xl font-extrabold leading-snug group-hover:text-[#0072bc] sm:text-2xl dark:group-hover:text-sky-300">
              {featured.title}
            </h1>
            {featured.summary && <p className="text-muted-foreground">{featured.summary}</p>}
            <span className="text-sm text-muted-foreground">{formatDate(articleDate(featured))}</span>
          </div>
        </Link>
      ) : (
        <div className="rounded-2xl border border-dashed bg-background p-10 text-center text-muted-foreground">
          Chưa có tin tức nào được đăng.
        </div>
      )}

      {/* Tin mới */}
      {rest.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeading href="/tin-tuc">Tin mới</SectionHeading>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <NewsCard key={a.id} a={a} />
            ))}
          </div>
        </section>
      )}

      {/* Hoạt động sắp tới (sự kiện toàn trường) */}
      {events.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeading>Hoạt động sắp tới</SectionHeading>
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
