import Link from "next/link";
import { ExternalLink, FilePlus2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { formatDate } from "@/lib/format";
import { articleDate } from "@/lib/articles";
import { togglePin, togglePublish } from "@/app/actions/articles";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tag } from "@/components/status-badge";

export default async function AdminArticlesPage() {
  await requireRole("ADMIN");
  const articles = await prisma.article.findMany({
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      pinned: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tin tức</h1>
          <p className="text-muted-foreground">{articles.length} bài</p>
        </div>
        <Link href="/quan-tri/tin-tuc/moi" className={buttonVariants({ className: "h-10 px-4" })}>
          <FilePlus2 className="size-4" />
          Thêm tin
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-background p-10 text-center text-muted-foreground">
          Chưa có tin nào. Bấm “Thêm tin” để soạn bài đầu tiên.
        </div>
      ) : (
        <div className="grid gap-3">
          {articles.map((a) => {
            const published = a.status === "PUBLISHED";
            return (
              <div
                key={a.id}
                className="flex flex-col gap-3 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    href={`/quan-tri/tin-tuc/${a.id}`}
                    className="font-semibold hover:underline"
                  >
                    {a.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {published ? (
                      <Tag tone="green">Đã đăng</Tag>
                    ) : (
                      <Tag>Nháp</Tag>
                    )}
                    {a.pinned && <Tag tone="blue">Nổi bật</Tag>}
                    {a.category && <Tag>{a.category}</Tag>}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(articleDate(a))}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <form action={togglePin.bind(null, a.id)}>
                    <Button type="submit" variant="outline" size="sm">
                      {a.pinned ? "Bỏ ghim" : "Ghim"}
                    </Button>
                  </form>
                  <form action={togglePublish.bind(null, a.id)}>
                    <Button type="submit" variant="outline" size="sm">
                      {published ? "Chuyển nháp" : "Đăng"}
                    </Button>
                  </form>
                  {published && (
                    <Link
                      href={`/tin-tuc/${a.id}`}
                      target="_blank"
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      <ExternalLink className="size-4" />
                      Xem
                    </Link>
                  )}
                  <Link
                    href={`/quan-tri/tin-tuc/${a.id}`}
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    Sửa
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
