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
    // Aiven gói miễn phí giới hạn ~15 kết nối (còn ~9 cho app sau khi trừ hệ thống).
    // Serverless có nhiều tiến trình song song nên mỗi tiến trình chỉ giữ 1 kết nối
    // (cố định, không theo biến môi trường), nhả nhanh khi rảnh, và báo lỗi thay vì treo.
    max: 1,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
  });
  return new PrismaClient({ adapter });
}

// Giữ một kết nối duy nhất khi chạy thử (tránh mở quá nhiều kết nối lúc sửa code)
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
