import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { RECIPIENT_LABEL } from "@/lib/feedback";
import { buttonVariants } from "@/components/ui/button";
import { FeedbackRow } from "@/components/feedback-ui";

/** Sinh viên: danh sách ý kiến mình đã gửi */
export default async function StudentFeedbackList() {
  const me = await requireRole("STUDENT");
  const list = await prisma.feedback.findMany({
    where: { authorId: me.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, category: true, status: true, recipient: true, updatedAt: true },
  });
  const answered = list.filter((f) => f.status === "ANSWERED").length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ý kiến & Phản hồi</h1>
          <p className="text-muted-foreground">Gửi góp ý, câu hỏi, khiếu nại và theo dõi phản hồi.</p>
        </div>
        <Link href="/sinh-vien/y-kien/moi" className={buttonVariants({ className: "h-10 px-4" })}>
          <MessageSquarePlus className="size-4" /> Gửi ý kiến mới
        </Link>
      </div>

      {answered > 0 && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100">
          Bạn có <b>{answered}</b> ý kiến vừa được phản hồi. Bấm vào để xem.
        </p>
      )}

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-background p-10 text-center text-muted-foreground">
          Bạn chưa gửi ý kiến nào. Bấm “Gửi ý kiến mới” để bắt đầu.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((f) => (
            <FeedbackRow
              key={f.id}
              href={`/sinh-vien/y-kien/${f.id}`}
              title={f.title}
              category={f.category}
              status={f.status}
              meta={`→ ${RECIPIENT_LABEL[f.recipient]}`}
              at={f.updatedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
