// Xuất thống kê tổng hợp (hoạt động + ý kiến) của Đoàn trường ra Excel, theo năm học.
import type { NextRequest } from "next/server";
import { apiUser, forbidden, xlsxResponse } from "@/lib/api-auth";
import { buildMultiSheet } from "@/lib/excel-export";
import { currentSchoolYear, eventOverview, feedbackOverview, schoolYearLabel } from "@/lib/overview-stats";

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

export async function GET(req: NextRequest) {
  if (!(await apiUser(["ADMIN"]))) return forbidden();

  const now = new Date();
  const raw = Number(req.nextUrl.searchParams.get("nam"));
  const y = Number.isInteger(raw) && raw >= 2000 && raw <= 2100 ? raw : currentSchoolYear(now);
  const label = schoolYearLabel(y);

  const [ev, fb] = await Promise.all([eventOverview(y), feedbackOverview(y)]);

  const buf = await buildMultiSheet([
    {
      title: `HOẠT ĐỘNG THEO ĐƠN VỊ – NĂM HỌC ${label}`,
      subtitle: `Số sự kiện do mỗi đơn vị tạo (theo ngày diễn ra). Tổng: ${ev.total} hoạt động.`,
      sheetName: "HĐ theo đơn vị",
      columns: [
        { header: "STT", key: "stt", width: 6 },
        { header: "Đơn vị", key: "unit", width: 32 },
        { header: "Số hoạt động", key: "count", width: 14 },
        { header: "Tỷ lệ (%)", key: "pct", width: 10 },
      ],
      rows: ev.byUnit.map((u, i) => ({ stt: i + 1, unit: u.unit, count: u.count, pct: pct(u.count, ev.total) })),
    },
    {
      title: `HOẠT ĐỘNG THEO THÁNG – NĂM HỌC ${label}`,
      subtitle: "Số sự kiện theo tháng (theo ngày diễn ra).",
      sheetName: "HĐ theo tháng",
      columns: [
        { header: "Tháng", key: "label", width: 12 },
        { header: "Đoàn trường", key: "doanTruong", width: 14 },
        { header: "Các khoa", key: "khoa", width: 12 },
        { header: "Tổng", key: "total", width: 10 },
      ],
      rows: ev.byMonth.map((m) => ({ ...m })),
    },
    {
      title: `Ý KIẾN THEO ĐƠN VỊ NHẬN – NĂM HỌC ${label}`,
      subtitle: `Số ý kiến nhận, đã trả lời và đánh giá của sinh viên. Tổng: ${fb.total} ý kiến, đã trả lời ${fb.responded} (${pct(fb.responded, fb.total)}%).`,
      sheetName: "YK theo đơn vị",
      columns: [
        { header: "STT", key: "stt", width: 6 },
        { header: "Đơn vị", key: "unit", width: 32 },
        { header: "Nhận", key: "total", width: 10 },
        { header: "Đã trả lời", key: "responded", width: 12 },
        { header: "Tỷ lệ TL (%)", key: "pct", width: 12 },
        { header: "Hài lòng", key: "like", width: 10 },
        { header: "Chưa hài lòng", key: "unlike", width: 14 },
        { header: "Chưa đánh giá", key: "unrated", width: 14 },
      ],
      rows: fb.byUnit.map((u, i) => ({
        stt: i + 1,
        unit: u.unit,
        total: u.total,
        responded: u.responded,
        pct: pct(u.responded, u.total),
        like: u.like,
        unlike: u.unlike,
        unrated: u.unrated,
      })),
    },
    {
      title: `Ý KIẾN THEO THÁNG – NĂM HỌC ${label}`,
      subtitle: "Số ý kiến nhận, đã trả lời và đánh giá theo tháng (theo ngày gửi).",
      sheetName: "YK theo tháng",
      columns: [
        { header: "Tháng", key: "label", width: 12 },
        { header: "Nhận", key: "total", width: 10 },
        { header: "Đã trả lời", key: "responded", width: 12 },
        { header: "Hài lòng", key: "like", width: 10 },
        { header: "Chưa hài lòng", key: "unlike", width: 14 },
      ],
      rows: fb.byMonth.map((m) => ({ ...m })),
    },
  ]);

  const stamp = new Date().toISOString().slice(0, 10);
  return xlsxResponse(buf, `Thong_ke_tong_hop_${y}_${y + 1}_${stamp}.xlsx`);
}
