"use client";

import { useActionState } from "react";
import type { StudentFormState } from "@/app/actions/students";
import { Button } from "@/components/ui/button";
import { FormError, FormField } from "@/components/form-field";

export type StudentInitial = {
  studentId: string;
  name: string;
  dob: string; // yyyy-mm-dd
  className: string;
  faculty: string;
  username?: string;
};

/** Form thêm mới / sửa sinh viên (Đoàn trường) */
export function StudentForm({
  action,
  faculties,
  initial,
  submitLabel,
}: {
  action: (prev: StudentFormState, formData: FormData) => Promise<StudentFormState>;
  faculties: string[];
  initial?: StudentInitial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const editing = initial?.username !== undefined;

  return (
    <form action={formAction} className="grid max-w-3xl gap-4 rounded-xl border bg-background p-4 sm:grid-cols-2 sm:p-5">
      <FormField id="studentId" label="Mã sinh viên *" defaultValue={initial?.studentId} required />
      <FormField id="name" label="Họ và tên *" defaultValue={initial?.name} required />
      <FormField
        id="dob"
        label="Ngày sinh *"
        type="date"
        defaultValue={initial?.dob}
        hint={editing ? undefined : "Mật khẩu ban đầu là ngày sinh dạng ddMMyyyy."}
        required
      />
      <FormField id="className" label="Lớp" defaultValue={initial?.className} placeholder="VD: ĐH CQ khóa 19 ngành Ngôn ngữ Anh" />
      <FormField
        id="faculty"
        label="Khoa (Liên chi Đoàn) *"
        list="faculty-list-student"
        defaultValue={initial?.faculty}
        placeholder="Chọn hoặc gõ tên khoa"
        required
      />
      <datalist id="faculty-list-student">
        {faculties.map((f) => (
          <option key={f} value={f} />
        ))}
      </datalist>
      {editing ? (
        <FormField
          id="username"
          label="Tên tài khoản *"
          defaultValue={initial?.username}
          hint="Chữ không dấu, số và dấu gạch dưới. VD: DIEUTH2025_NN"
          required
        />
      ) : (
        <p className="self-end text-sm text-muted-foreground">
          Tên tài khoản tự tạo: TÊN + chữ đầu họ đệm + 4 số cuối mã SV + _ + viết tắt khoa (VD: DIEUTH2025_NN).
        </p>
      )}

      <div className="flex flex-col gap-3 sm:col-span-2">
        <FormError message={state?.error} />
        {state?.saved && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
            Đã lưu thay đổi.
          </p>
        )}
        <Button type="submit" disabled={pending} className="h-10 w-fit px-6">
          {pending ? "Đang lưu…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
