// Trạng thái tham gia sự kiện (cập nhật 22/11/2026: 3 trạng thái).
// - PENDING   = sinh viên đăng ký tham gia, LCĐ chưa xác nhận -> "Chờ xác nhận".
// - CONFIRMED = LCĐ xác nhận có tham gia (tính điểm xếp loại) -> "Tham gia".
// - REJECTED  = LCĐ xác nhận không tham gia theo thực tế      -> "Không tham gia".
// - LCĐ chốt trạng thái cho sinh viên khoa mình từ lúc sự kiện diễn ra tới hết ngày thứ 7 sau đó;
//   quá hạn thì khoá, chỉ Đoàn trường đổi được.
// File này không đụng CSDL nên dùng được ở cả máy chủ và trình duyệt.
import type { ParticipationStatus } from "@/generated/prisma/enums";

export const CONFIRM_DAYS = 7;

/** Trạng thái lưu trong CSDL được coi là "Tham gia" (tính điểm) */
export const ATTENDED: ParticipationStatus = "CONFIRMED";
/** Chưa được xác nhận Tham gia (Chờ xác nhận + Không tham gia) */
export const NOT_ATTENDED: ParticipationStatus[] = ["PENDING", "REJECTED"];

export const isAttended = (s: ParticipationStatus) => s === "CONFIRMED";
export const attendanceLabel = (s: ParticipationStatus) =>
  s === "CONFIRMED" ? "Tham gia" : s === "REJECTED" ? "Không tham gia" : "Chờ xác nhận";

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
