// Xoá phiên đăng nhập rồi về trang đăng nhập.
// Dùng khi tài khoản bị khoá hoặc bị xoá trong lúc đang đăng nhập.
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/dang-nhap", req.nextUrl));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
