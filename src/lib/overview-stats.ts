// Thống kê tổng hợp cho Đoàn trường theo năm học (01/08 – 31/07).
// Hai mảng: hoạt động (sự kiện, theo đơn vị tạo và theo tháng) và
// ý kiến (theo đơn vị nhận và theo tháng, kèm chất lượng trả lời qua like/unlike).
// Máy chủ Vercel chạy giờ UTC nên mọi quy đổi tháng/năm học đều theo giờ VN (UTC+7).
import "server-only";
import { prisma } from "./prisma";

const OFFSET_MS = 7 * 60 * 60 * 1000;

export const DOAN_TRUONG = "Đoàn trường";
const UNKNOWN_UNIT = "(không rõ đơn vị)";
const UNKNOWN_FACULTY = "(chưa rõ khoa)";

/** Năm học bắt đầu năm y: 01/08/y 00:00 → 31/07/(y+1) 23:59:59.999 (giờ VN) */
export function schoolYearRange(y: number) {
  const from = new Date(`${y}-08-01T00:00:00+07:00`);
  const to = new Date(`${y + 1}-07-31T23:59:59.999+07:00`);
  return { from, to };
}

/** Năm học hiện tại (trả về năm bắt đầu) theo giờ VN */
export function currentSchoolYear(now: Date) {
  const vn = new Date(now.getTime() + OFFSET_MS);
  return vn.getUTCMonth() >= 7 ? vn.getUTCFullYear() : vn.getUTCFullYear() - 1;
}

/** "2026–2027" */
export function schoolYearLabel(y: number) {
  return `${y}–${y + 1}`;
}

/** 12 nhãn tháng của năm học, từ T8/y tới T7/(y+1) */
export function schoolYearMonthLabels(y: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < 12; i++) {
    const m = ((7 + i) % 12) + 1; // 8,9,…,12,1,…,7
    const year = 7 + i < 12 ? y : y + 1;
    out.push(`T${m}/${year}`);
  }
  return out;
}

/** Chỉ số tháng 0..11 trong năm học cho một thời điểm (giờ VN); -1 nếu ngoài năm học */
function monthIndex(d: Date, y: number): number {
  const vn = new Date(d.getTime() + OFFSET_MS);
  const idx = (vn.getUTCFullYear() - y) * 12 + (vn.getUTCMonth() - 7);
  return idx >= 0 && idx < 12 ? idx : -1;
}

const isUnknownUnit = (u: string) => u === UNKNOWN_UNIT || u === UNKNOWN_FACULTY;

/** Danh sách năm học có dữ liệu, mới nhất trước (từ năm học hiện tại về năm sớm nhất có sự kiện/ý kiến) */
export async function listSchoolYears(now: Date): Promise<number[]> {
  const cur = currentSchoolYear(now);
  const [ev, fb] = await Promise.all([
    prisma.event.findFirst({ orderBy: { date: "asc" }, select: { date: true } }),
    prisma.feedback.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
  ]);
  let earliest = cur;
  for (const d of [ev?.date, fb?.createdAt]) {
    if (!d) continue;
    const vn = new Date(d.getTime() + OFFSET_MS);
    const sy = vn.getUTCMonth() >= 7 ? vn.getUTCFullYear() : vn.getUTCFullYear() - 1;
    if (sy < earliest) earliest = sy;
  }
  const years: number[] = [];
  for (let yy = cur; yy >= earliest; yy--) years.push(yy);
  return years;
}

// ----- Hoạt động (sự kiện) -----

export type UnitCount = { unit: string; count: number };
export type EventMonthRow = { label: string; doanTruong: number; khoa: number; total: number };
export type EventOverview = {
  total: number;
  doanTruong: number; // số hoạt động do Đoàn trường tạo
  khoa: number; // số hoạt động do các khoa (LCĐ) tạo
  unknown: number; // không rõ đơn vị tạo
  byUnit: UnitCount[];
  byMonth: EventMonthRow[];
};

function rankUnit(u: string) {
  return u === DOAN_TRUONG ? 0 : isUnknownUnit(u) ? 2 : 1;
}

