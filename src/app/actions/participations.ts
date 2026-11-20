"use server";

import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/dal";
import { startOfTodayVN } from "@/lib/format";
import { lcdWindow } from "@/lib/attendance";

/** Sinh viên bấm Đăng ký — mặc định được ghi nhận "Không tham gia" */
export async function registerEvent(eventId: string) {
  const me = await requireRole("STUDENT");
  const ev = await prisma.event.findUnique({ where: { id: eventId } });
  // Chỉ nhận khi sự kiện còn mở, chưa qua ngày, đúng phạm vi khoa
  if (
    !ev ||
    !ev.registrationOpen ||
    ev.date < startOfTodayVN(new Date()) ||
    (ev.faculty && ev.faculty !== me.faculty)
  ) {
    refresh();
    return;
  }
  await prisma.eventParticipation.upsert({
    where: { userId_eventId: { userId: me.id, eventId } },
    update: {}, // đã đăng ký rồi thì giữ nguyên
    create: { userId: me.id, eventId, status: "PENDING" },
  });
  refresh();
}

/** Sinh viên huỷ đăng ký: chỉ khi sự kiện chưa diễn ra và chưa được xác nhận tham gia */
export async function cancelRegistration(eventId: string) {
  const me = await requireRole("STUDENT");
  await prisma.eventParticipation.deleteMany({
    where: { userId: me.id, eventId, status: { not: "CONFIRMED" }, event: { date: { gt: new Date() } } },
  });
  refresh();
}

/**
 * Đổi trạng thái Tham gia / Không tham gia cho nhiều lượt cùng lúc.
 * - Đoàn trường: đổi được mọi lúc, mọi khoa.
 * - LCĐ: chỉ sinh viên khoa mình, chỉ trong hạn 7 ngày sau sự kiện.
 */
export async function setAttendance(eventId: string, attended: boolean, formData: FormData) {
  const me = await getCurrentUser();
  if (!me || me.mustChangePassword || (me.role !== "ADMIN" && me.role !== "LCD")) return;
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  if (ids.length === 0) return;

  const ev = await prisma.event.findUnique({ where: { id: eventId }, select: { date: true } });
  if (!ev) return;
  if (me.role === "LCD") {
    if (!me.faculty || lcdWindow(ev.date, new Date()) !== "open") {
      refresh();
      return;
    }
  }

  await prisma.eventParticipation.updateMany({
    where: {
      id: { in: ids },
      eventId,
      ...(me.role === "LCD" ? { user: { faculty: me.faculty } } : {}),
    },
    data: attended
      ? { status: "CONFIRMED", confirmedById: me.id, confirmedAt: new Date() }
      : { status: "PENDING", confirmedById: me.id, confirmedAt: new Date() },
  });
  refresh();
}
