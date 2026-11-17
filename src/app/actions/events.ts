"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { parseLocalDateTime } from "@/lib/format";

export type EventFormState = { error?: string } | undefined;

function readForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const dateRaw = String(formData.get("date") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const faculty = String(formData.get("faculty") ?? "").trim();
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
      faculty: faculty || null, // để trống = toàn trường
      registrationOpen,
    },
  } as const;
}

export async function createEvent(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const me = await requireRole("ADMIN");
  const parsed = readForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  await prisma.event.create({ data: { ...parsed.data, createdById: me.id } });
  redirect("/quan-tri/su-kien");
}

export async function updateEvent(
  id: string,
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  await requireRole("ADMIN");
  const parsed = readForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  await prisma.event.update({ where: { id }, data: parsed.data });
  redirect("/quan-tri/su-kien");
}

export async function deleteEvent(id: string) {
  await requireRole("ADMIN");
  // Lượt đăng ký của sự kiện bị xoá theo (onDelete: Cascade)
  await prisma.event.delete({ where: { id } });
  redirect("/quan-tri/su-kien");
}

export async function toggleRegistration(id: string) {
  await requireRole("ADMIN");
  const ev = await prisma.event.findUniqueOrThrow({ where: { id } });
  await prisma.event.update({
    where: { id },
    data: { registrationOpen: !ev.registrationOpen },
  });
  refresh();
}
