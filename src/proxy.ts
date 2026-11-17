// Kiểm tra nhanh trước mỗi trang: chưa đăng nhập thì về /dang-nhap, sai vai trò thì về trang của mình.
// Kiểm tra chính thức vẫn nằm ở src/lib/dal.ts.
import { NextResponse, type NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";
import { ROLE_HOME, roleForPath } from "@/lib/roles";

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);
  const to = (p: string) => NextResponse.redirect(new URL(p, req.nextUrl));

  const neededRole = roleForPath(path);

  if (!session) {
    if (neededRole || path === "/doi-mat-khau") return to("/dang-nhap");
    return NextResponse.next();
  }

  // Đã đăng nhập
  if (session.mustChangePassword && path !== "/doi-mat-khau") {
    if (neededRole || path === "/dang-nhap") return to("/doi-mat-khau");
  }
  if (path === "/dang-nhap") return to(ROLE_HOME[session.role]);
  if (neededRole && neededRole !== session.role) return to(ROLE_HOME[session.role]);

  return NextResponse.next();
}

export const config = {
  // Bỏ qua file tĩnh và ảnh
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)$).*)"],
};
