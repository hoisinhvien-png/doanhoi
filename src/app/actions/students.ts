"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { dobPassword, parseStudentWorkbook } from "@/lib/excel-import";
import { formatDate } from "@/lib/format";
import { assignUsernames } from "@/lib/username";

export type PreviewRow = {
  line: number;
  studentId: string;
  name: string;
  dob: string;
  className: string;
  faculty: string;
  errors: string[];
  isNew: boolean;
  username: string; // tên tài khoản (sinh viên mới: dự kiến)
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
    select: { id: true, studentId: true, role: true, username: true },
  });
  const byId = new Map(existing.map((u) => [u.studentId!, u]));
  for (const r of parsed.rows) {
    const u = byId.get(r.studentId);
    if (u && u.role !== "STUDENT") r.errors.push("Mã này đang thuộc tài khoản không phải sinh viên");
  }
  const valid = parsed.rows.filter((r) => r.errors.length === 0);

  // Tên tài khoản cho sinh viên mới và sinh viên cũ chưa có tên tài khoản
  const needName = valid.filter((r) => !byId.get(r.studentId)?.username);
  const usernames = await assignUsernames(needName);
  const usernameOf = (sid: string) => byId.get(sid)?.username ?? usernames.get(sid) ?? "";

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
      username: r.errors.length ? "" : usernameOf(r.studentId),
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

  // Ghi vào CSDL. Sinh viên đã có: cập nhật thông tin, GIỮ NGUYÊN mật khẩu và tên tài khoản.
  const toCreate = valid.filter((r) => !byId.has(r.studentId));
  const toUpdate = valid.filter((r) => byId.has(r.studentId));

  // Mật khẩu ban đầu = ngày sinh; băm nhẹ (cost 8) cho nhanh vì bắt buộc đổi ở lần đăng nhập đầu
  const CHUNK = 200;
  for (let i = 0; i < toCreate.length; i += CHUNK) {
    const part = toCreate.slice(i, i + CHUNK);
    const data = await Promise.all(
      part.map(async (r) => ({
        studentId: r.studentId,
        username: usernames.get(r.studentId) ?? null,
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
  // Cập nhật sinh viên đã có: mỗi 500 dòng một câu lệnh SQL. Máy chủ CSDL ở xa nên chạy từng lệnh
  // update riêng lẻ trong giao dịch sẽ quá giới hạn 5 giây (lỗi P2028). Giữ nguyên tên tài khoản đã có.
  for (let i = 0; i < toUpdate.length; i += 500) {
    const part = toUpdate.slice(i, i + 500);
    await prisma.$executeRaw`
      UPDATE "User" AS u SET
        name = v.name,
        dob = v.dob::date,
        "className" = NULLIF(v.cls, ''),
        faculty = v.faculty,
        username = COALESCE(u.username, NULLIF(v.username, '')),
        "updatedAt" = now()
      FROM unnest(
        ${part.map((r) => r.studentId)}::text[],
        ${part.map((r) => r.name)}::text[],
        ${part.map((r) => r.dob!.toISOString().slice(0, 10))}::text[],
        ${part.map((r) => r.className)}::text[],
        ${part.map((r) => r.faculty)}::text[],
        ${part.map((r) => usernames.get(r.studentId) ?? "")}::text[]
      ) AS v(sid, name, dob, cls, faculty, username)
      WHERE u."studentId" = v.sid AND u.role = 'STUDENT'`;
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

/* ---------------- Thêm / sửa / khoá / xoá từng sinh viên (Bổ sung 20/11/2026) ---------------- */

export type StudentFormState = { error?: string; saved?: boolean } | undefined;

function readStudentForm(formData: FormData) {
  const studentId = String(formData.get("studentId") ?? "").replace(/\s+/g, "").toUpperCase();
  const name = String(formData.get("name") ?? "").replace(/\s+/g, " ").trim();
  const dobMatch = String(formData.get("dob") ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const className = String(formData.get("className") ?? "").trim();
  const faculty = String(formData.get("faculty") ?? "").trim();
  if (!studentId) return { error: "Vui lòng nhập mã sinh viên." } as const;
  if (name.length < 3) return { error: "Vui lòng nhập họ và tên." } as const;
  if (!dobMatch) return { error: "Vui lòng chọn ngày sinh." } as const;
  // Lưu đúng ngày (00:00 UTC) như khi nhập Excel
  const dob = new Date(Date.UTC(Number(dobMatch[1]), Number(dobMatch[2]) - 1, Number(dobMatch[3])));
  if (!faculty) return { error: "Vui lòng nhập khoa (Liên chi Đoàn)." } as const;
  return { data: { studentId, name, dob, className: className || null, faculty } } as const;
}

/** Đoàn trường đăng ký mới một tài khoản sinh viên */
export async function createStudent(_prev: StudentFormState, formData: FormData): Promise<StudentFormState> {
  await requireRole("ADMIN");
  const parsed = readStudentForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  const d = parsed.data;
  if (await prisma.user.findUnique({ where: { studentId: d.studentId } })) {
    return { error: `Mã sinh viên ${d.studentId} đã có trong hệ thống.` };
  }
  const username = (await assignUsernames([d])).get(d.studentId)!;
  const created = await prisma.user.create({
    data: {
      ...d,
      username,
      role: "STUDENT",
      password: await bcrypt.hash(dobPassword(d.dob), 10),
      mustChangePassword: true,
    },
  });
  redirect(`/quan-tri/sinh-vien/${created.id}?moi=1`);
}

/** Sửa thông tin sinh viên (tên tài khoản sửa được, không trùng người khác) */
export async function updateStudent(id: string, _prev: StudentFormState, formData: FormData): Promise<StudentFormState> {
  await requireRole("ADMIN");
  const parsed = readStudentForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  const d = parsed.data;
  const username = String(formData.get("username") ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9_]{3,40}$/.test(username)) {
    return { error: "Tên tài khoản chỉ gồm chữ không dấu, số và dấu gạch dưới (3–40 ký tự)." };
  }
  const clash = await prisma.user.findFirst({
    where: { id: { not: id }, OR: [{ studentId: d.studentId }, { username: { equals: username, mode: "insensitive" } }] },
    select: { studentId: true, username: true },
  });
  if (clash) {
    return {
      error:
        clash.studentId === d.studentId
          ? `Mã sinh viên ${d.studentId} đã thuộc sinh viên khác.`
          : `Tên tài khoản ${username} đã có người dùng.`,
    };
  }
  await prisma.user.updateMany({ where: { id, role: "STUDENT" }, data: { ...d, username } });
  refresh();
  return { saved: true };
}

/** Khoá / mở khoá: tài khoản bị khoá không đăng nhập được, dữ liệu vẫn giữ */
export async function setStudentLocked(id: string, locked: boolean) {
  await requireRole("ADMIN");
  await prisma.user.updateMany({ where: { id, role: "STUDENT" }, data: { locked } });
  refresh();
}

/** Xoá hẳn tài khoản sinh viên cùng toàn bộ lượt đăng ký sự kiện */
export async function deleteStudent(id: string) {
  await requireRole("ADMIN");
  await prisma.user.deleteMany({ where: { id, role: "STUDENT" } });
  redirect("/quan-tri/sinh-vien");
}
