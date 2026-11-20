// Đọc file Excel danh sách sinh viên: tự dò dòng tiêu đề và các cột theo tên.
import "server-only";
import ExcelJS from "exceljs";

export type ImportRow = {
  line: number; // số dòng trong Excel, để báo lỗi
  studentId: string;
  name: string;
  dob: Date | null;
  className: string;
  faculty: string;
  errors: string[];
};

export type ParseResult =
  | { ok: false; error: string }
  | {
      ok: true;
      sheetName: string;
      headerLine: number;
      found: Record<string, string>; // tên cột đã nhận ra, để hiện cho người dùng xem
      rows: ImportRow[];
    };

/** Bỏ dấu, chữ thường, gộp khoảng trắng: "Mã SV" -> "ma sv" */
export function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Các tên tiêu đề hay gặp cho từng cột. So khớp không phân biệt dấu cách,
// nên "TenLop", "Ten lop", "Tên lớp" đều nhận ra.
// Có cả tên cột của file xuất từ phần mềm quản lý đào tạo của trường:
// MaSV, HoLotSV, TenSV, NgaySinhC, TenLop, TenKhoa.
const MATCHERS: Record<string, string[]> = {
  studentId: ["ma sv", "ma sinh vien", "msv", "mssv", "ma so sinh vien", "ma hoc vien"],
  name: ["ho va ten", "ho ten", "ho ten sinh vien", "ho va ten sinh vien", "ho ten sv"],
  lastName: ["ho dem", "ho va dem", "ho lot", "ho lot sv", "ho dem sv", "ho"],
  firstName: ["ten", "ten sv", "ten sinh vien"],
  dob: ["ngay sinh", "ngay sinh c", "ngay thang nam sinh", "ns"],
  className: ["lop", "lop sinh hoat", "ma lop", "ten lop", "lop hoc"],
  // Cột "Khoa" chính là đơn vị Liên chi Đoàn quản lý sinh viên
  faculty: ["khoa", "ten khoa", "khoa vien", "don vi", "lien chi doan", "ten lien chi doan", "lcd"],
};
const compact = (s: string) => s.replace(/ /g, "");
const MATCHERS_COMPACT = Object.entries(MATCHERS).map(
  ([key, names]) => [key, names.map(compact)] as const
);

const LABELS: Record<string, string> = {
  studentId: "Mã SV",
  name: "Họ và tên",
  lastName: "Họ đệm",
  firstName: "Tên",
  dob: "Ngày sinh",
  className: "Lớp",
  faculty: "Khoa (Liên chi Đoàn)",
};

function cellText(v: ExcelJS.CellValue): string {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    if ("richText" in v) return v.richText.map((t) => t.text).join("");
    if ("result" in v) return cellText(v.result as ExcelJS.CellValue);
    if ("text" in v) return String(v.text);
    return "";
  }
  return String(v).trim();
}

function cellDate(v: ExcelJS.CellValue): Date | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) {
    // Excel lưu ngày không có giờ; lấy đúng ngày, đặt 00:00 UTC
    return new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate()));
  }
  if (typeof v === "number") {
    // Số ngày kiểu Excel (tính từ 30/12/1899)
    const ms = Math.round((v - 25569) * 86400 * 1000);
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === "object" && "result" in v) return cellDate(v.result as ExcelJS.CellValue);
  const s = cellText(v);
  const m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/); // dd/MM/yyyy
  if (m) {
    let y = Number(m[3]);
    if (y < 100) y += y > 50 ? 1900 : 2000;
    const d = new Date(Date.UTC(y, Number(m[2]) - 1, Number(m[1])));
    if (d.getUTCDate() === Number(m[1])) return d;
  }
  return null;
}

function matchColumns(row: ExcelJS.Row) {
  const map: Record<string, number> = {};
  row.eachCell((cell, col) => {
    const t = compact(norm(cellText(cell.value)));
    if (!t) return;
    for (const [key, names] of MATCHERS_COMPACT) {
      if (map[key] === undefined && names.includes(t)) {
        map[key] = col;
        return;
      }
    }
  });
  return map;
}

export async function parseStudentWorkbook(
  buffer: ArrayBuffer,
  defaultFaculty: string
): Promise<ParseResult> {
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.load(buffer);
  } catch {
    return { ok: false, error: "Không đọc được file. Hãy lưu file dạng .xlsx (Excel 2007 trở lên)." };
  }

  for (const ws of wb.worksheets) {
    // Dò dòng tiêu đề trong 20 dòng đầu
    for (let r = 1; r <= Math.min(20, ws.rowCount); r++) {
      const map = matchColumns(ws.getRow(r));
      const hasName = map.name !== undefined || map.firstName !== undefined;
      if (map.studentId === undefined || !hasName) continue;

      const found: Record<string, string> = {};
      for (const k of Object.keys(map)) found[LABELS[k]] = ws.getRow(r).getCell(map[k]).text;

      const rows: ImportRow[] = [];
      for (let i = r + 1; i <= ws.rowCount; i++) {
        const row = ws.getRow(i);
        const get = (k: string) => (map[k] ? cellText(row.getCell(map[k]).value) : "");
        const studentId = get("studentId").replace(/\s+/g, "").toUpperCase();
        let name = get("name");
        if (!name) name = [get("lastName"), get("firstName")].filter(Boolean).join(" ");
        name = name.replace(/\s+/g, " ").trim();
        if (!studentId && !name) continue; // dòng trống

        const dob = map.dob ? cellDate(row.getCell(map.dob).value) : null;
        const faculty = get("faculty") || defaultFaculty;
        const errors: string[] = [];
        if (!studentId) errors.push("thiếu Mã SV");
        if (!name) errors.push("thiếu họ tên");
        if (!dob) errors.push("thiếu/sai ngày sinh");
        if (!faculty) errors.push("thiếu khoa");

        rows.push({
          line: i,
          studentId,
          name,
          dob,
          className: get("className"),
          faculty,
          errors,
        });
      }

      // Mã SV trùng ngay trong file
      const seen = new Map<string, number>();
      for (const row of rows) {
        if (!row.studentId) continue;
        const first = seen.get(row.studentId);
        if (first) row.errors.push(`trùng Mã SV với dòng ${first}`);
        else seen.set(row.studentId, row.line);
      }

      return { ok: true, sheetName: ws.name, headerLine: r, found, rows };
    }
  }
  return {
    ok: false,
    error:
      "Không tìm thấy dòng tiêu đề có cột “Mã SV” và “Họ và tên”. Hãy kiểm tra file hoặc tải file mẫu.",
  };
}

/** Mật khẩu ban đầu = ngày sinh dạng ddMMyyyy */
export function dobPassword(dob: Date) {
  const dd = String(dob.getUTCDate()).padStart(2, "0");
  const mm = String(dob.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}${mm}${dob.getUTCFullYear()}`;
}