export async function eventOverview(y: number): Promise<EventOverview> {
  const { from, to } = schoolYearRange(y);
  const events = await prisma.event.findMany({
    where: { date: { gte: from, lte: to } },
    select: { date: true, createdBy: { select: { role: true, faculty: true } } },
  });

  const byMonth: EventMonthRow[] = schoolYearMonthLabels(y).map((label) => ({ label, doanTruong: 0, khoa: 0, total: 0 }));
  const unitMap = new Map<string, number>();
  let doanTruong = 0;
  let khoa = 0;
  let unknown = 0;

  for (const e of events) {
    const cb = e.createdBy;
    let unit: string;
    let kind: "doan" | "khoa" | "unknown";
    if (!cb || cb.role === "STUDENT") {
      unit = UNKNOWN_UNIT;
      kind = "unknown";
    } else if (cb.role === "ADMIN") {
      unit = DOAN_TRUONG;
      kind = "doan";
    } else {
      unit = cb.faculty ?? UNKNOWN_FACULTY;
      kind = "khoa";
    }
    unitMap.set(unit, (unitMap.get(unit) ?? 0) + 1);
    if (kind === "doan") doanTruong++;
    else if (kind === "khoa") khoa++;
    else unknown++;

    const mi = monthIndex(e.date, y);
    if (mi >= 0) {
      byMonth[mi].total++;
      if (kind === "doan") byMonth[mi].doanTruong++;
      else if (kind === "khoa") byMonth[mi].khoa++;
    }
  }

  const byUnit = [...unitMap].map(([unit, count]) => ({ unit, count }));
  byUnit.sort((a, b) => rankUnit(a.unit) - rankUnit(b.unit) || b.count - a.count || a.unit.localeCompare(b.unit, "vi"));

  return { total: events.length, doanTruong, khoa, unknown, byUnit, byMonth };
}

// ----- Ý kiến & phản hồi -----

export type FbUnitRow = {
  unit: string;
  total: number;
  responded: number;
  like: number;
  unlike: number;
  unrated: number;
};
export type FbMonthRow = { label: string; total: number; responded: number; like: number; unlike: number };
export type FeedbackOverview = {
  total: number;
  responded: number;
  like: number;
  unlike: number;
  unrated: number;
  byUnit: FbUnitRow[];
  byMonth: FbMonthRow[];
};

export async function feedbackOverview(y: number): Promise<FeedbackOverview> {
  const { from, to } = schoolYearRange(y);
  const rows = await prisma.feedback.findMany({
    where: { createdAt: { gte: from, lte: to } },
    select: {
      faculty: true,
      recipient: true,
      satisfaction: true,
      createdAt: true,
      replies: { where: { authorRole: { in: ["ADMIN", "LCD"] } }, take: 1, select: { id: true } },
    },
  });

  const byMonth: FbMonthRow[] = schoolYearMonthLabels(y).map((label) => ({ label, total: 0, responded: 0, like: 0, unlike: 0 }));
  const unitMap = new Map<string, FbUnitRow>();
  let total = 0;
  let responded = 0;
  let like = 0;
  let unlike = 0;
  let unrated = 0;

  for (const r of rows) {
    total++;
    const hasReply = r.replies.length > 0;
    const unit = r.recipient === "DOAN_TRUONG" ? DOAN_TRUONG : r.faculty ?? UNKNOWN_FACULTY;
    let u = unitMap.get(unit);
    if (!u) {
      u = { unit, total: 0, responded: 0, like: 0, unlike: 0, unrated: 0 };
      unitMap.set(unit, u);
    }
    u.total++;
    if (hasReply) {
      responded++;
      u.responded++;
    }
    if (r.satisfaction === "LIKE") {
      like++;
      u.like++;
    } else if (r.satisfaction === "UNLIKE") {
      unlike++;
      u.unlike++;
    } else if (hasReply) {
      unrated++;
      u.unrated++;
    }

    const mi = monthIndex(r.createdAt, y);
    if (mi >= 0) {
      byMonth[mi].total++;
      if (hasReply) byMonth[mi].responded++;
      if (r.satisfaction === "LIKE") byMonth[mi].like++;
      else if (r.satisfaction === "UNLIKE") byMonth[mi].unlike++;
    }
  }

  const byUnit = [...unitMap.values()];
  byUnit.sort((a, b) => rankUnit(a.unit) - rankUnit(b.unit) || b.total - a.total || a.unit.localeCompare(b.unit, "vi"));

  return { total, responded, like, unlike, unrated, byUnit, byMonth };
}
