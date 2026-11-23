"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff, type CurrentUser } from "@/lib/dal";
import { parseLocalDateTime } from "@/lib/format";

export type EventFormState = { error?: string } | undefined;

/** Trang danh sách sự kiện tương ứng với vai trò */
function eventsHome(me: CurrentUser) {
  return me.role === "LCD" ? "/lien-chi/su-kien" : "/quan-tri/su-kien";
}

function readForm(formData: FormData, me: CurrentUser) {
  const title = String(formData.get("title") ?? "").trim();
  const dateRaw = String(formData.get("date") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  let faculty = String(formData.get("faculty") ?? "").trim();
  // "Toàn trường" không phải một khoa — luôn quy về toàn trường (null)
  if (faculty.toLowerCase() === "toàn trường") faculty = "";
  // LCĐ chỉ được chọn 2 phạm vi: Toàn trường (để trống) hoặc đúng khoa của mình.
  if (me.role === "LCD" && faculty !== "" && faculty !== me.faculty) {
    return {
      error: "Phạm vi không hợp lệ: Liên chi Đoàn chỉ đăng toàn trường hoặc trong khoa mình.",
    } as const;
  }
  const registrationOpen = formData.get("registrationOpen") === "on";

  if (title.length < 3) return { error: "Tên sự kiện cần ít nhất 3 ký tự." } as const;
  const date = parseLocalDateTime(dateRaw);
  if (!date) return { error: "Vui lòng chọn ngày giờ diễn ra." } as const;

  return {
    data: {
      title,
      date,
      description: description || null,
      location: location || null,
      faculty: faculty || null, // để trống = toàn trường (chỉ Đoàn trường dùng)
      registrationOpen,
    },
  } as const;
}

/**
 * Nạp sự kiện mà người đang đăng nhập được phép sửa/xoá.
 * - Đoàn trường: mọi sự kiện.
 * - LCĐ: chỉ sự kiện do chính tài khoản mình tạo (sự kiện của khoa).
 * Trả về null nếu không có quyền.
 */
async function loadEditableEvent(me: CurrentUser, id: string) {
  const ev = await prisma.event.findUnique({
    where: { id },
    select: { id: true, createdById: true },
  });
  if (!ev) return null;
  if (me.role === "LCD" && ev.createdById !== me.id) return null;
  return ev;
}

export async function createEvent(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const me = await requireStaff();
  if (me.role === "LCD" && !me.faculty) {
    return { error: "Tài khoản chưa được gán khoa. Liên hệ Đoàn trường." };
  }
  const parsed = readForm(formData, me);
  if ("error" in parsed) return { error: parsed.error };
  await prisma.event.create({ data: { ...parsed.data, createdById: me.id } });
  redirect(eventsHome(me));
}

export async function updateEvent(
  id: string,
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const me = await requireStaff();
  const ev = await loadEditableEvent(me, id);
  if (!ev) redirect(eventsHome(me));
  const parsed = readForm(formData, me);
  if ("error" in parsed) return { error: parsed.error };
  await prisma.event.update({ where: { id }, data: parsed.data });
  redirect(eventsHome(me));
}

export async function deleteEvent(id: string) {
  const me = await requireStaff();
  const ev = await loadEditableEvent(me, id);
  if (!ev) redirect(eventsHome(me));
  // Lượt đăng ký của sự kiện bị xoá theo (onDelete: Cascade)
  await prisma.event.delete({ where: { id } });
  redirect(eventsHome(me));
}

export async function toggleRegistration(id: string) {
  const me = await requireStaff();
  const ev = await loadEditableEvent(me, id);
  if (!ev) {
    refresh();
    return;
  }
  const full = await prisma.event.findUniqueOrThrow({ where: { id } });
  await prisma.event.update({
    where: { id },
    data: { registrationOpen: !full.registrationOpen },
  });
  refresh();
}
