// Tạo file Excel có định dạng sẵn: tiêu đề, dòng mô tả, bảng có viền, cột vừa chữ.
import "server-only";
import ExcelJS from "exceljs";

export type Column = { header: string; key: string; width?: number };

export type SheetSpec = {
  title: string;
  subtitle?: string;
  sheetName: string;
  columns: Column[];
  rows: Record<string, string | number | null | undefined>[];
};

function newWorkbook() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Hệ thống theo dõi hoạt động Đoàn – Hội HTU";
  wb.created = new Date();
  return wb;
}

/** Điền một bảng có định dạng (tiêu đề, mô tả, header, viền) vào một worksheet đã tạo */
function fillSheet(ws: ExcelJS.Worksheet, opts: SheetSpec) {
  const n = opts.columns.length;

  // Dòng 1-2: tiêu đề và mô tả
  ws.mergeCells(1, 1, 1, n);
  ws.getCell(1, 1).value = opts.title;
  ws.getCell(1, 1).font = { bold: true, size: 14, color: { argb: "FF0072BC" } };
  if (opts.subtitle) {
    ws.mergeCells(2, 1, 2, n);
    ws.getCell(2, 1).value = opts.subtitle;
    ws.getCell(2, 1).font = { italic: true, color: { argb: "FF555555" } };
  }

  // Dòng 4: tiêu đề cột
  const headerRow = ws.getRow(4);
  opts.columns.forEach((c, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = c.header;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0072BC" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    ws.getColumn(i + 1).width = c.width ?? Math.max(12, c.header.length + 4);
  });
  headerRow.height = 22;

  opts.rows.forEach((r, ri) => {
    const row = ws.getRow(5 + ri);
    opts.columns.forEach((c, i) => {
      row.getCell(i + 1).value = r[c.key] ?? "";
    });
  });

  // Viền mỏng cho cả bảng
  const last = 4 + opts.rows.length;
  for (let r = 4; r <= last; r++) {
    for (let c = 1; c <= n; c++) {
      ws.getCell(r, c).border = {
        top: { style: "thin", color: { argb: "FFBBBBBB" } },
        left: { style: "thin", color: { argb: "FFBBBBBB" } },
        bottom: { style: "thin", color: { argb: "FFBBBBBB" } },
        right: { style: "thin", color: { argb: "FFBBBBBB" } },
      };
    }
  }
  ws.views = [{ state: "frozen", ySplit: 4 }];
  ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: n } };
}

/** Tạo file Excel một sheet */
export async function buildSheet(opts: SheetSpec) {
  const wb = newWorkbook();
  fillSheet(wb.addWorksheet(opts.sheetName.slice(0, 31)), opts);
  return wb.xlsx.writeBuffer();
}

/** Tạo file Excel nhiều sheet trong cùng một workbook */
export async function buildMultiSheet(sheets: SheetSpec[]) {
  const wb = newWorkbook();
  for (const s of sheets) fillSheet(wb.addWorksheet(s.sheetName.slice(0, 31)), s);
  return wb.xlsx.writeBuffer();
}
