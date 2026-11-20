import Image from "next/image";
import Link from "next/link";

/** Màu xanh Đoàn Thanh niên dùng chung cho đầu trang */
export const DOAN_BLUE = "#0072bc";

/** Đầu trang: logo trắng của Trường + dòng chữ ĐOÀN THANH NIÊN – HỘI SINH VIÊN */
export function BrandHeader({ size = "lg" }: { size?: "lg" | "md" }) {
  const big = size === "lg";
  return (
    <header className="bg-[#0072bc] text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Image
            src="/logo-htu-tron-trang.png"
            alt="Logo Trường Đại học Hà Tĩnh"
            width={512}
            height={512}
            priority
            className={big ? "size-14 shrink-0 sm:size-16" : "size-11 shrink-0"}
          />
          <div className="min-w-0 leading-tight">
            <p className={big ? "text-base font-bold tracking-wide sm:text-xl" : "text-sm font-bold tracking-wide sm:text-base"}>
              ĐOÀN THANH NIÊN – HỘI SINH VIÊN
            </p>
            <p className="text-xs text-white/80 sm:text-sm">Trường Đại học Hà Tĩnh</p>
          </div>
        </Link>
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
