"use server";

import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";

export type AccountState = { error?: string; created?: { email: string; password: string } } | undefined;
export type ResetState = { password?: string } | undefined;

/** Mật khẩu tạm 10 ký tự, bỏ các ký tự dễ nhầm (0/O, 1/l/I) */
function tempPassword() {
  const letters = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const all = letters + digits;
  let p = letters[randomInt(letters.length)] + digits[randomInt(digits.length)];
  while (p.length < 10) p += all[randomInt(all.length)];
  return p;
}

/** Đoàn trường tạo tài khoản LCĐ cho một khoa */
export async function createLcdAccount(_prev: AccountState, formData: FormData): Promise<AccountState> {
  await requireRole("ADMIN");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").replace(/\s+/g, " ").trim();
  const faculty = String(formData.get("faculty") ?? "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email không hợp lệ." };
  if (name.length < 3) return { error: "Vui lòng nhập tên người phụ trách hoặc tên LCĐ." };
  if (!faculty) return { error: "Vui lòng chọn khoa quản lý." };
  if (await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } })) {
    return { error: "Email này đã có tài khoản." };
  }

  const password = tempPassword();
  await prisma.user.create({
    data: {
      email,
      name,
      faculty,
      role: "LCD",
      password: await bcrypt.hash(password, 10),
      mustChangePassword: true,
    },
  });
  refresh();
  // Mật khẩu tạm chỉ hiện MỘT lần để Đoàn trường gửi cho LCĐ
  return { created: { email, password } };
}

export async function resetLcdPassword(userId: string): Promise<ResetState> {
  await requireRole("ADMIN");
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u || u.role !== "LCD") return undefined;
  const password = tempPassword();
  await prisma.user.update({
    where: { id: userId },
    data: { password: await bcrypt.hash(password, 10), mustChangePassword: true },
  });
  return { password };
}

export async function deleteLcdAccount(userId: string) {
  await requireRole("ADMIN");
  // Chỉ xoá tài khoản LCĐ; các lượt đã xác nhận vẫn giữ, chỉ mất tên người xác nhận
  await prisma.user.deleteMany({ where: { id: userId, role: "LCD" } });
  refresh();
}
