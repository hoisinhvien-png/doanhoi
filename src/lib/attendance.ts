// Trạng thái tham gia sự kiện (Bổ sung 20/11/2026).
// - Chỉ có 2 trạng thái: "Tham gia" và "Không tham gia".
// - Sinh viên đăng ký xong mặc định là "Không tham gia".
// - LCĐ xác nhận "Tham gia" cho sinh viên khoa mình từ lúc sự kiện diễn ra tới hết ngày thứ 7 sau đó;
//   quá hạn thì khoá, chỉ Đoàn trường đổi được.
// File này không đụng CSDL nên dùng được ở cả máy chủ và trình duyệt.
import type { ParticipationStatus } from "@/generated/prisma/enums";

export const CONFIRM_DAYS = 7;

/** Trạng thái lưu trong CSDL được coi là "Tham gia" */
export const ATTENDED: ParticipationStatus = "CONFIRMED";
/** Các trạng thái được coi là "Không tham gia" (REJECTED là dữ liệu cũ) */
export const NOT_ATTENDED: ParticipationStatus[] = ["PENDING", "REJECTED"];

export const isAttended = (s: ParticipationStatus) => s === "CONFIRMED";
export const attendanceLabel = (s: ParticipationStatus) => (isAttended(s) ? "Tham gia" : "Không tham gia");

const OFFSET_MS = 7 * 3600 * 1000;

/** Hạn LCĐ xác nhận: hết ngày (giờ VN) thứ 7 sau ngày diễn ra sự kiện */
export function confirmDeadline(eventDate: Date) {
  const vn = new Date(eventDate.getTime() + OFFSET_MS);
  vn.setUTCHours(23, 59, 59, 999);
  return new Date(vn.getTime() - OFFSET_MS + CONFIRM_DAYS * 24 * 3600 * 1000);
}

export type LcdWindow = "upcoming" | "open" | "locked";

/** Sự kiện sắp diễn ra (chỉ xem) / đang trong hạn xác nhận / đã khoá */
export function lcdWindow(eventDate: Date, now: Date): LcdWindow {
  if (now < eventDate) return "upcoming";
  return now <= confirmDeadline(eventDate) ? "open" : "locked";
}
