import { cn } from "cn";

type Status = "PENDING" | "CONFIRMED" | "REJECTED";

const ATTENDED = {
  label: "Tham gia",
  className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
};
const NOT_ATTENDED = {
  label: "Không tham gia",
  className: "bg-muted text-muted-foreground",
};

// Chỉ còn 2 trạng thái hiển thị; REJECTED (dữ liệu cũ) cũng là Không tham gia
const STYLE: Record<Status, { label: string; className: string }> = {
  PENDING: NOT_ATTENDED,
  CONFIRMED: ATTENDED,
  REJECTED: NOT_ATTENDED,
};

export const STATUS_LABEL: Record<Status, string> = {
  PENDING: NOT_ATTENDED.label,
  CONFIRMED: ATTENDED.label,
  REJECTED: NOT_ATTENDED.label,
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
