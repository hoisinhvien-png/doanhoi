import { PublicHeader } from "@/components/public-header";

/** Khung trang CÔNG KHAI (trang chủ, tin tức): header trắng có menu + chân trang riêng.
 *  Không dùng BrandHeader/BrandFooter xanh của các trang sau đăng nhập. */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f4f6f9] dark:bg-background">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:py-10">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}

function PublicFooter() {
  return (
    <footer id="gioi-thieu" className="border-t bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 px-4 py-7 text-center sm:flex-row sm:text-left">
        <div className="text-sm">
          <p className="font-bold">ĐOÀN THANH NIÊN – HỘI SINH VIÊN</p>
          <p className="text-muted-foreground">Trường Đại học Hà Tĩnh</p>
          <p className="text-muted-foreground">
            VP Đoàn – Hội: tầng 1, nhà Hiệu bộ, trường Đại học Hà Tĩnh
          </p>
        </div>
        <div className="text-sm text-muted-foreground sm:text-right">
          <p>
            Thiết kế hệ thống: <b className="text-foreground">Nguyễn Quốc Dũng</b> · ĐT{" "}
            <a
              href="tel:0946582194"
              className="font-semibold text-[#0072bc] dark:text-sky-300"
            >
              0946 582 194
            </a>
          </p>
          <p>
            Thiết kế giao diện và Lập trình: <b className="text-foreground">Nguyễn Đức Sử</b> · ĐT{" "}
            <a
              href="tel:0914566838"
              className="font-semibold text-[#0072bc] dark:text-sky-300"
            >
              0914 566 838
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
