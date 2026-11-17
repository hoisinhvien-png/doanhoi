import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Đăng nhập | Đoàn – Hội HTU" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Đăng nhập"
      subtitle="Hệ thống theo dõi hoạt động Đoàn – Hội"
    >
      <LoginForm />
    </AuthCard>
  );
}
