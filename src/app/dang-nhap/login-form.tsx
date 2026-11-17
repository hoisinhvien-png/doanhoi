"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { FormError, FormField } from "@/components/form-field";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormField
        id="identifier"
        label="Mã sinh viên hoặc email"
        autoComplete="username"
        placeholder="VD: 2201234 hoặc ten@htu.edu.vn"
        required
      />
      <FormField
        id="password"
        label="Mật khẩu"
        type="password"
        autoComplete="current-password"
        hint="Sinh viên đăng nhập lần đầu: mật khẩu là ngày sinh dạng ddMMyyyy."
        required
      />
      <FormError message={state?.error} />
      <Button type="submit" className="h-10 text-base" disabled={pending}>
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>
    </form>
  );
}
