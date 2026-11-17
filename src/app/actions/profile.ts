"use server";

import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";

export type ProfileState = { error?: string; ok?: boolean } | undefined;

/** Sinh viên cập nhật hồ sơ: họ tên, ngày sinh, lớp. Mã SV và Khoa do Đoàn trường quản lý. */
export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const me = await requireRole("STUDENT");
  const name = String(formData.get("name") ?? "").replace(/\s+/g, " ").trim();
  const dobRaw = String(formData.get("dob") ?? "");
  const className = String(formData.get("className") ?? "").trim();

  if (name.length < 3) return { error: "Họ tên cần ít nhất 3 ký tự." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dobRaw)) return { error: "Vui lòng chọn ngày sinh." };
  const dob = new Date(`${dobRaw}T00:00:00Z`);
  const year = dob.getUTCFullYear();
  if (isNaN(dob.getTime()) || year < 1950 || year > new Date().getUTCFullYear() - 14) {
    return { error: "Ngày sinh không hợp lệ." };
  }

  await prisma.user.update({
    where: { id: me.id },
    data: { name, dob, className: className || null },
  });
  refresh();
  return { ok: true };
}
