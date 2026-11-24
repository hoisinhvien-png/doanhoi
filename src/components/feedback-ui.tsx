import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "cn";
import { formatDateTime } from "@/lib/format";
import { CATEGORY_LABEL, STATUS_META, type FeedbackCategory, type FeedbackStatus } from "@/lib/feedback";

export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  const s = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", s.className)}>
      {s.label}
    </span>
  );
}

export function CategoryTag({ category }: { category: FeedbackCategory }) {
  const complaint = category === "COMPLAINT";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        complaint
          ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200"
          : "bg-muted text-muted-foreground"
      )}
    >
      {CATEGORY_LABEL[category]}
    </span>
  );
}

/** Một dòng trong danh sách ý kiến (dùng chung cho SV, LCĐ, Đoàn trường) */
export function FeedbackRow({
  href,
  title,
  category,
  status,
  meta,
  at,
}: {
  href: string;
  title: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  meta: string;
  at: Date;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-xl border bg-background p-4 hover:border-[#0072bc]/50 hover:bg-muted/30"
    >
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <CategoryTag category={category} />
          <FeedbackStatusBadge status={status} />
        </div>
        <p className="truncate font-medium">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {meta}
          {meta ? " · " : ""}
          {formatDateTime(at)}
        </p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}
