// Xuất danh sách tài khoản sinh viên kèm mật khẩu ban đầu, để Đoàn trường gửi cho từng đoàn viên.
// Mật khẩu chỉ in ra khi sinh viên CHƯA đổi (mustChangePassword); lúc đó mật khẩu vẫn là ngày sinh ddMMyyyy.
// Nhận cùng bộ lọc với trang /quan-tri/sinh-vien: q (tìm kiếm), khoa.
import type { NextRequest } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { apiUser, forbidden, xlsxResponse } from "@/lib/api-auth";
import { buildSheet } from "@/lib/excel-export";
import { dobPassword } from "@/lib/excel-import";
import { formatDate } from "@/lib/format";

export async function GET(req: NextRequest) {
  if (!(await apiUser(["ADMIN"]))) return forbidden();
  const p = req.nextUrl.searchParams;
  const q = (p.get("q") ?? "").trim();
  const khoa = p.get("khoa") ?? "";

  const where: Prisma.UserWhereInput = {
    role: "STUDENT",
    ...(khoa ? { faculty: khoa } : {}),
    ...(q
      ? {
          OR: [
            { studentId: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
            { className: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const students = await prisma.user.findMany({
    where,
    orderBy: [{ faculty: "asc" }, { className: "asc" }, { studentId: "asc" }],
    select: {
      studentId: true,
      username: true,
      name: true,
      dob: true,
      className: true,
      faculty: true,
      locked: true,
      mustChangePassword: true,
    },
  });

  const rows = students.map((s, i) => {
    let password = "";
    let note = "";
    if (!s.mustChangePassword) note = "Đã tự đổi mật khẩu";
    else if (s.dob) password = dobPassword(s.dob);
    else note = "Thiếu ngày sinh – cần cập nhật";
    if (s.locked) note = note ? `Đã khoá · ${note}` : "Đã khoá";
    return {
      stt: i + 1,
      studentId: s.studentId,
      name: s.name,
      dob: s.dob ? formatDate(s.dob) : "",
      className: s.className,
      faculty: s.faculty,
      username: s.username,
      password,
      note,
    };
  });

  const loginUrl = `${req.nextUrl.origin}/dang-nhap`;
  const buf = await buildSheet({
    title: "DANH SÁCH TÀI KHOẢN ĐOÀN VIÊN",
    subtitle:
      `Đăng nhập tại ${loginUrl} bằng tên tài khoản hoặc mã SV. ` +
      `Mật khẩu ban đầu là ngày sinh (ddMMyyyy); hệ thống bắt đổi ở lần đăng nhập đầu.` +
      `${khoa ? ` · Khoa ${khoa}` : ""}${q ? ` · Lọc "${q}"` : ""}`,
    sheetName: "Tài khoản",
    columns: [
      { header: "STT", key: "stt", width: 6 },
      { header: "Mã SV", key: "studentId", width: 14 },
      { header: "Họ và tên", key: "name", width: 28 },
      { header: "Ngày sinh", key: "dob", width: 12 },
      { header: "Lớp", key: "className", width: 18 },
      { header: "Khoa", key: "faculty", width: 24 },
      { header: "Tên tài khoản", key: "username", width: 20 },
      { header: "Mật khẩu ban đầu", key: "password", width: 16 },
      { header: "Ghi chú", key: "note", width: 28 },
    ],
    rows,
  });
  const stamp = new Date().toISOString().slice(0, 10);
  return xlsxResponse(buf, `Tai_khoan_doan_vien${khoa ? `_${khoa}` : ""}_${stamp}.xlsx`);
}
