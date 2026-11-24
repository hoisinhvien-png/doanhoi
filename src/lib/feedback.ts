// Nhãn và quy ước cho kênh Ý kiến & Phản hồi (Bổ sung 22/11/2026).
// File này không đụng CSDL nên dùng được ở cả máy chủ và trình duyệt.
import type { RoleName } from "./roles";

export type FeedbackCategory = "SUGGESTION" | "COMPLAINT" | "QUESTION" | "OTHER";
export type FeedbackStatus = "NEW" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";
export type FeedbackRecipient = "DOAN_TRUONG" | "LIEN_CHI_DOAN";
export type FeedbackSatisfaction = "LIKE" | "UNLIKE";

export const RECIPIENT_LABEL: Record<FeedbackRecipient, string> = {
  DOAN_TRUONG: "Đoàn trường",
  LIEN_CHI_DOAN: "Liên chi Đoàn khoa",
};

export const RECIPIENT_ORDER: FeedbackRecipient[] = ["LIEN_CHI_DOAN", "DOAN_TRUONG"];

export function isRecipient(v: string): v is FeedbackRecipient {
  return (RECIPIENT_ORDER as string[]).includes(v);
}

export const SATISFACTION_LABEL: Record<FeedbackSatisfaction, string> = {
  LIKE: "Hài lòng",
  UNLIKE: "Chưa hài lòng",
};

export const CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  SUGGESTION: "Góp ý hoạt động",
  COMPLAINT: "Khiếu nại",
  QUESTION: "Câu hỏi",
  OTHER: "Khác",
};

export const CATEGORY_ORDER: FeedbackCategory[] = ["SUGGESTION", "COMPLAINT", "QUESTION", "OTHER"];

export function isCategory(v: string): v is FeedbackCategory {
  return (CATEGORY_ORDER as string[]).includes(v);
}

export const STATUS_META: Record<FeedbackStatus, { label: string; className: string }> = {
  NEW: { label: "Mới", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200" },
  IN_PROGRESS: { label: "Đang xử lý", className: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200" },
  ANSWERED: { label: "Đã phản hồi", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" },
  CLOSED: { label: "Đã đóng", className: "bg-muted text-muted-foreground" },
};

/** Trạng thái cán bộ (LCĐ/Đoàn trường) còn phải xử lý */
export const STAFF_OPEN: FeedbackStatus[] = ["NEW", "IN_PROGRESS"];

export const ROLE_SENDER_LABEL: Record<RoleName, string> = {
  ADMIN: "Đoàn trường",
  LCD: "Liên chi Đoàn",
  STUDENT: "Sinh viên",
};
