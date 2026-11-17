import "server-only";
import { prisma } from "./prisma";

/** Danh sách khoa đang có trong dữ liệu (để gợi ý khi nhập) */
export async function getFaculties() {
  const rows = await prisma.user.findMany({
    where: { faculty: { not: null } },
    distinct: ["faculty"],
    select: { faculty: true },
    orderBy: { faculty: "asc" },
  });
  return rows.map((r) => r.faculty!).filter(Boolean);
}
