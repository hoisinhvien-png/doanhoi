"use client";

import { useActionState } from "react";
import { changePassword, logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { FormError, FormField } from "@/components/form-field";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);

  return (
    <div className="flex flex-col gap-3">
      <form action={action} className="flex flex-col gap-4">
        <FormField
          id="current"
          label="Mật khẩu hiện tại"
          type="password"
          autoComplete="current-password"
          required
        />
        <FormField
          id="next"
          label="Mật khẩu mới"
          type="password"
          autoComplete="new-password"
          hint="Ít nhất 8 ký tự, có cả chữ và số."
          minLength={8}
          required
        />
        <FormField
          id="confirm"
          label="Nhập lại mật khẩu mới"
          type="password"
          autoComplete="new-password"
          required
        />
        <FormError message={state?.error} />
        <Button type="submit" className="h-10 text-base" disabled={pending}>
          {pending ? "Đang lưu…" : "Lưu mật khẩu mới"}
        </Button>
      </form>
      <form action={logout}>
        <Button type="submit" variant="ghost" className="w-full">
          Đăng xuất
        </Button>
      </form>
    </div>
  );
}
