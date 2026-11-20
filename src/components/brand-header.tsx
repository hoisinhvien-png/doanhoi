import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "cn";

/** Màu xanh Đoàn Thanh niên dùng chung cho toàn bộ giao diện (cũng là --primary trong globals.css) */
export const DOAN_BLUE = "#0072bc";

/**
 * Đầu trang dùng chung cho MỌI trang (trang chủ, đăng nhập, các trang sau khi đăng nhập):
 * logo trắng của Trường + dòng chữ ĐOÀN THANH NIÊN – HỘI SINH VIÊN.
 * - `right`: nội dung bên phải (VD hộp tên người dùng + Đăng xuất).
 * - `wide`: trải hết chiều ngang (trang có menu bên trái) thay vì khung giữa 6xl.
 * - `sticky`: dính trên cùng khi cuộn.
 */
export function BrandHeader({
  size = "lg",
  right,
  wide = false,
  sticky = false,
}: {
  size?: "lg" | "md";
  right?: ReactNode;
  wide?: boolean;
  sticky?: boolean;
}) {
  const big = size === "lg";
  return (
    <header className={cn("bg-[#0072bc] text-white shadow-sm", sticky && "sticky top-0 z-20")}>
      <div
        className={cn(
          "flex items-center justify-between gap-3 px-4 py-3 sm:gap-4",
          wide ? "w-full" : "mx-auto max-w-6xl"
        )}
      >
        <Link href="/" className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Image
            src="/logo-htu-tron-trang.png"
            alt="Logo Trường Đại học Hà Tĩnh"
            width={512}
            height={512}
            priority
            className={big ? "size-12 shrink-0 sm:size-16" : "size-11 shrink-0"}
          />
          <div className="min-w-0 leading-tight">
            <p className={big ? "text-sm font-bold tracking-wide sm:text-xl" : "text-sm font-bold tracking-wide sm:text-base"}>
              ĐOÀN THANH NIÊN – HỘI SINH VIÊN
            </p>
            <p className="text-xs text-white/80 sm:text-sm">Trường Đại học Hà Tĩnh</p>
          </div>
        </Link>
        {right}
      </div>
    </header>
  );
}

export function BrandFooter() {
  return (
    <footer className="bg-[#005a96] px-4 py-5 text-center text-sm text-white/90">
      Văn phòng Đoàn – Hội, tầng 1, nhà Hiệu bộ, trường Đại học Hà Tĩnh
    </footer>
  );
}
