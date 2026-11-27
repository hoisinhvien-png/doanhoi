import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { CategoryCover } from "@/components/article-ui";
import { articleDate, getPublicArticle } from "@/lib/articles";
import { formatDate } from "@/lib/format";

export const instant = false;

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const a = await getPublicArticle(id);
  if (!a) notFound();

  return (
    <PublicShell>
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Link
          href="/tin-tuc"
          className="inline-flex w-max items-center gap-1.5 text-sm font-bold text-[#0072bc] hover:underline dark:text-sky-300"
        >
          <ArrowLeft className="size-4" />
          Quay lại tin tức
        </Link>

        {a.category && (
          <span className="w-max rounded-full bg-[#0072bc]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0072bc] dark:bg-sky-400/10 dark:text-sky-300">
            {a.category}
          </span>
        )}

        <h1 className="text-2xl font-extrabold leading-snug sm:text-3xl">{a.title}</h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {formatDate(articleDate(a))}
          </span>
          {a.author?.name && <span>· Đăng bởi {a.author.name}</span>}
        </div>

        <CategoryCover a={a} big className="aspect-[16/8] w-full rounded-2xl border" />

        {a.summary && <p className="text-lg font-semibold">{a.summary}</p>}

        <div className="whitespace-pre-wrap text-[15px] leading-relaxed sm:text-base">
          {a.content}
        </div>
      </article>
    </PublicShell>
  );
}
