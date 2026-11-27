import Link from "next/link";
import { connection } from "next/server";
import { PublicShell } from "@/components/public-shell";
import { NewsCard, SectionHeading } from "@/components/article-ui";
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

  return (
    <PublicShell>
      <section className="flex flex-col gap-5">
        <SectionHeading>Tin tức</SectionHeading>

        {total === 0 ? (
          <div className="rounded-2xl border border-dashed bg-background p-10 text-center text-muted-foreground">
            Chưa có tin tức nào được đăng.
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => (
                <NewsCard key={a.id} a={a} />
              ))}
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
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
          </>
        )}
      </section>
    </PublicShell>
  );
}
