"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createFeedback } from "@/app/actions/feedback";
import { CATEGORY_LABEL, CATEGORY_ORDER, RECIPIENT_LABEL, RECIPIENT_ORDER } from "@/lib/feedback";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormError, FormField } from "@/components/form-field";

export function NewFeedbackForm({ events }: { events: { id: string; title: string }[] }) {
  const [state, action, pending] = useActionState(createFeedback, undefined);
  const box =
    "rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="recipient">Gửi tới *</Label>
          <select id="recipient" name="recipient" defaultValue="LIEN_CHI_DOAN" className={`h-10 ${box}`}>
            {RECIPIENT_ORDER.map((r) => (
              <option key={r} value={r}>
                {RECIPIENT_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Loại ý kiến</Label>
          <select id="category" name="category" defaultValue="SUGGESTION" className={`h-10 ${box}`}>
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <FormField id="title" label="Tiêu đề *" placeholder="Nói ngắn gọn ý kiến của bạn" required minLength={5} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="content">Nội dung *</Label>
        <textarea
          id="content"
          name="content"
          rows={6}
          required
          minLength={10}
          placeholder="Mô tả chi tiết ý kiến, góp ý hoặc khiếu nại của bạn…"
          className={box}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="eventId">Sự kiện liên quan (không bắt buộc)</Label>
        <select id="eventId" name="eventId" defaultValue="" className={`h-10 ${box}`}>
          <option value="">— Không gắn sự kiện —</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
        <input type="checkbox" name="anonymous" className="mt-0.5 size-4 accent-[#0072bc]" />
        <span>
          <b>Gửi ẩn danh</b> — Liên chi Đoàn và Đoàn trường sẽ không thấy tên, lớp của bạn. Bạn vẫn nhận được phản hồi
          tại đây trong tài khoản của mình.
        </span>
      </label>

      <FormError message={state?.error} />

      <div className="flex gap-3">
        <Button type="submit" className="h-10 px-5" disabled={pending}>
          {pending ? "Đang gửi…" : "Gửi ý kiến"}
        </Button>
        <Link href="/sinh-vien/y-kien" className={buttonVariants({ variant: "outline", className: "h-10 px-5" })}>
          Huỷ
        </Link>
      </div>
    </form>
  );
}
