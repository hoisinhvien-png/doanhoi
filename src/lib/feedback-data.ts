// Nạp một ý kiến kèm trao đổi, có kiểm tra quyền và xử lý ẩn danh theo người xem.
import "server-only";
import { prisma } from "./prisma";
import type { CurrentUser } from "./dal";
import type { RoleName } from "./roles";
import { RECIPIENT_LABEL, ROLE_SENDER_LABEL } from "./feedback";
import type { ThreadReply } from "@/components/feedback-thread";

export async function loadFeedbackThread(feedbackId: string, me: CurrentUser) {
  const fb = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    include: {
      author: { select: { id: true, name: true, className: true, faculty: true } },
      event: { select: { title: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true } } },
      },
    },
  });
  if (!fb) return null;

  const canAccess =
    me.role === "ADMIN" ||
    (me.role === "LCD" && !!me.faculty && fb.recipient === "LIEN_CHI_DOAN" && fb.faculty === me.faculty) ||
    (me.role === "STUDENT" && fb.authorId === me.id);
  if (!canAccess) return null;

  const staffViewer = me.role !== "STUDENT";
  const hideStudent = staffViewer && fb.anonymous; // cán bộ xem ý kiến ẩn danh

  let senderLine: string;
  if (me.role === "STUDENT") {
    senderLine = fb.anonymous ? "Bạn gửi · ẩn danh với cán bộ" : "Bạn gửi";
  } else if (fb.anonymous) {
    senderLine = `Người gửi: Ẩn danh · Khoa ${fb.faculty ?? "—"}`;
  } else {
    senderLine = `${fb.author.name}${fb.author.className ? " · " + fb.author.className : ""} · Khoa ${fb.faculty ?? fb.author.faculty ?? "—"}`;
  }

  const replies: ThreadReply[] = fb.replies.map((r) => {
    let who: string;
    if (r.authorRole === "STUDENT") {
      who = hideStudent
        ? "Sinh viên (ẩn danh)"
        : r.author?.id === me.id
          ? "Bạn"
          : r.author?.name ?? "Sinh viên";
    } else {
      who = r.author?.id === me.id ? "Bạn" : r.author?.name ?? ROLE_SENDER_LABEL[r.authorRole as RoleName];
    }
    return { id: r.id, who, role: r.authorRole as RoleName, content: r.content, createdAt: r.createdAt };
  });

  const hasStaffReply = fb.replies.some((r) => r.authorRole !== "STUDENT");

  return {
    status: fb.status,
    authorId: fb.authorId,
    satisfaction: fb.satisfaction,
    hasStaffReply,
    thread: {
      title: fb.title,
      content: fb.content,
      category: fb.category,
      status: fb.status,
      senderLine,
      recipientLabel: RECIPIENT_LABEL[fb.recipient],
      createdAt: fb.createdAt,
      eventTitle: fb.event?.title ?? null,
      replies,
    },
  };
}
