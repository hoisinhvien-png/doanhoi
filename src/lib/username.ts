// Tên tài khoản sinh viên (Bổ sung 20/11/2026):
//   TÊN + chữ đầu họ đệm + 4 số cuối mã SV + "_" + viết tắt khoa
//   Trần Huyền Diệu, mã 11231302025, khoa Ngoại ngữ -> DIEUTH2025_NN
// Thử trên danh sách 1.425 sinh viên năm học 2026-2027: không trùng ai.
// Nếu vẫn trùng (hiếm), thêm số 2, 3… sau phần mã: DIEUTH20252_NN.
import "server-only";
import { prisma } from "./prisma";

/** Bỏ dấu, chỉ giữ chữ và số, viết hoa: "Diệu" -> "DIEU" */
export function plain(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
}

// Viết tắt khoa theo quy định của Đoàn trường
const FACULTY_CODES: Record<string, string> = {
  "NGOAINGU": "NN",
  "KYTHUATCONGNGHE": "KTCN",
  "SUPHAM": "SP",
  "KINHTEQTKD": "KT",
  "KINHTE": "KT",
  "CHINHTRILUAT": "CTL",
  "NONGNGHIEPVAMOITRUONG": "NNMT", // khác Ngoại ngữ (NN)
};

/** "Kỹ thuật - Công nghệ" -> "KTCN"; khoa chưa có trong bảng thì lấy chữ đầu mỗi từ */
export function facultyCode(faculty: string | null | undefined) {
  if (!faculty) return "SV";
  const words = faculty
    .split(/[\s\-–—,.&/]+/)
    .map(plain)
    .filter(Boolean);
  if (words[0] === "KHOA" && words.length > 1) words.shift();
  return FACULTY_CODES[words.join("")] ?? words.filter((w) => w !== "VA").map((w) => w[0]).join("");
}

/** Tên tài khoản gốc (chưa xử lý trùng) */
export function baseUsername(name: string, studentId: string, faculty: string | null | undefined) {
  const parts = name.trim().split(/\s+/).map(plain).filter(Boolean);
  const given = parts.at(-1) ?? "SV";
  const initials = parts.slice(0, -1).map((w) => w[0]).join("");
  const digits = studentId.replace(/\D/g, "").slice(-4) || plain(studentId).slice(-4);
  return { stem: `${given}${initials}${digits}`, code: facultyCode(faculty) };
}

/**
 * Đặt tên tài khoản cho nhiều sinh viên một lần, tránh trùng với nhau và với dữ liệu đã có.
 * Trả về Map mã SV -> tên tài khoản.
 */
export async function assignUsernames(
  students: { studentId: string; name: string; faculty: string | null }[]
) {
  const wanted = students.map((s) => ({ s, ...baseUsername(s.name, s.studentId, s.faculty) }));
  // Lấy các tên đang dùng có cùng phần đầu để tránh trùng
  const stems = [...new Set(wanted.map((w) => w.stem))];
  const taken = new Set<string>();
  for (let i = 0; i < stems.length; i += 500) {
    const rows = await prisma.user.findMany({
      where: { OR: stems.slice(i, i + 500).map((stem) => ({ username: { startsWith: stem } })) },
      select: { username: true },
    });
    for (const r of rows) if (r.username) taken.add(r.username);
  }

  const out = new Map<string, string>();
  for (const w of wanted) {
    let candidate = `${w.stem}_${w.code}`;
    for (let n = 2; taken.has(candidate); n++) candidate = `${w.stem}${n}_${w.code}`;
    taken.add(candidate);
    out.set(w.s.studentId, candidate);
  }
  return out;
}
