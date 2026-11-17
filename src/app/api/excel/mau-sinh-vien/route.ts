// Tải file mẫu nhập danh sách sinh viên
import ExcelJS from "exceljs";
import { apiUser, forbidden, xlsxResponse } from "@/lib/api-auth";

export async function GET() {
  if (!(await apiUser(["ADMIN"]))) return forbidden();

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Danh sách");
  ws.columns = [
    { header: "STT", key: "stt", width: 6 },
    { header: "Mã SV", key: "ma", width: 14 },
    { header: "Họ và tên", key: "ten", width: 28 },
    { header: "Ngày sinh", key: "ns", width: 14 },
    { header: "Lớp", key: "lop", width: 18 },
    { header: "Khoa", key: "khoa", width: 26 },
  ];
  ws.getRow(1).font = { bold: true };
  ws.addRow({ stt: 1, ma: "2201001", ten: "Nguyễn Văn A", ns: "05/09/2004", lop: "K45 CNTT", khoa: "Công nghệ thông tin" });
  ws.addRow({ stt: 2, ma: "2201002", ten: "Trần Thị B", ns: "17/03/2004", lop: "K45 CNTT", khoa: "Công nghệ thông tin" });
  ws.getColumn("ns").numFmt = "@"; // ngày sinh dạng chữ dd/MM/yyyy

  return xlsxResponse(await wb.xlsx.writeBuffer(), "Mau_nhap_sinh_vien.xlsx");
}
