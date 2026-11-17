import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { formatDate } from "@/lib/format";
import { schoolYear } from "@/lib/stats";

export default async function LcdStudentsPage({ searchParams }: PageProps<"/lien-chi/sinh-vien">) {
  const me = await requireRole("LCD");
  if (!me.faculty) {
    return <p className="text-muted-foreground">Tài khoản chưa được gán khoa. Liên hệ Đoàn trường.</p>;
  }
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const lop = typeof sp.lop === "string" ? sp.lop : "";
  const sy = schoolYear(new Date());

  const where: Prisma.UserWhereInput = {
    role: "STUDENT",
    faculty: me.faculty,
    ...(lop ? { className: lop } : {}),
    ...(q
      ? { OR: [{ studentId: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] }
      : {}),
  };
  const [classes, students] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT", faculty: me.faculty, className: { not: null } },
      distinct: ["className"],
      select: { className: true },
      orderBy: { className: "asc" },
    }),
    prisma.user.findMany({
      where,
      orderBy: [{ className: "asc" }, { name: "asc" }],
      take: 500,
      select: {
        id: true,
        studentId: true,
        name: true,
        dob: true,
        className: true,
        participations: {
          where: { event: { date: { gte: sy.from, lte: sy.to } } },
          select: { status: true },
        },
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Sinh viên khoa {me.faculty}</h1>
        <p className="text-muted-foreground">Số lượt tính trong năm học {sy.label}</p>
      </div>

      <form className="flex flex-wrap gap-2" action="/lien-chi/sinh-vien">
        <input name="q" defaultValue={q} placeholder="Tìm mã SV, họ tên…" className="h-9 min-w-56 flex-1 rounded-lg border border-input bg-background px-3 text-sm" />
        <select name="lop" defaultValue={lop} className="h-9 rounded-lg border border-input bg-background px-2 text-sm">
          <option value="">Tất cả lớp</option>
          {classes.map((c) => <option key={c.className} value={c.className!}>{c.className}</option>)}
        </select>
        <button type="submit" className="h-9 rounded-lg border px-3 text-sm hover:bg-muted">Lọc</button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Mã SV</th>
              <th className="px-3 py-2 font-medium">Họ tên</th>
              <th className="px-3 py-2 font-medium">Ngày sinh</th>
              <th className="px-3 py-2 font-medium">Lớp</th>
              <th className="px-3 py-2 text-right font-medium">Đã duyệt</th>
              <th className="px-3 py-2 text-right font-medium">Chờ duyệt</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Không có sinh viên phù hợp.</td></tr>
            )}
            {students.map((s) => {
              const n = (st: string) => s.participations.filter((p) => p.status === st).length;
              return (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-2">{s.studentId}</td>
                  <td className="px-3 py-2 font-medium">{s.name}</td>
                  <td className="px-3 py-2">{s.dob ? formatDate(s.dob) : ""}</td>
                  <td className="px-3 py-2">{s.className}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{n("CONFIRMED")}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{n("PENDING")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {students.length === 500 && (
        <p className="text-sm text-muted-foreground">Chỉ hiện 500 sinh viên đầu; dùng ô tìm hoặc lọc theo lớp.</p>
      )}
    </div>
  );
}
