// Xử lý ngày giờ theo giờ Việt Nam (UTC+7, không đổi giờ mùa hè).
// Máy chủ Vercel chạy giờ UTC nên phải quy đổi rõ ràng.

const TZ = "Asia/Ho_Chi_Minh";
const OFFSET_MS = 7 * 60 * 60 * 1000;

/** "20/11/2026 08:00" */
export function formatDateTime(d: Date) {
  const time = new Intl.DateTimeFormat("vi-VN", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return `${formatDate(d)} ${time}`;
}

/** "20/11/2026" */
export function formatDate(d: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Giá trị ô <input type="datetime-local"> ("2026-11-20T08:00", giờ VN) -> Date */
export function parseLocalDateTime(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const d = new Date(`${value}:00+07:00`);
  return isNaN(d.getTime()) ? null : d;
}

/** Date -> giá trị cho ô <input type="datetime-local"> theo giờ VN */
export function toLocalInputValue(d: Date) {
  return new Date(d.getTime() + OFFSET_MS).toISOString().slice(0, 16);
}

/** 0 giờ hôm nay theo giờ VN */
export function startOfTodayVN(now: Date) {
  const vn = new Date(now.getTime() + OFFSET_MS);
  vn.setUTCHours(0, 0, 0, 0);
  return new Date(vn.getTime() - OFFSET_MS);
}
