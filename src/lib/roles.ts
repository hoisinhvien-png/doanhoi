// Thông tin dùng chung về 3 vai trò: trang chủ của từng vai trò, tên hiển thị, menu.
// File này không đụng tới cơ sở dữ liệu nên dùng được cả trong proxy.ts.

export type RoleName = "ADMIN" | "LCD" | "STUDENT";

export const ROLE_HOME: Record<RoleName, string> = {
  ADMIN: "/quan-tri",
  LCD: "/lien-chi",
  STUDENT: "/sinh-vien",
};

export const ROLE_LABEL: Record<RoleName, string> = {
  ADMIN: "Đoàn trường",
  LCD: "Liên chi Đoàn khoa",
  STUDENT: "Sinh viên",
};

export type IconName =
  | "layout-dashboard"
  | "calendar"
  | "users"
  | "award"
  | "file-spreadsheet"
  | "check-square"
  | "history"
  | "user"
  | "key-round";

export type MenuItem = { href: string; label: string; icon: IconName };

// Menu bên trái của từng vai trò. Các trang chưa làm sẽ thêm dần ở Bước 4-6.
export const ROLE_MENU: Record<RoleName, MenuItem[]> = {
  ADMIN: [
    { href: "/quan-tri", label: "Tổng quan", icon: "layout-dashboard" },
    { href: "/quan-tri/su-kien", label: "Sự kiện", icon: "calendar" },
    { href: "/quan-tri/sinh-vien", label: "Sinh viên", icon: "users" },
    { href: "/quan-tri/xep-loai", label: "Đánh giá xếp loại", icon: "award" },
    { href: "/quan-tri/bao-cao", label: "Xuất báo cáo", icon: "file-spreadsheet" },
    { href: "/quan-tri/tai-khoan", label: "Tài khoản LCĐ", icon: "key-round" },
  ],
  LCD: [
    { href: "/lien-chi", label: "Tổng quan khoa", icon: "layout-dashboard" },
    { href: "/lien-chi/su-kien", label: "Các sự kiện", icon: "calendar" },
    { href: "/lien-chi/sinh-vien", label: "Sinh viên khoa", icon: "users" },
    { href: "/lien-chi/bao-cao", label: "Xuất Excel", icon: "file-spreadsheet" },
  ],
  STUDENT: [
    { href: "/sinh-vien", label: "Sự kiện & xếp loại", icon: "calendar" },
    { href: "/sinh-vien/lich-su", label: "Lịch sử tham gia", icon: "history" },
    { href: "/sinh-vien/ho-so", label: "Hồ sơ", icon: "user" },
  ],
};

/** Vai trò nào được vào đường dẫn nào */
export function roleForPath(path: string): RoleName | null {
  for (const role of Object.keys(ROLE_HOME) as RoleName[]) {
    const home = ROLE_HOME[role];
    if (path === home || path.startsWith(home + "/")) return role;
  }
  return null;
}
