import { cn } from "cn";

type Status = "PENDING" | "CONFIRMED" | "REJECTED";

const STYLE: Record<Status, { label: string; className: string }> = {
  PENDING: {
    label: "Chờ duyệt",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  },
  CONFIRMED: {
    label: "Đã duyệt",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  REJECTED: {
    label: "Từ chối",
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
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
export function Tag({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "blue" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "blue"
          ? "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200"
          : "bg-muted text-muted-foreground"
      )}
    >
      {children}
    </span>
  );
}
