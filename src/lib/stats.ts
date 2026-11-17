// Số liệu cho Dashboard. "Tỷ lệ tham gia" = % sinh viên có ít nhất 1 sự kiện được duyệt
// trong năm học (trọn năm: 01/09 tới 31/08 năm sau, gồm cả sự kiện sắp diễn ra).
import "server-only";
import { prisma } from "./prisma";
import { defaultRange, parseDateInput } from "./grading";

export function schoolYear(now: Date) {
  const y = Number(defaultRange(now).from.slice(0, 4));
  return {
    from: parseDateInput(`${y}-09-01`)!,
    to: parseDateInput(`${y + 1}-08-31`, true)!,
    label: `${y}–${y + 1}`,
  };
}

export type RateRow = { name: string; total: number; active: number; rate: number };

/** Tỷ lệ tham gia theo khoa (faculty = undefined) hoặc theo lớp của một khoa */
export async function participationRates(from: Date, to: Date, faculty?: string): Promise<RateRow[]> {
  const rows = faculty
    ? await prisma.$queryRaw<{ name: string | null; total: bigint; active: bigint }[]>`
        SELECT u."className" AS name,
               COUNT(DISTINCT u.id) AS total,
               COUNT(DISTINCT p."userId") AS active
        FROM "User" u
        LEFT JOIN "EventParticipation" p
          ON p."userId" = u.id AND p.status = 'CONFIRMED'
         AND EXISTS (SELECT 1 FROM "Event" e WHERE e.id = p."eventId" AND e.date BETWEEN ${from} AND ${to})
        WHERE u.role = 'STUDENT' AND u.faculty = ${faculty}
        GROUP BY u."className"`
    : await prisma.$queryRaw<{ name: string | null; total: bigint; active: bigint }[]>`
        SELECT u.faculty AS name,
               COUNT(DISTINCT u.id) AS total,
               COUNT(DISTINCT p."userId") AS active
        FROM "User" u
        LEFT JOIN "EventParticipation" p
          ON p."userId" = u.id AND p.status = 'CONFIRMED'
         AND EXISTS (SELECT 1 FROM "Event" e WHERE e.id = p."eventId" AND e.date BETWEEN ${from} AND ${to})
        WHERE u.role = 'STUDENT'
        GROUP BY u.faculty`;
  return rows
    .map((r) => {
      const total = Number(r.total);
      const active = Number(r.active);
      return { name: r.name ?? "(chưa ghi)", total, active, rate: total ? Math.round((active / total) * 1000) / 10 : 0 };
    })
    .sort((a, b) => b.rate - a.rate || a.name.localeCompare(b.name, "vi"));
}

export type MonthRow = { month: string; count: number };

/** Số lượt tham gia được duyệt theo tháng (theo ngày diễn ra sự kiện, giờ VN) */
export async function monthlyConfirmed(from: Date, to: Date, faculty?: string): Promise<MonthRow[]> {
  const rows = await prisma.$queryRaw<{ ym: string; n: bigint }[]>`
    SELECT to_char((e.date AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM') AS ym,
           COUNT(*) AS n
    FROM "EventParticipation" p
    JOIN "Event" e ON e.id = p."eventId"
    JOIN "User" u ON u.id = p."userId"
    WHERE p.status = 'CONFIRMED' AND e.date BETWEEN ${from} AND ${to}
      AND (${faculty ?? null}::text IS NULL OR u.faculty = ${faculty ?? null})
    GROUP BY ym`;
  const byMonth = new Map(rows.map((r) => [r.ym, Number(r.n)]));

  // Điền đủ các tháng, kể cả tháng không có lượt nào
  const out: MonthRow[] = [];
  const vnFrom = new Date(from.getTime() + 7 * 3600e3);
  const vnTo = new Date(to.getTime() + 7 * 3600e3);
  let y = vnFrom.getUTCFullYear();
  let m = vnFrom.getUTCMonth();
  while (y < vnTo.getUTCFullYear() || (y === vnTo.getUTCFullYear() && m <= vnTo.getUTCMonth())) {
    const key = `${y}-${String(m + 1).padStart(2, "0")}`;
    out.push({ month: `${String(m + 1).padStart(2, "0")}/${y}`, count: byMonth.get(key) ?? 0 });
    m++;
    if (m > 11) { m = 0; y++; }
  }
  return out;
}

/** Sự kiện sắp diễn ra (trong phạm vi khoa nếu có) */
export async function upcomingEvents(now: Date, faculty?: string, take = 5) {
  return prisma.event.findMany({
    where: {
      date: { gte: now },
      ...(faculty ? { OR: [{ faculty: null }, { faculty }] } : {}),
    },
    orderBy: { date: "asc" },
    take,
    select: {
      id: true,
      title: true,
      date: true,
      location: true,
      faculty: true,
      registrationOpen: true,
      _count: { select: { participations: true } },
    },
  });
}
