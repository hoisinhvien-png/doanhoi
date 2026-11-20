// Trang báo cáo dùng chung cho Đoàn trường và LCĐ: lọc, xem số lượng, xuất Excel.
import { Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getFaculties } from "@/lib/queries";
import { reportWhere, type ReportParams } from "@/lib/report";
import { buttonVariants } from "@/components/ui/button";

export async function ReportPage({
  basePath,
  params,
  forcedFaculty,
}: {
  basePath: string;
  params: ReportParams;
  forcedFaculty?: string; // LCĐ: khoa của mình
}) {
  const scopeUser = forcedFaculty ? { faculty: forcedFaculty } : {};
  const [faculties, classes, events, count] = await Promise.all([
    forcedFaculty ? Promise.resolve([]) : getFaculties(),
    prisma.user.findMany({
      where: { role: "STUDENT", className: { not: null }, ...scopeUser, ...(params.khoa && !forcedFaculty ? { faculty: params.khoa } : {}) },
      distinct: ["className"],
      select: { className: true },
      orderBy: { className: "asc" },
    }),
    prisma.event.findMany({ orderBy: { date: "desc" }, select: { id: true, title: true } }),
    prisma.eventParticipation.count({ where: reportWhere(params, forcedFaculty) }),
  ]);

  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v) as [string, string][]
  ).toString();
  const select = "h-9 rounded-lg border border-input bg-background px-2";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Xuất báo cáo Excel</h1>
        <p className="text-muted-foreground">
          Danh sách sinh viên đăng ký sự kiện{forcedFaculty ? ` – khoa ${forcedFaculty}` : ""}
        </p>
      </div>

      <form action={basePath} className="grid gap-3 rounded-xl border bg-background p-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm sm:col-span-3">
          Sự kiện
          <select name="sk" defaultValue={params.sk} className={select}>
            <option value="">Tất cả sự kiện</option>
            {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Sự kiện diễn ra từ ngày
          <input type="date" name="tu" defaultValue={params.tu} className={select} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          đến ngày
          <input type="date" name="den" defaultValue={params.den} className={select} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Trạng thái
          <select name="tt" defaultValue={params.tt} className={select}>
            <option value="">Tất cả</option>
            <option value="CONFIRMED">Tham gia</option>
            <option value="NOT">Không tham gia</option>
          </select>
        </label>
        {!forcedFaculty && (
          <label className="flex flex-col gap-1 text-sm">
            Khoa
            <select name="khoa" defaultValue={params.khoa} className={select}>
              <option value="">Tất cả khoa</option>
              {faculties.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm">
          Lớp
          <select name="lop" defaultValue={params.lop} className={select}>
            <option value="">Tất cả lớp</option>
            {classes.map((c) => <option key={c.className} value={c.className!}>{c.className}</option>)}
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className={buttonVariants({ variant: "outline", className: "h-9 w-full" })}>
            Áp dụng bộ lọc
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-4">
        <p>
          Có <b className="text-lg">{count}</b> lượt đăng ký khớp bộ lọc.
        </p>
        <a
          href={`/api/excel/dang-ky${qs ? `?${qs}` : ""}`}
          className={buttonVariants({ className: "h-10 px-5" })}
          aria-disabled={count === 0}
        >
          <Download className="size-4" /> Tải file Excel
        </a>
      </div>
    </div>
  );
}
