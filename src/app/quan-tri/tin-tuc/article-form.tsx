"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import type { ArticleFormState } from "@/app/actions/articles";
import { uploadImage } from "@/app/actions/upload";
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

const fieldClass =
  "rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";
const selectClass =
  "h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

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

  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [busy, setBusy] = useState<null | "cover" | "body">(null);
  const [uploadErr, setUploadErr] = useState<string>("");
  const [coverBroken, setCoverBroken] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const bodyInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  async function doUpload(file: File): Promise<string | null> {
    setUploadErr("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadImage(fd);
    if (res.error || !res.url) {
      setUploadErr(res.error ?? "Tải ảnh thất bại.");
      return null;
    }
    return res.url;
  }

  async function onPickCover(file: File) {
    setBusy("cover");
    const url = await doUpload(file);
    if (url) setCoverImage(url);
    setBusy(null);
  }

  async function onPickBody(file: File) {
    setBusy("body");
    const url = await doUpload(file);
    setBusy(null);
    if (!url) return;
    // Chèn ảnh (Markdown) vào vị trí con trỏ trong ô nội dung
    const ta = contentRef.current;
    const snippet = `\n\n![](${url})\n\n`;
    const start = ta?.selectionStart ?? content.length;
    const end = ta?.selectionEnd ?? content.length;
    const next = content.slice(0, start) + snippet + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      ta?.focus();
      const pos = start + snippet.length;
      ta?.setSelectionRange(pos, pos);
    });
  }

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
          className={fieldClass}
          placeholder="Một hai câu tóm tắt, hiển thị ở thẻ tin và trang chủ."
        />
      </div>

      {/* Nội dung + chèn ảnh */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="content">Nội dung *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy !== null}
            onClick={() => bodyInputRef.current?.click()}
          >
            <ImagePlus className="size-4" />
            {busy === "body" ? "Đang tải…" : "Chèn ảnh"}
          </Button>
        </div>
        <textarea
          id="content"
          name="content"
          ref={contentRef}
          rows={12}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={fieldClass}
          placeholder="Nội dung đầy đủ của bài. Cách một dòng trống để tách đoạn. Bấm “Chèn ảnh” để đưa ảnh vào giữa bài."
          required
        />
        <p className="text-xs text-muted-foreground">
          Mẹo: để xuống dòng cứ nhấn Enter; tách đoạn thì để một dòng trống. Ảnh chèn sẽ hiện đúng vị trí trong bài.
        </p>
        <input
          ref={bodyInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPickBody(f);
            e.target.value = "";
          }}
        />
      </div>

      {/* Ảnh bìa */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="coverImage">Ảnh bìa</Label>
        <div className="flex gap-2">
          <input
            id="coverImage"
            name="coverImage"
            type="url"
            value={coverImage}
            onChange={(e) => {
              setCoverImage(e.target.value);
              setCoverBroken(false);
            }}
            placeholder="Dán link ảnh, hoặc bấm Tải ảnh →"
            className={`h-10 flex-1 ${fieldClass} py-0`}
          />
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 px-3"
            disabled={busy !== null}
            onClick={() => coverInputRef.current?.click()}
          >
            <Upload className="size-4" />
            {busy === "cover" ? "Đang tải…" : "Tải ảnh"}
          </Button>
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPickCover(f);
            e.target.value = "";
          }}
        />
        {coverImage ? (
          <div className="flex flex-col gap-1.5">
            <div className="relative w-max">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage}
                alt="Ảnh bìa"
                className={`h-28 rounded-lg border object-cover ${coverBroken ? "hidden" : ""}`}
                onError={() => setCoverBroken(true)}
                onLoad={() => setCoverBroken(false)}
              />
              {coverBroken && (
                <div className="grid h-28 w-44 place-items-center rounded-lg border border-dashed border-destructive/60 bg-destructive/5 px-3 text-center text-[11px] font-medium text-destructive">
                  Link này không phải ảnh
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setCoverImage("");
                  setCoverBroken(false);
                }}
                className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-destructive text-white shadow"
                aria-label="Bỏ ảnh bìa"
              >
                <X className="size-3.5" />
              </button>
            </div>
            {coverBroken && (
              <p className="text-xs text-destructive">
                Hãy dán <b>link ảnh trực tiếp</b> (kết thúc .jpg/.png/.webp) hoặc bấm <b>Tải ảnh</b> để
                tải từ máy. Link bài báo không hiện được thành ảnh.
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Tải ảnh từ máy hoặc dán <b>link ảnh trực tiếp</b> (.jpg/.png). Dán link bài báo sẽ không hiện
            được. Để trống thì bài hiện ô ảnh minh hoạ theo màu chuyên mục.
          </p>
        )}
      </div>

      {uploadErr && <FormError message={uploadErr} />}

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
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="pinned"
          defaultChecked={initial?.pinned ?? false}
          className="size-4 accent-[#0072bc]"
        />
        Ghim làm tin nổi bật
      </label>

      <FormError message={state?.error} />

      <div className="flex gap-3">
        <Button type="submit" className="h-10 px-5" disabled={pending || busy !== null}>
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
