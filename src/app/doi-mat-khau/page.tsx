import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = { title: "Đổi mật khẩu | Đoàn – Hội HTU" };

export default function ChangePasswordPage() {
  return (
    <AuthCard
      title="Đổi mật khẩu"
      subtitle="Lần đầu đăng nhập hoặc vừa được cấp lại mật khẩu thì cần đặt mật khẩu mới trước khi sử dụng."
    >
      <ChangePasswordForm />
    </AuthCard>
  );
}
