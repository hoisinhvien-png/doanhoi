import { cn } from "cn";

type Status = "PENDING" | "CONFIRMED" | "REJECTED";

// 3 trạng thái:
// - PENDING   = sinh viên đã đăng ký, LCĐ chưa xác nhận -> "Chờ xác nhận"
// - CONFIRMED = LCĐ xác nhận có tham gia (tính điểm)     -> "Tham gia"
// - REJECTED  = LCĐ xác nhận không tham gia theo thực tế  -> "Không tham gia"
const STYLE: Record<Status, { label: string; className: string }> = {
  PENDING: {
    label: "Chờ xác nhận",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  },
  CONFIRMED: {
    label: "Tham gia",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  REJECTED: {
    label: "Không tham gia",
    className: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  },
};

export const STATUS_LABEL: Record<Status, string> = {
  PENDING: STYLE.PENDING.label,
  CONFIRMED: STYLE.CONFIRMED.label,
  REJECTED: STYLE.REJECTED.label,
};

export function StatusBadge({ status }: { status: Status }) {
  const s = STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        s.className
      )}
    >
      {s.label}
    </span>
  );
}

/** Nhãn nhỏ trung tính, ví dụ "Toàn trường", "Đã đóng đăng ký" */
export function Tag({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "blue" | "green";
}) {
  const toneClass = {
    blue: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
    green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClass
      )}
    >
      {children}
    </span>
  );
}
