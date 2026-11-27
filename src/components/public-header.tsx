"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LogIn } from "lucide-react";
import { cn } from "cn";

// Menu công khai. Sự kiện -> khối Hoạt động sắp tới ở trang chủ; Liên hệ -> chân trang.
const MENU = [
  { href: "/", label: "Trang chủ" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/#hoat-dong", label: "Sự kiện" },
  { href: "/#lien-he", label: "Liên hệ" },
];

/** Thanh đầu trang CÔNG KHAI (xanh đậm, có menu) — riêng, không đụng header của các trang sau đăng nhập. */
export function PublicHeader() {
  const pathname = usePathname();
  const active = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-30 bg-[#00487a] text-white shadow-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white">
            <GraduationCap className="size-6 text-[#0072bc]" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-extrabold tracking-wide sm:text-[15px]">
              ĐOÀN THANH NIÊN – HỘI SINH VIÊN
            </span>
            <span className="block text-[11px] text-white/80 sm:text-xs">Trường Đại học Hà Tĩnh</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
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
