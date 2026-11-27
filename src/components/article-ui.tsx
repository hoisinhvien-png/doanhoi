import Link from "next/link";
import { formatDate } from "@/lib/format";
import { articleDate, type ArticleCard } from "@/lib/articles";

/** Ảnh bìa: link ngoài thì dùng <img> (khỏi khai báo domain cho next/image); trống thì hiện ô thay thế. */
export function CoverImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} loading="lazy" />;
  }
  return (
    <div
      className={`grid place-items-center bg-sky-100 text-sky-700/70 dark:bg-sky-900/30 dark:text-sky-300/60 ${className ?? ""}`}
    >
      <span className="text-sm font-medium">Ảnh minh hoạ</span>
    </div>
  );
}

/** Tiêu đề khu, có thanh gạch vàng và link "Xem tất cả" tuỳ chọn. */
export function SectionHeading({
  children,
  href,
  hrefLabel,
}: {
  children: React.ReactNode;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="flex items-center gap-2.5 text-lg font-bold sm:text-xl">
        <span className="h-5 w-1.5 rounded-full bg-amber-400" />
        {children}
      </h2>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-semibold text-[#0072bc] hover:underline dark:text-sky-300"
        >
          {hrefLabel ?? "Xem tất cả"} →
        </Link>
      )}
    </div>
  );
}

/** Thẻ tin trong lưới (trang chủ, trang /tin-tuc). */
export function NewsCard({ a }: { a: ArticleCard }) {
  return (
    <Link
      href={`/tin-tuc/${a.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <CoverImage src={a.coverImage} alt={a.title} className="aspect-[16/9] w-full object-cover" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-[#0072bc] dark:group-hover:text-sky-300">
          {a.title}
        </h3>
        {a.summary && <p className="line-clamp-2 text-sm text-muted-foreground">{a.summary}</p>}
        <span className="mt-auto pt-1 text-xs text-muted-foreground">{formatDate(articleDate(a))}</span>
      </div>
    </Link>
  );
}
