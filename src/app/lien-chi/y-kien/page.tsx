import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { STAFF_OPEN, type FeedbackStatus } from "@/lib/feedback";
import { FeedbackRow } from "@/components/feedback-ui";
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

export default async function LcdFeedbackList({ searchParams }: PageProps<"/lien-chi/y-kien">) {
  const me = await requireRole("LCD");
  if (!me.faculty) {
    return <p className="text-muted-foreground">Tài khoản chưa được gán khoa. Liên hệ Đoàn trường.</p>;
  }
  const sp = await searchParams;
  const tt = typeof sp.tt === "string" ? sp.tt : "open";

  const list = await prisma.feedback.findMany({
    where: { faculty: me.faculty, recipient: "LIEN_CHI_DOAN", ...statusFilter(tt) },
    orderBy: [{ lastReplyAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    select: {
      id: true, title: true, category: true, status: true, anonymous: true, updatedAt: true,
      author: { select: { name: true, className: true } },
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Ý kiến sinh viên</h1>
        <p className="text-muted-foreground">Ý kiến sinh viên khoa {me.faculty} gửi tới Liên chi Đoàn. Trả lời và theo dõi đến khi giải quyết xong.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1 text-sm">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/lien-chi/y-kien?tt=${t.key}` : "/lien-chi/y-kien?tt="}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 font-medium",
              tt === t.key ? "bg-background shadow-sm" : "text-muted-foreground"
            )}
          >
            {t.label}
          </Link>
        ))}
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
              href={`/lien-chi/y-kien/${f.id}`}
              title={f.title}
              category={f.category}
              status={f.status}
              meta={f.anonymous ? "Ẩn danh" : `${f.author.name}${f.author.className ? " · " + f.author.className : ""}`}
              at={f.updatedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
