import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Heart,
  Megaphone,
  Newspaper,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import { articleDate, type ArticleCard } from "@/lib/articles";
import { CoverImage } from "@/components/cover-image";

// ===== Chuyên mục: màu nền ảnh + màu nhãn + icon =====
type CatStyle = { grad: string; icon: LucideIcon };
const CAT: Record<string, CatStyle> = {
  "Hoạt động": { grad: "from-[#0072bc] to-[#00487a]", icon: Users },
  "Tình nguyện": { grad: "from-emerald-600 to-teal-700", icon: Heart },
  "Học tập": { grad: "from-violet-600 to-indigo-800", icon: GraduationCap },
  "Thể thao": { grad: "from-cyan-500 to-sky-700", icon: Trophy },
  "Thông báo": { grad: "from-amber-500 to-orange-700", icon: Megaphone },
};
const DEFAULT_CAT: CatStyle = { grad: "from-[#0072bc] to-[#00487a]", icon: Newspaper };
const catOf = (c: string | null | undefined) => (c && CAT[c]) || DEFAULT_CAT;

/** Danh sách chuyên mục dùng cho ô chọn ở form quản trị */
export const CATEGORIES = ["Hoạt động", "Tình nguyện", "Học tập", "Thể thao", "Thông báo"];

/** Ảnh bìa theo chuyên mục: có link ảnh thì hiện ảnh (tải lỗi thì tự rơi về nền gradient);
 *  không có link thì nền gradient + icon + "Ảnh minh hoạ". */
export function CategoryCover({
  a,
  className,
  big,
}: {
  a: ArticleCard;
  className?: string;
  big?: boolean;
}) {
  const c = catOf(a.category);
  const fallback = (
    <div className={`relative grid h-full w-full place-items-center bg-gradient-to-br ${c.grad}`}>
      {/* Logo trường làm ảnh đại diện mặc định (thay cho ô chữ) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-htu-tron-trang.png"
        alt="Logo Trường Đại học Hà Tĩnh"
        className={`${big ? "size-20 sm:size-24" : "size-12"} opacity-95 drop-shadow`}
        loading="lazy"
      />
      {a.category && (
        <span className="absolute left-3 top-3 rounded-full bg-black/30 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {a.category}
        </span>
      )}
    </div>
  );
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {a.coverImage ? (
        <CoverImage src={a.coverImage} alt={a.title} category={a.category} fallback={fallback} />
      ) : (
        fallback
      )}
    </div>
  );
}

/** Nhãn khu "Bản tin Đoàn – Hội / Tin tức & Thông báo" */
export function NewsPageHead() {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#0072bc] dark:text-sky-300">
        Bản tin Đoàn – Hội
      </div>
      <h1 className="text-2xl font-extrabold text-[#00487a] sm:text-3xl dark:text-sky-100">
        Tin tức &amp; Thông báo
      </h1>
      <p className="text-sm text-muted-foreground sm:text-[15px]">
        Hoạt động, phong trào và thông báo mới nhất của tuổi trẻ Trường Đại học Hà Tĩnh.
      </p>
    </div>
  );
}

/** Tiêu đề khu có thanh gạch vàng (dùng cho "Hoạt động sắp tới") */
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

/** Dải ngăn khu "Tin trước đó" */
export function SectionSep({ children, href }: { children: React.ReactNode; href?: string }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="whitespace-nowrap text-lg font-bold">{children}</h2>
      <span className="h-px flex-1 bg-border" />
      {href && (
        <Link href={href} className="shrink-0 text-sm font-bold text-[#0072bc] dark:text-sky-300">
          Xem tất cả →
        </Link>
      )}
    </div>
  );
}

const Meta = ({ a, author }: { a: ArticleCard; author?: boolean }) => (
  <div className="text-xs font-medium text-muted-foreground">
    {formatDate(articleDate(a))}
    {author && " · Đoàn trường"}
  </div>
);

/** Thẻ TIN NỔI BẬT (lớn, bên trái) */
export function FeatureCard({ a }: { a: ArticleCard }) {
  return (
    <Link
      href={`/tin-tuc/${a.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <CategoryCover a={a} big className="aspect-[21/10] w-full" />
      <div className="flex flex-1 flex-col gap-2.5 p-5 sm:p-6">
        <Meta a={a} author />
        <h3 className="text-xl font-bold leading-snug group-hover:text-[#0072bc] sm:text-2xl dark:group-hover:text-sky-300">
          {a.title}
        </h3>
        {a.summary && <p className="text-sm text-muted-foreground sm:text-[15px]">{a.summary}</p>}
        <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-[#0072bc] dark:text-sky-300">
          Đọc tiếp <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

/** Thẻ nhỏ nằm NGANG (cột bên phải tin nổi bật) */
export function SideCard({ a }: { a: ArticleCard }) {
  return (
    <Link
      href={`/tin-tuc/${a.id}`}
      className="group flex overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <CategoryCover a={a} className="w-28 shrink-0" />
      <div className="flex flex-1 flex-col justify-center gap-1.5 p-3.5">
        <Meta a={a} />
        <h3 className="line-clamp-3 text-[15px] font-semibold leading-snug group-hover:text-[#0072bc] dark:group-hover:text-sky-300">
          {a.title}
        </h3>
      </div>
    </Link>
  );
}

/** Thẻ tin trong lưới */
export function NewsCard({ a }: { a: ArticleCard }) {
  return (
    <Link
      href={`/tin-tuc/${a.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <CategoryCover a={a} className="aspect-[16/9] w-full" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Meta a={a} />
        <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-[#0072bc] dark:group-hover:text-sky-300">
          {a.title}
        </h3>
        {a.summary && <p className="line-clamp-2 text-sm text-muted-foreground">{a.summary}</p>}
      </div>
    </Link>
  );
}

/** Dòng tin (khu "Tin trước đó") */
export function RowItem({ a }: { a: ArticleCard }) {
  const c = catOf(a.category);
  const Icon = c.icon;
  return (
    <Link
      href={`/tin-tuc/${a.id}`}
      className="flex items-center gap-4 border-b p-3.5 transition-colors last:border-b-0 hover:bg-muted/50"
    >
      <div
        className={`grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${c.grad} text-white`}
      >
        <Icon className="size-5 opacity-70" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-semibold">{a.title}</h4>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {a.category ? `${a.category} · ` : ""}
          {formatDate(articleDate(a))}
        </div>
      </div>
    </Link>
  );
}
