// Tạo dữ liệu ban đầu: tài khoản Đoàn trường đầu tiên và ngưỡng xếp loại.
// Chạy: npx prisma db seed
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Thiếu ADMIN_EMAIL hoặc ADMIN_PASSWORD trong file .env");
  }

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Quản trị Đoàn trường",
      role: "ADMIN",
      password: await bcrypt.hash(password, 10),
      mustChangePassword: true,
    },
  });

  // Ngưỡng xếp loại thầy chốt ngày 17/11/2026 (thang 10 = tỷ lệ tham gia × 10)
  const rules = [
    { label: "Tốt", minScore: 8, order: 1 },
    { label: "Khá", minScore: 6.5, order: 2 },
    { label: "Trung bình", minScore: 5, order: 3 },
    { label: "Yếu", minScore: 0, order: 4 },
  ];
  for (const r of rules) {
    await prisma.gradingRule.upsert({
      where: { label: r.label },
      update: { order: r.order }, // giữ ngưỡng Đoàn trường đã sửa trên web
      create: r,
    });
  }

  console.log("Đã tạo tài khoản Đoàn trường và ngưỡng xếp loại.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
