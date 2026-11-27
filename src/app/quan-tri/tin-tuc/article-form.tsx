"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ArticleFormState } from "@/app/actions/articles";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormError, FormField } from "@/components/form-field";

export type ArticleFormValues = {
  title: string;
  summary: string;
  content: string;
  category: string;
  coverImage: string;
  pinned: boolean;
  status: "PUBLISHED" | "DRAFT";
};

const CATEGORIES = ["Hoạt động", "Tình nguyện", "Học tập", "Thể thao", "Thông báo"];

const selectClass =
  "h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

const textareaClass =
  "rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

/** Form dùng chung cho Thêm và Sửa tin tức */
export function ArticleForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
  initial?: ArticleFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <FormField
        id="title"
        label="Tiêu đề *"
        defaultValue={initial?.title}
        placeholder="VD: Lễ tuyên dương sinh viên 5 tốt năm học 2026 – 2027"
        required
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="summary">Tóm tắt</Label>
        <textarea
          id="summary"
          name="summary"
          rows={2}
          defaultValue={initial?.summary}
          className={textareaClass}
          placeholder="Một hai câu tóm tắt, hiển thị ở thẻ tin và trang chủ."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="content">Nội dung *</Label>
        <textarea
          id="content"
          name="content"
          rows={12}
          defaultValue={initial?.content}
          className={textareaClass}
          placeholder="Nội dung đầy đủ của bài. Nhấn Enter để xuống dòng, cách dòng để tách đoạn."
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Chuyên mục</Label>
          <select
            id="category"
            name="category"
            defaultValue={initial?.category ?? CATEGORIES[0]}
            className={selectClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">Quyết định màu nhãn của tin.</p>
        </div>
        <FormField
          id="coverImage"
          label="Link ảnh bìa"
          type="url"
          defaultValue={initial?.coverImage}
          placeholder="https://… (dán đường link ảnh)"
          hint="Để trống thì bài hiện ô ảnh minh hoạ theo màu chuyên mục."
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Trạng thái</Label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "PUBLISHED"}
            className={selectClass}
          >
            <option value="PUBLISHED">Đăng ngay (công khai)</option>
            <option value="DRAFT">Lưu nháp (chưa công khai)</option>
          </select>
        </div>
        <label className="flex items-center gap-2 pt-7 text-sm">
          <input
            type="checkbox"
            name="pinned"
            defaultChecked={initial?.pinned ?? false}
            className="size-4 accent-[#0072bc]"
          />
          Ghim làm tin nổi bật
        </label>
      </div>

      <FormError message={state?.error} />

      <div className="flex gap-3">
        <Button type="submit" className="h-10 px-5" disabled={pending}>
          {pending ? "Đang lưu…" : submitLabel}
        </Button>
        <Link
          href="/quan-tri/tin-tuc"
          className={buttonVariants({ variant: "outline", className: "h-10 px-5" })}
        >
          Huỷ
        </Link>
      </div>
    </form>
  );
}
