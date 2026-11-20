// Tạo tên tài khoản (vd DIEUTH2025_NN) cho các sinh viên đã có trong CSDL nhưng chưa có tên tài khoản.
// Chạy MỘT lần sau khi thêm cột "username":
//   npx tsx --conditions=react-server prisma/backfill-username.ts          (xem trước, không ghi)
//   npx tsx --conditions=react-server prisma/backfill-username.ts --ghi    (ghi vào CSDL)
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { assignUsernames } from "../src/lib/username";

async function main() {
  const write = process.argv.includes("--ghi");
  const students = await prisma.user.findMany({
    where: { role: "STUDENT", username: null, studentId: { not: null } },
    select: { id: true, studentId: true, name: true, faculty: true },
    orderBy: { studentId: "asc" },
  });
  console.log(`${students.length} sinh viên chưa có tên tài khoản.`);
  if (students.length === 0) return;

  const names = await assignUsernames(students.map((s) => ({ studentId: s.studentId!, name: s.name, faculty: s.faculty })));
  for (const s of students.slice(0, 10)) console.log(`  ${s.studentId}  ${s.name}  ->  ${names.get(s.studentId!)}`);
  if (!write) {
    console.log("Mới xem trước. Thêm --ghi để lưu vào CSDL.");
    return;
  }
  // Mỗi 500 sinh viên một câu lệnh SQL (CSDL ở xa, từng lệnh riêng lẻ rất chậm). Chỉ ghi chỗ còn trống.
  for (let i = 0; i < students.length; i += 500) {
    const part = students.slice(i, i + 500);
    await prisma.$executeRaw`
      UPDATE "User" AS u SET username = v.username
      FROM unnest(${part.map((s) => s.id)}::text[], ${part.map((s) => names.get(s.studentId!)!)}::text[]) AS v(id, username)
      WHERE u.id = v.id AND u.username IS NULL`;
  }
  console.log(`Đã lưu tên tài khoản cho ${students.length} sinh viên.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
