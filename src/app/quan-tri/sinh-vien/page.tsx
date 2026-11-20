import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { getFaculties } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { Download, Lock, UserPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ImportPanel } from "./import-panel";

const PAGE_SIZE = 50;

// Nhập một lần cả nghìn sinh viên (băm mật khẩu ban đầu) mất khoảng 30 giây;
// cho phép server action trên trang này chạy tới 60 giây.
export const maxDuration = 60;

export default async function AdminStudentsPage({ searchParams }: PageProps<"/quan-tri/sinh-vien">) {
  await requireRole("ADMIN");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const khoa = typeof sp.khoa === "string" ? sp.khoa : "";
  const page = Math.max(1, Number(sp.trang) || 1);

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
  const [faculties, total, students] = await Promise.all([
    getFaculties(),
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ faculty: "asc" }, { className: "asc" }, { studentId: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, studentId: true, username: true, name: true, dob: true, className: true, faculty: true, locked: true },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (p: number) =>
    `/quan-tri/sinh-vien?${new URLSearchParams({ ...(q && { q }), ...(khoa && { khoa }), trang: String(p) })}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Sinh viên</h1>
          <p className="text-muted-foreground">{total} sinh viên</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Xuất theo đúng bộ lọc đang chọn bên dưới (khoa, từ khoá) */}
          <a
            href={`/api/excel/tai-khoan-sinh-vien?${new URLSearchParams({ ...(q && { q }), ...(khoa && { khoa }) })}`}
            className={buttonVariants({ variant: "outline", className: "h-10 px-4" })}
          >
            <Download className="size-4" /> Xuất tài khoản{khoa ? ` khoa ${khoa}` : ""}
          </a>
          <Link href="/quan-tri/sinh-vien/moi" className={buttonVariants({ className: "h-10 px-4" })}>
            <UserPlus className="size-4" /> Đăng ký tài khoản mới
          </Link>
        </div>
      </div>

      <ImportPanel faculties={faculties} />

      <section className="flex flex-col gap-3">
        <form className="flex flex-wrap gap-2" action="/quan-tri/sinh-vien">
          <input
            name="q"
            defaultValue={q}
            placeholder="Tìm mã SV, tên tài khoản, họ tên, lớp…"
            className="h-9 min-w-56 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
          />
          <select name="khoa" defaultValue={khoa} className="h-9 rounded-lg border border-input bg-background px-2 text-sm">
            <option value="">Tất cả khoa</option>
            {faculties.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <button type="submit" className="h-9 rounded-lg border px-3 text-sm hover:bg-muted">Tìm</button>
        </form>

        <div className="overflow-x-auto rounded-xl border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Mã SV</th>
                <th className="px-3 py-2 font-medium">Tên tài khoản</th>
                <th className="px-3 py-2 font-medium">Họ tên</th>
                <th className="px-3 py-2 font-medium">Ngày sinh</th>
                <th className="px-3 py-2 font-medium">Lớp</th>
                <th className="px-3 py-2 font-medium">Khoa</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">Không có sinh viên phù hợp.</td></tr>
              )}
              {students.map((s) => (
                <tr key={s.id} className={s.locked ? "border-t bg-muted/50 text-muted-foreground" : "border-t"}>
                  <td className="px-3 py-2">{s.studentId}</td>
                  <td className="px-3 py-2 font-mono text-xs">{s.username}</td>
                  <td className="px-3 py-2 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {s.locked && <Lock className="size-3.5" aria-label="Đã khoá" />}
                      {s.name}
                    </span>
                  </td>
                  <td className="px-3 py-2">{s.dob ? formatDate(s.dob) : ""}</td>
                  <td className="px-3 py-2">{s.className}</td>
                  <td className="px-3 py-2">{s.faculty}</td>
                  <td className="px-3 py-2 text-right">
                    <Link href={`/quan-tri/sinh-vien/${s.id}`} className={buttonVariants({ variant: "outline", size: "xs" })}>
                      Sửa / Khoá / Xoá
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 text-sm">
            {page > 1 && <Link href={link(page - 1)} className="rounded border px-3 py-1 hover:bg-muted">← Trước</Link>}
            <span>Trang {page}/{pages}</span>
            {page < pages && <Link href={link(page + 1)} className="rounded border px-3 py-1 hover:bg-muted">Sau →</Link>}
          </div>
        )}
      </section>
    </div>
  );
}
