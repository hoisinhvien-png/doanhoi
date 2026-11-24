import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/dal";
import { formatDate } from "@/lib/format";
import { defaultRange, parseDateInput } from "@/lib/grading";
import { CATEGORY_LABEL, CATEGORY_ORDER, RECIPIENT_LABEL } from "@/lib/feedback";
import { feedbackStats } from "@/lib/feedback-stats";
import { buttonVariants } from "@/components/ui/button";

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

export default async function FeedbackStatsPage({ searchParams }: PageProps<"/quan-tri/y-kien/thong-ke">) {
  await requireRole("ADMIN");
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const now = new Date();
  const def = defaultRange(now);
  const tu = str("tu") || def.from;
  const den = str("den") || def.to;
  const from = parseDateInput(tu);
  const to = parseDateInput(den, true);
  const valid = from && to && from <= to;
  const stats = valid ? await feedbackStats(from, to) : null;

  const input = "h-9 rounded-lg border border-input bg-background px-2";

  return (
    <div className="flex flex-col gap-6">
      <Link href="/quan-tri/y-kien" className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Danh sách ý kiến
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Thống kê ý kiến</h1>
        <p className="text-muted-foreground">
          Tổng hợp ý kiến theo loại, theo khoa và số đã phản hồi trong khoảng thời gian chọn.
        </p>
      </div>

      <form action="/quan-tri/y-kien/thong-ke" className="flex flex-wrap items-end gap-2 rounded-xl border bg-background p-4 text-sm">
        <label className="flex flex-col gap-1">
          Từ ngày (gửi ý kiến)
          <input type="date" name="tu" defaultValue={tu} className={input} />
        </label>
        <label className="flex flex-col gap-1">
          Đến ngày
          <input type="date" name="den" defaultValue={den} className={input} />
        </label>
        <button type="submit" className={buttonVariants({ variant: "outline", className: "h-9" })}>Xem</button>
        <span className="ml-1 text-muted-foreground">Mặc định: từ đầu năm học tới hôm nay.</span>
      </form>

      {!stats ? (
        <p className="text-destructive">Khoảng ngày không hợp lệ.</p>
      ) : stats.total === 0 ? (
        <div className="rounded-2xl border border-dashed bg-background p-10 text-center text-muted-foreground">
          Không có ý kiến nào trong khoảng {formatDate(from!)} – {formatDate(to!)}.
        </div>
      ) : (
        <>
          {/* Tổng quan */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatBox label="Tổng ý kiến" value={stats.total} />
            <StatBox label="Đã phản hồi" value={stats.responded} hint={`${pct(stats.responded, stats.total)}% tổng số`} tone="emerald" />
            <StatBox label="Chờ xử lý" value={stats.open} tone="amber" />
            <StatBox label="Đã đóng" value={stats.closed} />
          </div>

          {/* Mức độ hài lòng của sinh viên */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Mức độ hài lòng của sinh viên</h2>
            <div className="grid grid-cols-3 gap-3">
              <StatBox label="👍 Hài lòng" value={stats.like} tone="emerald" />
              <StatBox label="👎 Chưa hài lòng" value={stats.unlike} />
              <StatBox label="Chưa đánh giá" value={stats.unrated} hint="đã phản hồi, SV chưa đánh giá" />
            </div>
          </section>

          {/* Theo nơi nhận */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Theo nơi nhận</h2>
            <div className="overflow-x-auto rounded-xl border bg-background">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium">Nơi nhận</th>
                    <th className="px-3 py-2 font-medium">Số ý kiến</th>
                    <th className="px-3 py-2 font-medium">Đã phản hồi</th>
                    <th className="px-3 py-2 font-medium">Tỷ lệ phản hồi</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byRecipient.map((r) => (
                    <tr key={r.recipient} className="border-t">
                      <td className="px-3 py-2 font-medium">{RECIPIENT_LABEL[r.recipient]}</td>
                      <td className="px-3 py-2 tabular-nums">{r.total}</td>
                      <td className="px-3 py-2 tabular-nums">{r.responded}</td>
                      <td className="px-3 py-2 tabular-nums">{pct(r.responded, r.total)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Theo loại */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Theo loại ý kiến</h2>
            <div className="overflow-x-auto rounded-xl border bg-background">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium">Loại</th>
                    <th className="px-3 py-2 font-medium">Số ý kiến</th>
                    <th className="px-3 py-2 font-medium">Đã phản hồi</th>
                    <th className="px-3 py-2 font-medium">Tỷ lệ phản hồi</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byCategory.map((c) => (
                    <tr key={c.category} className="border-t">
                      <td className="px-3 py-2 font-medium">{CATEGORY_LABEL[c.category]}</td>
                      <td className="px-3 py-2 tabular-nums">{c.total}</td>
                      <td className="px-3 py-2 tabular-nums">{c.responded}</td>
                      <td className="px-3 py-2 tabular-nums">{pct(c.responded, c.total)}%</td>
                    </tr>
                  ))}
                  <tr className="border-t bg-muted/30 font-semibold">
                    <td className="px-3 py-2">Toàn trường</td>
                    <td className="px-3 py-2 tabular-nums">{stats.total}</td>
                    <td className="px-3 py-2 tabular-nums">{stats.responded}</td>
                    <td className="px-3 py-2 tabular-nums">{pct(stats.responded, stats.total)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Theo khoa */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Theo khoa (Liên chi Đoàn)</h2>
            <div className="overflow-x-auto rounded-xl border bg-background">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium">Khoa</th>
                    <th className="px-3 py-2 font-medium">Tổng</th>
                    {CATEGORY_ORDER.map((c) => (
                      <th key={c} className="px-3 py-2 font-medium whitespace-nowrap">{CATEGORY_LABEL[c]}</th>
                    ))}
                    <th className="px-3 py-2 font-medium">Đã phản hồi</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byFaculty.map((f) => (
                    <tr key={f.faculty} className="border-t">
                      <td className="px-3 py-2 font-medium">{f.faculty}</td>
                      <td className="px-3 py-2 tabular-nums">{f.total}</td>
                      {CATEGORY_ORDER.map((c) => (
                        <td key={c} className="px-3 py-2 tabular-nums">{f.byCat[c]}</td>
                      ))}
                      <td className="px-3 py-2 tabular-nums">{f.responded} ({pct(f.responded, f.total)}%)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
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
  tone?: "emerald" | "amber";
}) {
  const color =
    tone === "emerald"
      ? "text-emerald-700 dark:text-emerald-300"
      : tone === "amber"
        ? "text-amber-700 dark:text-amber-300"
        : "text-foreground";
  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
