import { notFound } from "next/navigation";
import { requireRole } from "@/lib/dal";
import { loadFeedbackThread } from "@/lib/feedback-data";
import { closeFeedback, reopenFeedback, replyFeedback } from "@/app/actions/feedback";
import { FeedbackThread } from "@/components/feedback-thread";

export default async function AdminFeedbackThread({ params }: PageProps<"/quan-tri/y-kien/[id]">) {
  const me = await requireRole("ADMIN");
  const { id } = await params;
  const data = await loadFeedbackThread(id, me);
  if (!data) notFound();
  const open = data.status !== "CLOSED";

  return (
    <FeedbackThread
      backHref="/quan-tri/y-kien"
      {...data.thread}
      canReply={open}
      replyPlaceholder="Nhập nội dung phản hồi cho sinh viên…"
      replyAction={replyFeedback.bind(null, id)}
      closeAction={open ? closeFeedback.bind(null, id) : undefined}
      reopenAction={!open ? reopenFeedback.bind(null, id) : undefined}
    />
  );
}
