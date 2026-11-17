import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Aiven dùng chứng chỉ SSL riêng: nạp chứng chỉ CA từ biến môi trường DATABASE_CA.
function createClient() {
  const url = new URL(process.env.DATABASE_URL!);
  url.searchParams.delete("sslmode"); // để thiết lập ssl bên dưới quyết định
  const ca = process.env.DATABASE_CA;
  const adapter = new PrismaPg({
    connectionString: url.toString(),
    ssl: ca ? { ca, rejectUnauthorized: true } : undefined,
    // Gói Aiven miễn phí chỉ cho ~20 kết nối: mỗi tiến trình mở tối đa vài kết nối,
    // nhả kết nối rảnh sau 10 giây
    max: Number(process.env.DB_POOL_MAX ?? 3),
    idleTimeoutMillis: 10_000,
  });
  return new PrismaClient({ adapter });
}

// Giữ một kết nối duy nhất khi chạy thử (tránh mở quá nhiều kết nối lúc sửa code)
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
