import { PublicHeader } from "@/components/public-header";

/** Khung trang CÔNG KHAI (trang chủ, tin tức): header xanh có menu + chân trang xanh riêng.
 *  Không dùng BrandHeader/BrandFooter của các trang sau đăng nhập. */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#eef3f9] dark:bg-background">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-7 px-4 py-7 sm:py-9">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}

function PublicFooter() {
  return (
    <footer id="lien-he" className="bg-[#00487a] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 px-4 py-7 text-center sm:flex-row sm:text-left">
        <div>
          <p className="font-bold">ĐOÀN THANH NIÊN – HỘI SINH VIÊN, Trường Đại học Hà Tĩnh</p>
          <p className="mt-1 text-sm text-white/80">
            VP Đoàn – Hội: tầng 1, nhà Hiệu bộ, trường Đại học Hà Tĩnh
          </p>
        </div>
        <div className="text-sm text-white/85 sm:text-right">
          <p>
            Thiết kế hệ thống: <b>Nguyễn Quốc Dũng</b> · ĐT{" "}
            <a href="tel:0946582194" className="font-semibold underline-offset-2 hover:underline">
              0946 582 194
            </a>
          </p>
          <p>
            Thiết kế giao diện và Lập trình: <b>Nguyễn Đức Sử</b> · ĐT{" "}
            <a href="tel:0914566838" className="font-semibold underline-offset-2 hover:underline">
              0914 566 838
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
