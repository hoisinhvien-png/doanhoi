// Dọn dữ liệu THỬ trước khi dùng thật.
// Chạy: npm run cleanup:demo
// Xoá: tài khoản email đuôi @demo.local, mã SV bắt đầu bằng DEMO, 2 SV giả của file mẫu
// (2201001 "Nguyễn Văn A", 2201002 "Trần Thị B"), sự kiện có chữ "(thử)" trong tên.
// Lượt đăng ký của các tài khoản/sự kiện này tự xoá theo.
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { endsWith: "@demo.local" } },
        { studentId: { startsWith: "DEMO" } },
        { studentId: "2201001", name: "Nguyễn Văn A" },
        { studentId: "2201002", name: "Trần Thị B" },
      ],
    },
  });
  const events = await prisma.event.deleteMany({ where: { title: { contains: "(thử)" } } });
  console.log(`Đã xoá ${users.count} tài khoản thử và ${events.count} sự kiện thử.`);

  const admin = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true, mustChangePassword: true },
  });
  for (const a of admin) {
    console.log(`Tài khoản Đoàn trường còn lại: ${a.email} - ${a.mustChangePassword ? "CHƯA đổi mật khẩu tạm" : "đã đổi mật khẩu"}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
