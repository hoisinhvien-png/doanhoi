import { AppShell } from "@/components/app-shell";

// Trang phụ thuộc người đăng nhập nên không tạo sẵn trước
export const instant = false;

export default function AdminLayout({ children }: LayoutProps<"/quan-tri">) {
  return <AppShell role="ADMIN">{children}</AppShell>;
}
