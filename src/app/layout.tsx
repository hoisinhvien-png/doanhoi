import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import "./globals.css";

// Phông chữ hỗ trợ đầy đủ dấu tiếng Việt
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hệ thống theo dõi hoạt động Đoàn – Hội | Trường ĐH Hà Tĩnh",
  description:
    "Quản lý sự kiện, đăng ký tham gia và đánh giá đoàn viên – Trường Đại học Hà Tĩnh",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
