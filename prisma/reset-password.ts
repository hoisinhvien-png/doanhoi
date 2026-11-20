// Đặt lại mật khẩu cho một tài khoản (khi quên mật khẩu).
// Chạy: npm run reset-password -- <email, tên tài khoản hoặc mã SV>
// In ra mật khẩu tạm MỘT lần; lần đăng nhập tới sẽ bắt đổi mật khẩu.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { prisma } from "../src/lib/prisma";

function tempPassword() {
  const letters = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const all = letters + digits;
  let p = letters[randomInt(letters.length)] + digits[randomInt(digits.length)];
  while (p.length < 10) p += all[randomInt(all.length)];
  return p;
}

async function main() {
  const id = (process.argv[2] ?? "").trim();
  if (!id) throw new Error("Thiếu email hoặc mã SV. VD: npm run reset-password -- ten@htu.edu.vn");
  const user = await prisma.user.findFirst({
    where: id.includes("@")
      ? { email: { equals: id, mode: "insensitive" } }
      : { OR: [{ studentId: { equals: id, mode: "insensitive" } }, { username: { equals: id, mode: "insensitive" } }] },
  });
  if (!user) throw new Error(`Không tìm thấy tài khoản ${id}`);

  const password = tempPassword();
  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(password, 10), mustChangePassword: true },
  });
  console.log(`Tài khoản: ${user.email ?? user.studentId} (${user.role})`);
  console.log(`Mật khẩu tạm: ${password}`);
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
