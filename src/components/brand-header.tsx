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

/** Người phụ trách hiển thị ở chân trang (sđt: chỉ chữ số, dùng cho liên kết gọi điện) */
const CREDITS = [
  { label: "Quản lý", name: "Nguyễn Quốc Dũng", phone: "0946582194" },
  { label: "Thiết kế & lập trình", name: "Nguyễn Đức Sử", phone: "0914566838" },
];

/** 0914566838 → 0914 566 838 cho dễ đọc */
function formatPhone(p: string) {
  return p.length === 10 ? `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : p;
}

export function BrandFooter() {
  return (
    <footer className="bg-[#005a96] px-4 py-5 text-center text-sm text-white/90">
      <p>Văn phòng Đoàn – Hội, tầng 1, nhà Hiệu bộ, trường Đại học Hà Tĩnh</p>
      <div className="mx-auto mt-3 flex max-w-6xl flex-col items-center gap-1 border-t border-white/15 pt-3 text-xs text-white/75 sm:flex-row sm:justify-center sm:gap-6">
        {CREDITS.map((c) => (
          <p key={c.label}>
            {c.label}: <span className="font-semibold text-white/90">{c.name}</span>
            {" · ĐT "}
            <a href={`tel:${c.phone}`} className="underline-offset-2 hover:text-white hover:underline">
              {formatPhone(c.phone)}
            </a>
          </p>
        ))}
      </div>
    </footer>
  );
}
