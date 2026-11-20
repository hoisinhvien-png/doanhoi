import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Đăng nhập | Đoàn – Hội HTU" };

export default function LoginPage() {
  return (
    <AuthCard title="Đăng nhập" subtitle="Hệ thống quản lý và theo dõi hoạt động Đoàn TN – Hội SV">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
