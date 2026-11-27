import Link from "next/link";
import { connection } from "next/server";
import { PublicShell } from "@/components/public-shell";
import {
  FeatureCard,
  NewsCard,
  NewsPageHead,
  RowItem,
  SectionSep,
  SideCard,
} from "@/components/article-ui";
import { buttonVariants } from "@/components/ui/button";
import { getPublishedPage } from "@/lib/articles";

export const instant = false;

export default async function TinTucPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connection();
  const sp = await searchParams;
  const { items, total, page, pages } = await getPublishedPage(Number(sp.page) || 1);

  const featured = items[0];
  const side = items.slice(1, 3);
  const grid = items.slice(3, 6);
  const rows = items.slice(6);

  return (
    <PublicShell>
      <NewsPageHead />

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-muted-foreground">
          Chưa có tin tức nào được đăng.
        </div>
      ) : page === 1 ? (
        <>
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

          {grid.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((a) => (
                <NewsCard key={a.id} a={a} />
              ))}
            </div>
          )}

          {rows.length > 0 && (
            <section className="flex flex-col gap-4">
              <SectionSep>Tin trước đó</SectionSep>
              <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                {rows.map((a) => (
                  <RowItem key={a.id} a={a} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <NewsCard key={a.id} a={a} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <Link
            href={`/tin-tuc?page=${page - 1}`}
            aria-disabled={page <= 1}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: page <= 1 ? "pointer-events-none opacity-50" : "",
            })}
          >
            ← Trước
          </Link>
          <span className="text-sm text-muted-foreground">
            Trang {page}/{pages}
          </span>
          <Link
            href={`/tin-tuc?page=${page + 1}`}
            aria-disabled={page >= pages}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: page >= pages ? "pointer-events-none opacity-50" : "",
            })}
          >
            Sau →
          </Link>
        </div>
      )}
    </PublicShell>
  );
}
