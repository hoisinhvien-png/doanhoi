// Tạo (hoặc đặt lại) các tài khoản THỬ để kiểm tra phân quyền.
// Chạy: npm run seed:demo   — mật khẩu lấy từ DEMO_PASSWORD trong .env
// Xoá các tài khoản này trước khi dùng thật (email đuôi @demo.local, mã SV bắt đầu DEMO).
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const pw = process.env.DEMO_PASSWORD;
  if (!pw) throw new Error("Thiếu DEMO_PASSWORD trong file .env");
  const password = await bcrypt.hash(pw, 10);

  const accounts = [
    {
      key: { email: "admin@demo.local" },
      data: {
        email: "admin@demo.local",
        name: "Đoàn trường (thử)",
        role: "ADMIN" as const,
        mustChangePassword: false,
      },
    },
    {
      key: { email: "lcd.cntt@demo.local" },
      data: {
        email: "lcd.cntt@demo.local",
        name: "LCĐ Khoa CNTT (thử)",
        role: "LCD" as const,
        faculty: "Công nghệ thông tin",
        mustChangePassword: false,
      },
    },
    {
      key: { studentId: "DEMO001" },
      data: {
        studentId: "DEMO001",
        name: "Nguyễn Văn Thử",
        role: "STUDENT" as const,
        className: "K45 CNTT",
        faculty: "Công nghệ thông tin",
        dob: new Date("2004-05-20"),
        mustChangePassword: false,
      },
    },
    {
      // Tài khoản để thử luồng "bắt đổi mật khẩu lần đầu"
      key: { studentId: "DEMO002" },
      data: {
        studentId: "DEMO002",
        name: "Trần Thị Mới",
        role: "STUDENT" as const,
        className: "K46 Sư phạm Toán",
        faculty: "Sư phạm",
        dob: new Date("2005-09-01"),
        mustChangePassword: true,
      },
    },
  ];

  for (const a of accounts) {
    await prisma.user.upsert({
      where: a.key,
      update: { ...a.data, password },
      create: { ...a.data, password },
    });
  }
  console.log(`Đã tạo/đặt lại ${accounts.length} tài khoản thử.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
