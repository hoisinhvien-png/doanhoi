import { Download } from "lucide-react";
import { requireRole } from "@/lib/dal";
import { getFaculties } from "@/lib/queries";
import { computeGrades, defaultRange, getGradingRules, parseDateInput } from "@/lib/grading";
import { buttonVariants } from "@/components/ui/button";
import { RulesForm } from "./rules-form";

export default async function GradingPage({ searchParams }: PageProps<"/quan-tri/xep-loai">) {
  await requireRole("ADMIN");
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const def = defaultRange(new Date());
  const tu = str("tu") || def.from;
  const den = str("den") || def.to;
  const khoa = str("khoa");
  const lop = str("lop").trim();

  const from = parseDateInput(tu);
  const to = parseDateInput(den, true);
  const [faculties, rules] = await Promise.all([getFaculties(), getGradingRules()]);
  const rows = from && to && from <= to ? await computeGrades({ from, to, faculty: khoa, className: lop }) : null;

  const summary = rules.map((r) => ({ label: r.label, n: rows?.filter((x) => x.grade === r.label).length ?? 0 }));
  const exportHref = `/api/excel/xep-loai?${new URLSearchParams({ tu, den, ...(khoa && { khoa }), ...(lop && { lop }) })}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Đánh giá xếp loại đoàn viên</h1>
        <p className="text-sm text-muted-foreground">
          Điểm = số sự kiện được duyệt ÷ số sự kiện sinh viên được tham gia (toàn trường + khoa mình) trong khoảng thời gian × 10.
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Ngưỡng xếp loại (thang 10)</h2>
        <RulesForm rules={rules} />
      </section>

      <form action="/quan-tri/xep-loai" className="grid gap-3 rounded-xl border bg-background p-4 sm:grid-cols-5 sm:items-end">
        <label className="flex flex-col gap-1 text-sm">
          Từ ngày
          <input type="date" name="tu" defaultValue={tu} className="h-9 rounded-lg border border-input bg-transparent px-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Đến ngày
          <input type="date" name="den" defaultValue={den} className="h-9 rounded-lg border border-input bg-transparent px-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Khoa
          <select name="khoa" defaultValue={khoa} className="h-9 rounded-lg border border-input bg-background px-2">
            <option value="">Tất cả khoa</option>
            {faculties.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Lớp
          <input name="lop" defaultValue={lop} placeholder="VD: K45 CNTT" className="h-9 rounded-lg border border-input bg-transparent px-2" />
        </label>
        <button type="submit" className={buttonVariants({ className: "h-9" })}>Xem kết quả</button>
      </form>

      {!rows ? (
        <p className="text-destructive">Khoảng ngày không hợp lệ.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-lg bg-muted px-3 py-1.5">Tổng: <b>{rows.length}</b></span>
              {summary.map((s) => (
                <span key={s.label} className="rounded-lg bg-muted px-3 py-1.5">{s.label}: <b>{s.n}</b></span>
              ))}
            </div>
            <a href={exportHref} className={buttonVariants({ variant: "outline", className: "h-9" })}>
              <Download className="size-4" /> Xuất Excel
            </a>
          </div>
          <div className="overflow-x-auto rounded-xl border bg-background">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Mã SV</th>
                  <th className="px-3 py-2 font-medium">Họ tên</th>
                  <th className="px-3 py-2 font-medium">Lớp</th>
                  <th className="px-3 py-2 font-medium">Khoa</th>
                  <th className="px-3 py-2 text-right font-medium">Được duyệt / Được tham gia</th>
                  <th className="px-3 py-2 text-right font-medium">Điểm</th>
                  <th className="px-3 py-2 font-medium">Xếp loại</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">Không có sinh viên phù hợp.</td></tr>
                )}
                {rows.slice(0, 500).map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">{r.studentId}</td>
                    <td className="px-3 py-2 font-medium">{r.name}</td>
                    <td className="px-3 py-2">{r.className}</td>
                    <td className="px-3 py-2">{r.faculty}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.confirmed} / {r.eligible}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.score?.toFixed(2) ?? "—"}</td>
                    <td className="px-3 py-2">{r.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 500 && (
            <p className="text-sm text-muted-foreground">Trang chỉ hiện 500 dòng đầu; bấm “Xuất Excel” để lấy đủ {rows.length} dòng.</p>
          )}
        </>
      )}
    </div>
  );
}
