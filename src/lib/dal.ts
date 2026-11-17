// Lớp truy cập dữ liệu: mọi trang và thao tác đều kiểm tra quyền ở đây,
// không chỉ dựa vào proxy.ts.
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { decrypt, SESSION_COOKIE } from "./session";
import { ROLE_HOME, type RoleName } from "./roles";

/** Người đang đăng nhập (hoặc null). Gọi nhiều lần trong một lượt tải trang chỉ truy vấn 1 lần. */
export const getCurrentUser = cache(async () => {
  const session = await decrypt((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      role: true,
      faculty: true,
      className: true,
      studentId: true,
      email: true,
      mustChangePassword: true,
    },
  });
  return user;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Bắt buộc đăng nhập đúng vai trò; sai thì chuyển về trang phù hợp. */
export async function requireRole(role: RoleName): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (user.mustChangePassword) redirect("/doi-mat-khau");
  if (user.role !== role) redirect(ROLE_HOME[user.role]);
  return user;
}
