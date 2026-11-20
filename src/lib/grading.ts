// Đánh giá xếp loại đoàn viên.
// Điểm (thang 10) = số sự kiện được xác nhận Tham gia ÷ số sự kiện sinh viên được tham gia × 10,
// trong khoảng thời gian chọn. "Được tham gia" = sự kiện toàn trường + sự kiện của khoa mình.
// (Cách tính thầy chốt ngày 17/11/2026.)
import "server-only";
import { prisma } from "./prisma";

export type GradeFilter = {
  from: Date;
  to: Date;
  faculty?: string;
  className?: string;
  userId?: string; // chỉ một sinh viên (trang của sinh viên)
};

export type GradeRow = {
  id: string;
  studentId: string;
  name: string;
  className: string;
  faculty: string;
  eligible: number;
  confirmed: number;
  score: number | null; // null = không có sự kiện nào để tính
  grade: string;
};

/** "2026-09-01" -> đầu ngày / cuối ngày theo giờ VN */
export function parseDateInput(v: string | undefined, endOfDay = false): Date | null {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T${endOfDay ? "23:59:59.999" : "00:00:00"}+07:00`);
  return isNaN(d.getTime()) ? null : d;
}

export async function getGradingRules() {
  return prisma.gradingRule.findMany({ orderBy: { minScore: "desc" } });
}

export async function computeGrades(f: GradeFilter): Promise<GradeRow[]> {
  const [events, students, rules] = await Promise.all([
    prisma.event.findMany({
      where: { date: { gte: f.from, lte: f.to } },
      select: { id: true, faculty: true },
    }),
    prisma.user.findMany({
      where: {
        role: "STUDENT",
        ...(f.userId ? { id: f.userId } : {}),
        ...(f.faculty ? { faculty: f.faculty } : {}),
        ...(f.className ? { className: f.className } : {}),
      },
      orderBy: [{ faculty: "asc" }, { className: "asc" }, { name: "asc" }],
      select: { id: true, studentId: true, name: true, className: true, faculty: true },
    }),
    getGradingRules(),
  ]);

  const confirmed = await prisma.eventParticipation.groupBy({
    by: ["userId"],
    where: {
      status: "CONFIRMED",
      eventId: { in: events.map((e) => e.id) },
      userId: { in: students.map((s) => s.id) },
    },
    _count: true,
  });
  const confirmedBy = new Map(confirmed.map((c) => [c.userId, c._count]));
  const schoolWide = events.filter((e) => !e.faculty).length;
  const perFaculty = new Map<string, number>();
  for (const e of events) if (e.faculty) perFaculty.set(e.faculty, (perFaculty.get(e.faculty) ?? 0) + 1);

  return students.map((s) => {
    const eligible = schoolWide + (s.faculty ? perFaculty.get(s.faculty) ?? 0 : 0);
    const done = confirmedBy.get(s.id) ?? 0;
    const score = eligible > 0 ? Math.round((Math.min(done, eligible) / eligible) * 1000) / 100 : null;
    const grade =
      score === null
        ? "Chưa có sự kiện"
        : rules.find((r) => score >= r.minScore)?.label ?? rules.at(-1)?.label ?? "";
    return {
      id: s.id,
      studentId: s.studentId ?? "",
      name: s.name,
      className: s.className ?? "",
      faculty: s.faculty ?? "",
      eligible,
      confirmed: done,
      score,
      grade,
    };
  });
}

/** Mặc định: từ 01/08 (đầu năm học) tới hôm nay (giờ VN), dạng yyyy-mm-dd */
export function defaultRange(now: Date) {
  const vn = new Date(now.getTime() + 7 * 3600 * 1000);
  const y = vn.getUTCMonth() >= 7 ? vn.getUTCFullYear() : vn.getUTCFullYear() - 1;
  return { from: `${y}-08-01`, to: vn.toISOString().slice(0, 10) };
}
