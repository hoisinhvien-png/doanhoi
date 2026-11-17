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
