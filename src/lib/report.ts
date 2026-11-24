// Truy vấn danh sách đăng ký sự kiện dùng cho báo cáo (xem trước và xuất Excel).
import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { parseDateInput } from "./grading";
import { NOT_ATTENDED } from "./attendance";

export type ReportParams = {
  sk?: string; // id sự kiện
  tu?: string; // yyyy-mm-dd (theo ngày diễn ra sự kiện)
  den?: string;
  khoa?: string;
  lop?: string;
  tt?: string; // CONFIRMED (Tham gia) | NOT (Không tham gia) | "" (tất cả)
};

export function readReportParams(get: (k: string) => string | null | undefined): ReportParams {
  const v = (k: string) => (get(k) ?? "").trim();
  return { sk: v("sk"), tu: v("tu"), den: v("den"), khoa: v("khoa"), lop: v("lop"), tt: v("tt") };
}

/** forcedFaculty: LCĐ chỉ được xem khoa mình */
export function reportWhere(p: ReportParams, forcedFaculty?: string): Prisma.EventParticipationWhereInput {
  const from = parseDateInput(p.tu);
  const to = parseDateInput(p.den, true);
  const faculty = forcedFaculty ?? p.khoa;
  // 3 trạng thái: CONFIRMED (Tham gia), PENDING (Chờ xác nhận), REJECTED (Không tham gia).
  // "NOT" (link cũ): gộp Chờ xác nhận + Không tham gia.
  const status =
    p.tt === "CONFIRMED"
      ? ("CONFIRMED" as const)
      : p.tt === "PENDING"
        ? ("PENDING" as const)
        : p.tt === "REJECTED"
          ? ("REJECTED" as const)
          : p.tt === "NOT"
            ? { in: NOT_ATTENDED }
            : undefined;
  return {
    ...(p.sk ? { eventId: p.sk } : {}),
    ...(status ? { status } : {}),
    ...(from || to
      ? { event: { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } }
      : {}),
    user: {
      ...(faculty ? { faculty } : {}),
      ...(p.lop ? { className: p.lop } : {}),
    },
  };
}

export async function reportRows(where: Prisma.EventParticipationWhereInput) {
  return prisma.eventParticipation.findMany({
    where,
    orderBy: [{ event: { date: "asc" } }, { user: { className: "asc" } }, { user: { name: "asc" } }],
    include: {
      user: { select: { studentId: true, name: true, dob: true, className: true, faculty: true } },
      event: { select: { title: true, date: true, location: true } },
      confirmedBy: { select: { name: true } },
    },
  });
}
