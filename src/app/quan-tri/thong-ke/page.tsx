import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { requireRole } from "@/lib/dal";
import { buttonVariants } from "@/components/ui/button";
import {
  currentSchoolYear,
  eventOverview,
  feedbackOverview,
  listSchoolYears,
  schoolYearLabel,
} from "@/lib/overview-stats";

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

export default async function OverviewStatsPage({ searchParams }: PageProps<"/quan-tri/thong-ke">) {
  await requireRole("ADMIN");
  const sp = await searchParams;
  const now = new Date();
  const years = await listSchoolYears(now);
  const raw = typeof sp.nam === "string" ? Number(sp.nam) : NaN;
  const y = years.includes(raw) ? raw : years[0] ?? currentSchoolYear(now);

  const [ev, fb] = await Promise.all([eventOverview(y), feedbackOverview(y)]);

  const input = "h-9 rounded-lg border border-input bg-background px-2";

  return (
    <div className="flex flex-col gap-6">
      <Link href="/quan-tri" className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Tổng quan
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Thống kê tổng hợp</h1>
        <p className="text-muted-foreground">
          Hoạt động và ý kiến của Đoàn trường và các khoa (Liên chi Đoàn) theo năm học và theo từng tháng.
        </p>
      </div>

      <form action="/quan-tri/thong-ke" className="flex flex-wrap items-end gap-2 rounded-xl border bg-background p-4 text-sm">
        <label className="flex flex-col gap-1">
          Năm học
          <select name="nam" defaultValue={String(y)} className={input}>
            {years.map((yy) => (
              <option key={yy} value={yy}>
                {schoolYearLabel(yy)}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={buttonVariants({ variant: "outline", className: "h-9" })}>Xem</button>
        <a
          href={`/api/excel/thong-ke?nam=${y}`}
          className={buttonVariants({ variant: "default", className: "h-9 ml-auto inline-flex items-center gap-1" })}
        >
          <Download className="size-4" /> Xuất Excel
        </a>
      </form>

      {/* ===== A. Hoạt động ===== */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">A. Hoạt động (sự kiện) – năm học {schoolYearLabel(y)}</h2>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatBox label="Tổng hoạt động" value={ev.total} />
          <StatBox label="Đoàn trường tạo" value={ev.doanTruong} tone="emerald" />
          <StatBox label="Các khoa tạo" value={ev.khoa} tone="sky" />
          {ev.unknown > 0 && <StatBox label="Không rõ đơn vị" value={ev.unknown} tone="amber" hint="tạo trước khi lưu người tạo, hoặc tài khoản đã xoá" />}
        </div>

        {ev.total === 0 ? (
          <Empty>Chưa có hoạt động nào trong năm học {schoolYearLabel(y)}.</Empty>
        ) : (
          <>
            <h3 className="mt-2 font-medium">Theo đơn vị tạo</h3>
            <TableWrap>
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Đơn vị</th>
                  <th className="px-3 py-2 font-medium">Số hoạt động</th>
                  <th className="px-3 py-2 font-medium">Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                {ev.byUnit.map((u) => (
                  <tr key={u.unit} className="border-t">
                    <td className="px-3 py-2 font-medium">{u.unit}</td>
                    <td className="px-3 py-2 tabular-nums">{u.count}</td>
                    <td className="px-3 py-2 tabular-nums">{pct(u.count, ev.total)}%</td>
                  </tr>
                ))}
                <tr className="border-t bg-muted/30 font-semibold">
                  <td className="px-3 py-2">Tổng</td>
                  <td className="px-3 py-2 tabular-nums">{ev.total}</td>
                  <td className="px-3 py-2 tabular-nums">100%</td>
                </tr>
              </tbody>
            </TableWrap>

            <h3 className="mt-2 font-medium">Theo tháng</h3>
            <TableWrap>
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Tháng</th>
                  <th className="px-3 py-2 font-medium">Đoàn trường</th>
                  <th className="px-3 py-2 font-medium">Các khoa</th>
                  <th className="px-3 py-2 font-medium">Tổng</th>
                </tr>
              </thead>
              <tbody>
                {ev.byMonth.map((m) => (
                  <tr key={m.label} className="border-t">
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{m.label}</td>
                    <td className="px-3 py-2 tabular-nums">{m.doanTruong}</td>
                    <td className="px-3 py-2 tabular-nums">{m.khoa}</td>
                    <td className="px-3 py-2 tabular-nums">{m.total}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </>
        )}
      </section>

      {/* ===== B. Ý kiến ===== */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">B. Ý kiến &amp; phản hồi – năm học {schoolYearLabel(y)}</h2>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatBox label="Tổng ý kiến nhận" value={fb.total} />
          <StatBox label="Đã trả lời" value={fb.responded} tone="emerald" hint={`${pct(fb.responded, fb.total)}% tổng số`} />
          <StatBox label="👍 Hài lòng" value={fb.like} tone="emerald" />
          <StatBox label="👎 Chưa hài lòng" value={fb.unlike} tone="amber" />
        </div>

        {fb.total === 0 ? (
          <Empty>Chưa có ý kiến nào trong năm học {schoolYearLabel(y)}.</Empty>
        ) : (
          <>
            <h3 className="mt-2 font-medium">Theo đơn vị nhận</h3>
            <TableWrap>
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Đơn vị</th>
                  <th className="px-3 py-2 font-medium">Nhận</th>
                  <th className="px-3 py-2 font-medium">Đã trả lời</th>
                  <th className="px-3 py-2 font-medium">Tỷ lệ TL</th>
                  <th className="px-3 py-2 font-medium">👍</th>
                  <th className="px-3 py-2 font-medium">👎</th>
                  <th className="px-3 py-2 font-medium">Chưa ĐG</th>
                </tr>
              </thead>
              <tbody>
                {fb.byUnit.map((u) => (
                  <tr key={u.unit} className="border-t">
                    <td className="px-3 py-2 font-medium">{u.unit}</td>
                    <td className="px-3 py-2 tabular-nums">{u.total}</td>
                    <td className="px-3 py-2 tabular-nums">{u.responded}</td>
                    <td className="px-3 py-2 tabular-nums">{pct(u.responded, u.total)}%</td>
                    <td className="px-3 py-2 tabular-nums">{u.like}</td>
                    <td className="px-3 py-2 tabular-nums">{u.unlike}</td>
                    <td className="px-3 py-2 tabular-nums">{u.unrated}</td>
                  </tr>
                ))}
                <tr className="border-t bg-muted/30 font-semibold">
                  <td className="px-3 py-2">Tổng</td>
                  <td className="px-3 py-2 tabular-nums">{fb.total}</td>
                  <td className="px-3 py-2 tabular-nums">{fb.responded}</td>
                  <td className="px-3 py-2 tabular-nums">{pct(fb.responded, fb.total)}%</td>
                  <td className="px-3 py-2 tabular-nums">{fb.like}</td>
                  <td className="px-3 py-2 tabular-nums">{fb.unlike}</td>
                  <td className="px-3 py-2 tabular-nums">{fb.unrated}</td>
                </tr>
              </tbody>
            </TableWrap>
            <p className="text-xs text-muted-foreground">
              Đã trả lời = ý kiến có ít nhất 1 lượt trả lời của cán bộ. 👍/👎 = đánh giá của sinh viên sau khi nhận phản hồi; Chưa ĐG = đã trả lời nhưng sinh viên chưa đánh giá.
            </p>

            <h3 className="mt-2 font-medium">Theo tháng</h3>
            <TableWrap>
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Tháng</th>
                  <th className="px-3 py-2 font-medium">Nhận</th>
                  <th className="px-3 py-2 font-medium">Đã trả lời</th>
                  <th className="px-3 py-2 font-medium">👍</th>
                  <th className="px-3 py-2 font-medium">👎</th>
                </tr>
              </thead>
              <tbody>
                {fb.byMonth.map((m) => (
                  <tr key={m.label} className="border-t">
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{m.label}</td>
                    <td className="px-3 py-2 tabular-nums">{m.total}</td>
                    <td className="px-3 py-2 tabular-nums">{m.responded}</td>
                    <td className="px-3 py-2 tabular-nums">{m.like}</td>
                    <td className="px-3 py-2 tabular-nums">{m.unlike}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </>
        )}
      </section>
    </div>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-background">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed bg-background p-8 text-center text-muted-foreground">{children}</div>
  );
}

function StatBox({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: "emerald" | "amber" | "sky";
}) {
  const color =
    tone === "emerald"
      ? "text-emerald-700 dark:text-emerald-300"
      : tone === "amber"
        ? "text-amber-700 dark:text-amber-300"
        : tone === "sky"
          ? "text-sky-700 dark:text-sky-300"
          : "text-foreground";
  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
