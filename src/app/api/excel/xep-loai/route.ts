// Xuất kết quả xếp loại đoàn viên ra Excel
import type { NextRequest } from "next/server";
import { apiUser, forbidden, xlsxResponse } from "@/lib/api-auth";
import { computeGrades, defaultRange, parseDateInput } from "@/lib/grading";
import { buildSheet } from "@/lib/excel-export";
import { formatDate } from "@/lib/format";

export async function GET(req: NextRequest) {
  if (!(await apiUser(["ADMIN"]))) return forbidden();
  const p = req.nextUrl.searchParams;
  const def = defaultRange(new Date());
  const from = parseDateInput(p.get("tu") || def.from);
  const to = parseDateInput(p.get("den") || def.to, true);
  if (!from || !to || from > to) return new Response("Khoảng ngày không hợp lệ", { status: 400 });
  const khoa = p.get("khoa") || undefined;
  const lop = p.get("lop") || undefined;

  const rows = await computeGrades({ from, to, faculty: khoa, className: lop });
  const buf = await buildSheet({
    title: "KẾT QUẢ ĐÁNH GIÁ XẾP LOẠI ĐOÀN VIÊN",
    subtitle: `Từ ${formatDate(from)} đến ${formatDate(to)}${khoa ? ` · Khoa ${khoa}` : ""}${lop ? ` · Lớp ${lop}` : ""} · Điểm = số sự kiện Tham gia ÷ số sự kiện được tham gia × 10`,
    sheetName: "Xếp loại",
    columns: [
      { header: "STT", key: "stt", width: 6 },
      { header: "Mã SV", key: "studentId", width: 14 },
      { header: "Họ và tên", key: "name", width: 28 },
      { header: "Lớp", key: "className", width: 16 },
      { header: "Khoa", key: "faculty", width: 24 },
      { header: "Số SK tham gia", key: "confirmed", width: 12 },
      { header: "Số SK được tham gia", key: "eligible", width: 12 },
      { header: "Điểm", key: "score", width: 8 },
      { header: "Xếp loại", key: "grade", width: 16 },
    ],
    rows: rows.map((r, i) => ({ ...r, stt: i + 1, score: r.score ?? "" })),
  });
  const stamp = new Date().toISOString().slice(0, 10);
  return xlsxResponse(buf, `Xep_loai_doan_vien_${stamp}.xlsx`);
}
