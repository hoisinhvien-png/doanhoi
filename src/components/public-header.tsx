"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn } from "lucide-react";
import { cn } from "cn";

// Menu công khai. Sự kiện -> khối Hoạt động sắp tới ở trang chủ; Liên hệ -> chân trang.
const MENU = [
  { href: "/", label: "Trang chủ" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/#hoat-dong", label: "Sự kiện" },
  { href: "/#lien-he", label: "Liên hệ" },
];

/** Thanh đầu trang CÔNG KHAI (xanh đậm, có menu) — logo và cỡ chữ giống header trang trong. */
export function PublicHeader() {
  const pathname = usePathname();
  const active = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-30 bg-[#00487a] text-white shadow-md">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Image
            src="/logo-htu-tron-trang.png"
            alt="Logo Trường Đại học Hà Tĩnh"
            width={512}
            height={512}
            priority
            className="size-12 shrink-0 sm:size-16"
          />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-bold tracking-wide sm:text-xl">
              ĐOÀN THANH NIÊN – HỘI SINH VIÊN
            </span>
            <span className="block text-xs text-white/85 sm:text-base">Trường Đại học Hà Tĩnh</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                active(m.href) ? "bg-white/15 text-white" : "text-white/90 hover:bg-white/10"
              )}
            >
              {m.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/dang-nhap"
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#00487a] shadow-sm transition-colors hover:bg-sky-50"
        >
          <LogIn className="size-4" />
          <span className="hidden sm:inline">Đăng nhập</span>
        </Link>
      </div>
    </header>
  );
}
