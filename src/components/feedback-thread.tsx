import Link from "next/link";
import { ArrowLeft, CalendarDays, Lock, Send, ShieldCheck, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "cn";
import { formatDateTime } from "@/lib/format";
import {
  ROLE_SENDER_LABEL,
  type FeedbackCategory,
  type FeedbackSatisfaction,
  type FeedbackStatus,
} from "@/lib/feedback";
import type { RoleName } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { CategoryTag, FeedbackStatusBadge } from "@/components/feedback-ui";

export type ThreadReply = {
  id: string;
  who: string; // tên người gửi đã xử lý ẩn danh
  role: RoleName;
  content: string;
  createdAt: Date;
};

export type FeedbackThreadProps = {
  backHref: string;
  title: string;
  content: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  senderLine: string;
  recipientLabel: string;
  createdAt: Date;
  eventTitle?: string | null;
  replies: ThreadReply[];
  canReply: boolean;
  replyPlaceholder: string;
  replyAction: (formData: FormData) => Promise<void>;
  closeAction?: () => Promise<void>;
  reopenAction?: () => Promise<void>;
  // Đánh giá của sinh viên (chỉ hiện ở trang sinh viên, khi đã có phản hồi)
  showSatisfaction?: boolean;
  satisfaction?: FeedbackSatisfaction | null;
  likeAction?: () => Promise<void>;
  unlikeAction?: () => Promise<void>;
};

export function FeedbackThread(p: FeedbackThreadProps) {
  return (
    <div className="flex flex-col gap-5">
      <Link href={p.backHref} className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Danh sách ý kiến
      </Link>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryTag category={p.category} />
          <FeedbackStatusBadge status={p.status} />
        </div>
        <h1 className="text-2xl font-bold">{p.title}</h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>{p.senderLine}</span>
          <span>Gửi tới: <b className="text-foreground">{p.recipientLabel}</b></span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {formatDateTime(p.createdAt)}
          </span>
          {p.eventTitle && <span>Sự kiện liên quan: <b className="text-foreground">{p.eventTitle}</b></span>}
        </p>
      </div>

      {/* Nội dung ý kiến gốc */}
      <div className="rounded-xl border bg-background p-4 text-sm whitespace-pre-line">{p.content}</div>

      {/* Trao đổi */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Trao đổi ({p.replies.length})
        </h2>
        {p.replies.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-background p-4 text-sm text-muted-foreground">
            Chưa có phản hồi. Nơi tiếp nhận sẽ phản hồi sớm.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {p.replies.map((r) => {
              const staff = r.role !== "STUDENT";
              return (
                <li
                  key={r.id}
                  className={cn(
                    "rounded-xl border p-4",
                    staff ? "border-[#0072bc]/30 bg-sky-50/60 dark:bg-sky-900/15" : "bg-background"
                  )}
                >
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-medium">
                    {staff && <ShieldCheck className="size-3.5 text-[#0072bc]" />}
                    <span className={staff ? "text-[#0072bc]" : "text-foreground"}>{r.who}</span>
                    <span className="font-normal text-muted-foreground">· {ROLE_SENDER_LABEL[r.role]}</span>
                    <span className="font-normal text-muted-foreground">· {formatDateTime(r.createdAt)}</span>
                  </p>
                  <p className="text-sm whitespace-pre-line">{r.content}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Sinh viên đánh giá sau khi có phản hồi */}
      {p.showSatisfaction && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-background p-4">
          <span className="text-sm font-medium">Bạn thấy phản hồi thế nào?</span>
          <form action={p.likeAction}>
            <Button
              type="submit"
              variant="outline"
              className={cn(
                "h-9",
                p.satisfaction === "LIKE" && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
              )}
            >
              <ThumbsUp className="size-4" /> Hài lòng
            </Button>
          </form>
          <form action={p.unlikeAction}>
            <Button
              type="submit"
              variant="outline"
              className={cn(
                "h-9",
                p.satisfaction === "UNLIKE" && "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
              )}
            >
              <ThumbsDown className="size-4" /> Chưa hài lòng
            </Button>
          </form>
          {p.satisfaction && <span className="text-xs text-muted-foreground">Bấm lại để bỏ chọn.</span>}
        </div>
      )}

      {/* Ô trả lời / đóng / mở lại */}
      {p.canReply ? (
        <div className="flex flex-col gap-3 rounded-xl border bg-background p-4">
          <form action={p.replyAction} className="flex flex-col gap-2">
            <label htmlFor="content" className="text-sm font-medium">Gửi phản hồi / trao đổi</label>
            <textarea
              id="content"
              name="content"
              rows={3}
              required
              minLength={2}
              placeholder={p.replyPlaceholder}
              className="rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            />
            <Button type="submit" className="h-9 w-fit px-4">
              <Send className="size-4" /> Gửi
            </Button>
          </form>
          {p.closeAction && (
            <form action={p.closeAction} className="border-t pt-3">
              <Button type="submit" variant="outline" className="h-9">Đánh dấu đã xong (đóng ý kiến)</Button>
            </form>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 p-4">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="size-4" /> Ý kiến đã đóng.
          </span>
          {p.reopenAction && (
            <form action={p.reopenAction}>
              <Button type="submit" variant="outline" className="h-9">Mở lại trao đổi</Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
