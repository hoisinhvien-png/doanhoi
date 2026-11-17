import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/** Khung chung cho trang đăng nhập và đổi mật khẩu */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <header className="bg-[#0b4f9c]">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-3">
          <Link href="/">
            <Image
              src="/logo-htu.png"
              alt="Logo Trường Đại học Hà Tĩnh"
              width={495}
              height={90}
              priority
              className="h-11 w-auto"
            />
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
        <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
