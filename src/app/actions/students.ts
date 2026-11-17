"use server";

import bcrypt from "bcryptjs";
import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { dobPassword, parseStudentWorkbook } from "@/lib/excel-import";
import { formatDate } from "@/lib/format";

export type PreviewRow = {
  line: number;
  studentId: string;
  name: string;
  dob: string;
  className: string;
  faculty: string;
  errors: string[];
  isNew: boolean;
};

export type ImportState =
  | undefined
  | { error: string }
  | {
      mode: "preview";
      sheetName: string;
      headerLine: number;
      found: Record<string, string>;
      total: number;
      valid: number;
      newCount: number;
      updateCount: number;
      sample: PreviewRow[]; // vài dòng đầu + các dòng lỗi
    }
  | { mode: "done"; created: number; updated: number; skipped: number };

const MAX_BYTES = 4 * 1024 * 1024;

/** Bước 1 (mode=preview): đọc file, cho xem trước. Bước 2 (mode=import): ghi vào CSDL. */
export async function importStudents(_prev: ImportState, formData: FormData): Promise<ImportState> {
  await requireRole("ADMIN");
  const file = formData.get("file");
  const mode = formData.get("mode") === "import" ? "import" : "preview";
  const defaultFaculty = String(formData.get("defaultFaculty") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) return { error: "Vui lòng chọn file Excel (.xlsx)." };
  if (file.size > MAX_BYTES) return { error: "File quá lớn (tối đa 4MB). Hãy tách thành nhiều file." };

  const parsed = await parseStudentWorkbook(await file.arrayBuffer(), defaultFaculty);
  if (!parsed.ok) return { error: parsed.error };

  const ids = parsed.rows.map((r) => r.studentId).filter(Boolean);
  const existing = await prisma.user.findMany({
    where: { studentId: { in: ids } },
    select: { id: true, studentId: true, role: true },
  });
  const byId = new Map(existing.map((u) => [u.studentId!, u]));
  for (const r of parsed.rows) {
    const u = byId.get(r.studentId);
    if (u && u.role !== "STUDENT") r.errors.push("Mã này đang thuộc tài khoản không phải sinh viên");
  }
  const valid = parsed.rows.filter((r) => r.errors.length === 0);

  if (mode === "preview") {
    const toPreview = (r: (typeof parsed.rows)[number]): PreviewRow => ({
      line: r.line,
      studentId: r.studentId,
      name: r.name,
      dob: r.dob ? formatDate(r.dob) : "",
      className: r.className,
      faculty: r.faculty,
      errors: r.errors,
      isNew: !byId.has(r.studentId),
    });
    const errorRows = parsed.rows.filter((r) => r.errors.length > 0).slice(0, 100);
    const firstRows = valid.slice(0, 10);
    return {
      mode: "preview",
      sheetName: parsed.sheetName,
      headerLine: parsed.headerLine,
      found: parsed.found,
      total: parsed.rows.length,
      valid: valid.length,
      newCount: valid.filter((r) => !byId.has(r.studentId)).length,
      updateCount: valid.filter((r) => byId.has(r.studentId)).length,
      sample: [...firstRows, ...errorRows].map(toPreview),
    };
  }

  // Ghi vào CSDL. Sinh viên đã có: cập nhật thông tin, GIỮ NGUYÊN mật khẩu.
  const toCreate = valid.filter((r) => !byId.has(r.studentId));
  const toUpdate = valid.filter((r) => byId.has(r.studentId));

  // Mật khẩu ban đầu = ngày sinh; băm nhẹ (cost 8) cho nhanh vì bắt buộc đổi ở lần đăng nhập đầu
  const CHUNK = 200;
  for (let i = 0; i < toCreate.length; i += CHUNK) {
    const part = toCreate.slice(i, i + CHUNK);
    const data = await Promise.all(
      part.map(async (r) => ({
        studentId: r.studentId,
        name: r.name,
        dob: r.dob,
        className: r.className || null,
        faculty: r.faculty,
        role: "STUDENT" as const,
        password: await bcrypt.hash(dobPassword(r.dob!), 8),
        mustChangePassword: true,
      }))
    );
    await prisma.user.createMany({ data, skipDuplicates: true });
  }
  for (let i = 0; i < toUpdate.length; i += CHUNK) {
    await prisma.$transaction(
      toUpdate.slice(i, i + CHUNK).map((r) =>
        prisma.user.update({
          where: { studentId: r.studentId },
          data: { name: r.name, dob: r.dob, className: r.className || null, faculty: r.faculty },
        })
      )
    );
  }

  refresh();
  return {
    mode: "done",
    created: toCreate.length,
    updated: toUpdate.length,
    skipped: parsed.rows.length - valid.length,
  };
}

/** Đặt lại mật khẩu một sinh viên về ngày sinh (khi sinh viên quên) */
export async function resetStudentPassword(userId: string) {
  await requireRole("ADMIN");
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u || u.role !== "STUDENT" || !u.dob) return;
  await prisma.user.update({
    where: { id: userId },
    data: { password: await bcrypt.hash(dobPassword(u.dob), 10), mustChangePassword: true },
  });
  refresh();
}
