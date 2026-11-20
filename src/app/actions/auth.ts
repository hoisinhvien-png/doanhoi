"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { getCurrentUser } from "@/lib/dal";
import { ROLE_HOME } from "@/lib/roles";

export type FormState = { error?: string } | undefined;

/** Đăng nhập bằng email, tên tài khoản (vd DIEUTH2025_NN) hoặc mã sinh viên + mật khẩu */
export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!identifier || !password) {
    return { error: "Vui lòng nhập tài khoản và mật khẩu." };
  }

  const user = await prisma.user.findFirst({
    where: identifier.includes("@")
      ? { email: { equals: identifier, mode: "insensitive" } }
      : {
          OR: [
            { username: { equals: identifier, mode: "insensitive" } },
            { studentId: { equals: identifier, mode: "insensitive" } },
          ],
        },
  });

  // Báo lỗi chung, không tiết lộ tài khoản có tồn tại hay không
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "Tài khoản hoặc mật khẩu không đúng." };
  }
  if (user.locked) {
    return { error: "Tài khoản đang bị khoá. Vui lòng liên hệ Văn phòng Đoàn – Hội." };
  }

  await createSession({
    userId: user.id,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  });
  redirect(user.mustChangePassword ? "/doi-mat-khau" : ROLE_HOME[user.role]);
}

/** Đổi mật khẩu (bắt buộc ở lần đăng nhập đầu) */
export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await getCurrentUser();
  if (!me) redirect("/dang-xuat");

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const user = await prisma.user.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await bcrypt.compare(current, user.password))) {
    return { error: "Mật khẩu hiện tại không đúng." };
  }
  if (next.length < 8 || !/[A-Za-z]/.test(next) || !/\d/.test(next)) {
    return { error: "Mật khẩu mới cần ít nhất 8 ký tự, có cả chữ và số." };
  }
  if (next !== confirm) {
    return { error: "Hai lần nhập mật khẩu mới không khớp." };
  }
  if (next === current) {
    return { error: "Mật khẩu mới phải khác mật khẩu cũ." };
  }

  await prisma.user.update({
    where: { id: me.id },
    data: { password: await bcrypt.hash(next, 10), mustChangePassword: false },
  });
  await createSession({ userId: me.id, role: me.role, mustChangePassword: false });
  redirect(ROLE_HOME[me.role]);
}

export async function logout() {
  await deleteSession();
  redirect("/dang-nhap");
}
