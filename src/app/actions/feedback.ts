"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/dal";
import { isCategory, isRecipient, type FeedbackSatisfaction } from "@/lib/feedback";

export type FeedbackFormState = { error?: string } | undefined;

/** Sinh viên gửi một ý kiến mới */
export async function createFeedback(
  _prev: FeedbackFormState,
  formData: FormData
): Promise<FeedbackFormState> {
  const me = await requireRole("STUDENT");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "SUGGESTION");
  const category = isCategory(categoryRaw) ? categoryRaw : "SUGGESTION";
  const recipientRaw = String(formData.get("recipient") ?? "LIEN_CHI_DOAN");
  const recipient = isRecipient(recipientRaw) ? recipientRaw : "LIEN_CHI_DOAN";
  const anonymous = formData.get("anonymous") === "on";
  const eventIdRaw = String(formData.get("eventId") ?? "").trim();

  if (title.length < 5) return { error: "Tiêu đề cần ít nhất 5 ký tự." };
  if (content.length < 10) return { error: "Nội dung cần ít nhất 10 ký tự." };

  let eventId: string | null = null;
  if (eventIdRaw) {
    const ev = await prisma.event.findUnique({ where: { id: eventIdRaw }, select: { id: true } });
    eventId = ev?.id ?? null;
  }

  const fb = await prisma.feedback.create({
    data: {
      authorId: me.id,
      faculty: me.faculty ?? null,
      recipient,
      anonymous,
      category,
      title,
      content,
      eventId,
      status: "NEW",
    },
    select: { id: true },
  });
  redirect(`/sinh-vien/y-kien/${fb.id}`);
}

/** Người đang đăng nhập có được xem/trao đổi ý kiến này không */
async function loadForUser(feedbackId: string) {
  const me = await getCurrentUser();
  if (!me || me.mustChangePassword) return null;
  const fb = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    select: { id: true, authorId: true, faculty: true, recipient: true, status: true },
  });
  if (!fb) return null;
  const ok =
    me.role === "ADMIN" ||
    (me.role === "LCD" && !!me.faculty && fb.recipient === "LIEN_CHI_DOAN" && fb.faculty === me.faculty) ||
    (me.role === "STUDENT" && fb.authorId === me.id);
  return ok ? { me, fb } : null;
}

/** Gửi một lượt trao đổi. Cán bộ trả lời -> ANSWERED; sinh viên gửi tiếp -> IN_PROGRESS. */
export async function replyFeedback(feedbackId: string, formData: FormData) {
  const ctx = await loadForUser(feedbackId);
  if (!ctx) return;
  const { me, fb } = ctx;
  if (fb.status === "CLOSED") return;
  const content = String(formData.get("content") ?? "").trim();
  if (content.length < 2) return;

  await prisma.feedbackReply.create({
    data: { feedbackId, authorId: me.id, authorRole: me.role, content },
  });
  await prisma.feedback.update({
    where: { id: feedbackId },
    data: { status: me.role === "STUDENT" ? "IN_PROGRESS" : "ANSWERED", lastReplyAt: new Date() },
  });
  refresh();
}

/** Đóng ý kiến (đã giải quyết xong) */
export async function closeFeedback(feedbackId: string) {
  const ctx = await loadForUser(feedbackId);
  if (!ctx) return;
  await prisma.feedback.update({ where: { id: feedbackId }, data: { status: "CLOSED" } });
  refresh();
}

/** Mở lại ý kiến đã đóng để trao đổi tiếp */
export async function reopenFeedback(feedbackId: string) {
  const ctx = await loadForUser(feedbackId);
  if (!ctx) return;
  await prisma.feedback.update({ where: { id: feedbackId }, data: { status: "IN_PROGRESS" } });
  refresh();
}

/** Sinh viên đánh giá Hài lòng / Chưa hài lòng sau khi có phản hồi của cán bộ. Bấm lại nút đang chọn thì bỏ chọn. */
export async function setSatisfaction(feedbackId: string, value: FeedbackSatisfaction) {
  const me = await requireRole("STUDENT");
  const fb = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    select: {
      authorId: true,
      satisfaction: true,
      replies: { where: { authorRole: { in: ["ADMIN", "LCD"] } }, take: 1, select: { id: true } },
    },
  });
  if (!fb || fb.authorId !== me.id) return;
  if (fb.replies.length === 0) return; // chỉ đánh giá khi đã có phản hồi
  const next = fb.satisfaction === value ? null : value;
  await prisma.feedback.update({ where: { id: feedbackId }, data: { satisfaction: next } });
  refresh();
}
