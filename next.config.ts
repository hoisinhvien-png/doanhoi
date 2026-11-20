import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Biểu tượng Next.js khi chạy thử: để góc phải cho khỏi che nút
  devIndicators: { position: "bottom-right" },
  cacheComponents: true,
  // Cho phép tải lên file Excel danh sách sinh viên tới 4MB (Vercel giới hạn 4.5MB)
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
  partialPrefetching: true,
  // Trang "Duyệt đăng ký" cũ đã thay bằng "Các sự kiện" (Bổ sung 20/11/2026)
  async redirects() {
    return [{ source: "/lien-chi/duyet", destination: "/lien-chi/su-kien", permanent: false }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
