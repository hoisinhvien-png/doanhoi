"use server";

import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { startOfTodayVN } from "@/lib/format";

/** Sinh viên bấm Đăng ký */
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
    create: { userId: me.id, eventId },
  });
  refresh();
}

/** Sinh viên huỷ đăng ký (chỉ khi còn chờ duyệt) */
export async function cancelRegistration(eventId: string) {
  const me = await requireRole("STUDENT");
  await prisma.eventParticipation.deleteMany({
    where: { userId: me.id, eventId, status: "PENDING" },
  });
  refresh();
}

/** LCĐ duyệt hoặc từ chối nhiều lượt cùng lúc — chỉ sinh viên thuộc khoa mình */
export async function reviewParticipations(
  decision: "CONFIRMED" | "REJECTED" | "PENDING",
  formData: FormData
) {
  const me = await requireRole("LCD");
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  if (ids.length === 0 || !me.faculty) {
    refresh();
    return;
  }
  await prisma.eventParticipation.updateMany({
    where: { id: { in: ids }, user: { faculty: me.faculty } },
    data:
      decision === "PENDING"
        ? { status: "PENDING", confirmedById: null, confirmedAt: null }
        : { status: decision, confirmedById: me.id, confirmedAt: new Date() },
  });
  refresh();
}
