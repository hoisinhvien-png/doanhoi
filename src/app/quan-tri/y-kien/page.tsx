import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { getFaculties } from "@/lib/queries";
import { RECIPIENT_LABEL, STAFF_OPEN, type FeedbackStatus } from "@/lib/feedback";
import { FeedbackRow } from "@/components/feedback-ui";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

const TABS = [
  { key: "open", label: "Chờ xử lý" },
  { key: "ANSWERED", label: "Đã phản hồi" },
  { key: "CLOSED", label: "Đã đóng" },
  { key: "", label: "Tất cả" },
] as const;

function statusFilter(tt: string) {
  if (tt === "open") return { status: { in: STAFF_OPEN } };
  if (tt === "ANSWERED" || tt === "CLOSED") return { status: tt as FeedbackStatus };
  return {};
}

export default async function AdminFeedbackList({ searchParams }: PageProps<"/quan-tri/y-kien">) {
  await requireRole("ADMIN");
  const sp = await searchParams;
  const tt = typeof sp.tt === "string" ? sp.tt : "open";
  const khoa = typeof sp.khoa === "string" ? sp.khoa : "";

  const [faculties, list] = await Promise.all([
    getFaculties(),
    prisma.feedback.findMany({
      where: { ...statusFilter(tt), ...(khoa ? { faculty: khoa } : {}) },
      orderBy: [{ lastReplyAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      select: {
        id: true, title: true, category: true, status: true, anonymous: true, faculty: true, recipient: true, updatedAt: true,
        author: { select: { name: true, className: true } },
      },
    }),
  ]);

  const tabHref = (key: string) =>
    `/quan-tri/y-kien?tt=${key}${khoa ? `&khoa=${encodeURIComponent(khoa)}` : ""}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ý kiến & Phản hồi</h1>
          <p className="text-muted-foreground">Toàn bộ ý kiến sinh viên gửi lên. Trả lời trực tiếp hoặc để Liên chi Đoàn khoa xử lý.</p>
        </div>
        <Link href="/quan-tri/y-kien/thong-ke" className={buttonVariants({ variant: "outline", className: "h-10 px-4" })}>
          <BarChart3 className="size-4" /> Thống kê
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1 text-sm">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={tabHref(t.key)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 font-medium",
                tt === t.key ? "bg-background shadow-sm" : "text-muted-foreground"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <form action="/quan-tri/y-kien" className="flex items-center gap-2 text-sm">
          <input type="hidden" name="tt" value={tt} />
          <select name="khoa" defaultValue={khoa} className="h-9 rounded-lg border border-input bg-background px-2">
            <option value="">Tất cả khoa</option>
            {faculties.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <button type="submit" className="h-9 rounded-lg border px-3 font-medium">Lọc</button>
        </form>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-background p-10 text-center text-muted-foreground">
          Không có ý kiến nào trong mục này.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((f) => (
            <FeedbackRow
              key={f.id}
              href={`/quan-tri/y-kien/${f.id}`}
              title={f.title}
              category={f.category}
              status={f.status}
              meta={`→ ${RECIPIENT_LABEL[f.recipient]} · ${f.faculty ?? "Chưa rõ khoa"} · ${f.anonymous ? "Ẩn danh" : `${f.author.name}${f.author.className ? " · " + f.author.className : ""}`}`}
              at={f.updatedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
