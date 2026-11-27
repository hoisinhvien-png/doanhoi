import Link from "next/link";
import { LogIn } from "lucide-react";
import { BrandFooter, BrandHeader } from "@/components/brand-header";

/** Khung trang công khai (trang chủ, tin tức): đầu trang có nút Đăng nhập, chân trang chung. */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-950 dark:via-background dark:to-background">
      <BrandHeader
        sticky
        right={
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/tin-tuc"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white/90 transition-colors hover:bg-white/15"
            >
              Tin tức
            </Link>
            <Link
              href="/dang-nhap"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/25"
            >
              <LogIn className="size-4" />
              <span className="hidden sm:inline">Đăng nhập</span>
            </Link>
          </nav>
        }
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-8 sm:py-10">
        {children}
      </main>
      <BrandFooter />
    </div>
  );
}
