"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn } from "lucide-react";
import { cn } from "cn";

// Menu trang công khai. Hoạt động -> khối sự kiện ở trang chủ; Giới thiệu -> chân trang.
const MENU = [
  { href: "/", label: "Trang chủ" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/#hoat-dong", label: "Hoạt động" },
  { href: "/#gioi-thieu", label: "Giới thiệu" },
];

/** Thanh đầu trang CÔNG KHAI (riêng, không đụng header xanh của các trang sau đăng nhập). */
export function PublicHeader() {
  const pathname = usePathname();
  const active = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#0072bc] text-sm font-extrabold tracking-wide text-white">
            HTU
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-bold sm:text-[17px]">
              ĐOÀN THANH NIÊN – HỘI SINH VIÊN
            </span>
            <span className="block text-xs text-muted-foreground sm:text-sm">
              Trường Đại học Hà Tĩnh
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                active(m.href)
                  ? "bg-[#0072bc]/10 text-[#0072bc] dark:bg-sky-400/10 dark:text-sky-300"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {m.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/dang-nhap"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0072bc] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#005a96]"
        >
          <LogIn className="size-4" />
          <span className="hidden sm:inline">Đăng nhập</span>
        </Link>
      </div>
    </header>
  );
}
