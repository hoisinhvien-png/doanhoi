"use client";

import { useActionState } from "react";
import { createStaffAccount, resetStaffPassword, type AccountState, type ResetState } from "@/app/actions/accounts";
import { Button } from "@/components/ui/button";
import { FormError, FormField } from "@/components/form-field";

function OneTimePassword({ email, password }: { email?: string; password: string }) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
      <p>
        Mật khẩu tạm{email ? ` của ${email}` : ""}:{" "}
        <code className="rounded bg-white px-1.5 py-0.5 font-mono text-base dark:bg-black/40">{password}</code>
      </p>
      <p className="mt-1 text-xs">Chỉ hiện một lần. Gửi cho cán bộ qua kênh riêng; lần đăng nhập đầu sẽ bắt đổi mật khẩu.</p>
    </div>
  );
}

export function CreateStaffForm({ faculties }: { faculties: string[] }) {
  const [state, action, pending] = useActionState<AccountState, FormData>(createStaffAccount, undefined);

  return (
    <div className="flex flex-col gap-3">
      <form action={action} className="grid gap-3 sm:grid-cols-2 sm:items-end lg:grid-cols-4">
        <FormField id="email" label="Email đăng nhập *" type="email" placeholder="lcd.cntt@htu.edu.vn" required />
        <FormField id="name" label="Tên hiển thị *" placeholder="LCĐ Khoa CNTT" required />
        <FormField id="faculty" label="Khoa quản lý *" list="faculty-list-acc" placeholder="Chọn hoặc gõ tên khoa" required />
        <datalist id="faculty-list-acc">
          {faculties.map((f) => <option key={f} value={f} />)}
        </datalist>
        <Button type="submit" className="h-10 lg:col-span-4 lg:w-fit" disabled={pending}>
          {pending ? "Đang tạo…" : "Tạo tài khoản"}
        </Button>
      </form>
      <FormError message={state?.error} />
      {state?.created && <OneTimePassword email={state.created.email} password={state.created.password} />}
    </div>
  );
}

export function ResetStaffButton({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState<ResetState>(resetStaffPassword.bind(null, userId), undefined);
  return (
    <div className="flex flex-col items-start gap-2">
      <form action={action}>
        <Button type="submit" variant="outline" size="sm" disabled={pending}>Cấp mật khẩu mới</Button>
      </form>
      {state?.password && <OneTimePassword password={state.password} />}
    </div>
  );
}
