// Xuất danh sách đăng ký sự kiện ra Excel.
// Đoàn trường: toàn trường. LCĐ: tự động giới hạn trong khoa mình.
import type { NextRequest } from "next/server";
import { apiUser, forbidden, xlsxResponse } from "@/lib/api-auth";
import { buildSheet } from "@/lib/excel-export";
import { formatDate, formatDateTime } from "@/lib/format";
import { readReportParams, reportRows, reportWhere } from "@/lib/report";
import { STATUS_LABEL } from "@/components/status-badge";

export async function GET(req: NextRequest) {
  const me = await apiUser(["ADMIN", "LCD"]);
  if (!me) return forbidden();
  if (me.role === "LCD" && !me.faculty) return forbidden();

  const p = readReportParams((k) => req.nextUrl.searchParams.get(k));
  const forced = me.role === "LCD" ? me.faculty! : undefined;
  const rows = await reportRows(reportWhere(p, forced));

  const parts = [
    forced ? `Khoa ${forced}` : p.khoa ? `Khoa ${p.khoa}` : "Toàn trường",
    p.lop && `Lớp ${p.lop}`,
    p.sk && rows[0] && `Sự kiện: ${rows[0].event.title}`,
    p.tu && `Từ ${p.tu.split("-").reverse().join("/")}`,
    p.den && `đến ${p.den.split("-").reverse().join("/")}`,
    p.tt && `Trạng thái: ${p.tt === "CONFIRMED" ? "Tham gia" : "Không tham gia"}`,
  ].filter(Boolean);

  const buf = await buildSheet({
    title: "DANH SÁCH SINH VIÊN ĐĂNG KÝ THAM GIA HOẠT ĐỘNG ĐOÀN – HỘI",
    subtitle: `${parts.join(" · ")} · Xuất lúc ${formatDateTime(new Date())}`,
    sheetName: "Danh sách",
    columns: [
      { header: "STT", key: "stt", width: 6 },
      { header: "Mã SV", key: "studentId", width: 14 },
      { header: "Họ và tên", key: "name", width: 28 },
      { header: "Ngày sinh", key: "dob", width: 12 },
      { header: "Lớp", key: "className", width: 16 },
      { header: "Khoa", key: "faculty", width: 24 },
      { header: "Sự kiện", key: "event", width: 36 },
      { header: "Ngày diễn ra", key: "eventDate", width: 18 },
      { header: "Đăng ký lúc", key: "createdAt", width: 18 },
      { header: "Trạng thái", key: "status", width: 14 },
      { header: "Người xác nhận", key: "approver", width: 22 },
    ],
    rows: rows.map((r, i) => ({
      stt: i + 1,
      studentId: r.user.studentId,
      name: r.user.name,
      dob: r.user.dob ? formatDate(r.user.dob) : "",
      className: r.user.className,
      faculty: r.user.faculty,
      event: r.event.title,
      eventDate: formatDateTime(r.event.date),
      createdAt: formatDateTime(r.createdAt),
      status: STATUS_LABEL[r.status],
      approver: r.status === "CONFIRMED" ? r.confirmedBy?.name ?? "" : "",
    })),
  });
  const stamp = new Date().toISOString().slice(0, 10);
  return xlsxResponse(buf, `Danh_sach_dang_ky_${stamp}.xlsx`);
}
