"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { EventFormState } from "@/app/actions/events";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormError, FormField } from "@/components/form-field";

export type EventFormValues = {
  title: string;
  date: string; // dạng datetime-local, giờ VN
  location: string;
  faculty: string;
  description: string;
  registrationOpen: boolean;
};

/** Form dùng chung cho Thêm và Sửa sự kiện */
export function EventForm({
  action,
  initial,
  faculties,
  submitLabel,
  lcdFaculty,
  cancelHref = "/quan-tri/su-kien",
}: {
  action: (prev: EventFormState, formData: FormData) => Promise<EventFormState>;
  initial?: EventFormValues;
  faculties: string[];
  submitLabel: string;
  // Nếu có: form của LCĐ — chỉ cho chọn "Toàn trường" hoặc đúng khoa này.
  // Nếu không: form của Đoàn trường — chọn toàn trường hoặc bất kỳ khoa nào.
  lcdFaculty?: string;
  cancelHref?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <FormField
        id="title"
        label="Tên sự kiện *"
        defaultValue={initial?.title}
        placeholder="VD: Hiến máu nhân đạo đợt 1"
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="date"
          label="Ngày giờ diễn ra *"
          type="datetime-local"
          defaultValue={initial?.date}
          required
        />
        <FormField
          id="location"
          label="Địa điểm"
          defaultValue={initial?.location}
          placeholder="VD: Hội trường A"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="faculty">Phạm vi</Label>
        <select
          id="faculty"
          name="faculty"
          defaultValue={initial?.faculty ?? ""}
          className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="">Toàn trường (mọi sinh viên)</option>
          {lcdFaculty ? (
            <option value={lcdFaculty}>Chỉ trong liên chi (sinh viên khoa {lcdFaculty})</option>
          ) : (
            faculties.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))
          )}
        </select>
        <p className="text-xs text-muted-foreground">
          {lcdFaculty ? (
            <>
              Chọn <b>Toàn trường</b> để mọi sinh viên thấy và đăng ký; chọn <b>Chỉ trong liên chi</b> thì chỉ
              sinh viên khoa {lcdFaculty} thấy.
            </>
          ) : (
            <>
              Chọn <b>Toàn trường</b> để mọi sinh viên thấy và đăng ký được; chọn một khoa thì chỉ sinh viên khoa đó.
            </>
          )}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Mô tả</Label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={initial?.description}
          className="rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          placeholder="Nội dung, yêu cầu, người phụ trách…"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="registrationOpen"
          defaultChecked={initial?.registrationOpen ?? true}
          className="size-4 accent-[#0072bc]"
        />
        Mở đăng ký cho sinh viên
      </label>
      <FormError message={state?.error} />
      <div className="flex gap-3">
        <Button type="submit" className="h-10 px-5" disabled={pending}>
          {pending ? "Đang lưu…" : submitLabel}
        </Button>
        <Link
          href={cancelHref}
          className={buttonVariants({ variant: "outline", className: "h-10 px-5" })}
        >
          Huỷ
        </Link>
      </div>
    </form>
  );
}
