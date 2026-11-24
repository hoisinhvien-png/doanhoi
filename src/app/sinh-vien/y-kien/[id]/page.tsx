import { notFound } from "next/navigation";
import { requireRole } from "@/lib/dal";
import { loadFeedbackThread } from "@/lib/feedback-data";
import { closeFeedback, reopenFeedback, replyFeedback, setSatisfaction } from "@/app/actions/feedback";
import { FeedbackThread } from "@/components/feedback-thread";

export default async function StudentFeedbackThread({ params }: PageProps<"/sinh-vien/y-kien/[id]">) {
  const me = await requireRole("STUDENT");
  const { id } = await params;
  const data = await loadFeedbackThread(id, me);
  if (!data) notFound();
  const open = data.status !== "CLOSED";

  return (
    <FeedbackThread
      backHref="/sinh-vien/y-kien"
      {...data.thread}
      canReply={open}
      replyPlaceholder="Trao đổi thêm với nơi tiếp nhận…"
      replyAction={replyFeedback.bind(null, id)}
      closeAction={open ? closeFeedback.bind(null, id) : undefined}
      reopenAction={!open ? reopenFeedback.bind(null, id) : undefined}
      showSatisfaction={data.hasStaffReply}
      satisfaction={data.satisfaction}
      likeAction={setSatisfaction.bind(null, id, "LIKE")}
      unlikeAction={setSatisfaction.bind(null, id, "UNLIKE")}
    />
  );
}
