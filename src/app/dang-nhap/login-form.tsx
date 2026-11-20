"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { FormError, FormField } from "@/components/form-field";
import { cn } from "cn";

// Vai trò chọn từ trang chủ (?vai-tro=...): chỉ đổi lời hướng dẫn, việc phân quyền vẫn theo tài khoản
const ROLES = {
  "quan-ly": {
    tab: "Quản lý",
    label: "Email",
    placeholder: "ten@htu.edu.vn",
    hint: undefined,
  },
  "lien-chi": {
    tab: "Liên chi Đoàn",
    label: "Email",
    placeholder: "lcd.khoa@htu.edu.vn",
    hint: undefined,
  },
  "sinh-vien": {
    tab: "Sinh viên",
    label: "Tên tài khoản hoặc mã sinh viên",
    placeholder: "VD: DIEUTH2025_NN hoặc 11231302025",
    hint: "Lần đầu đăng nhập: mật khẩu là ngày sinh dạng ddMMyyyy (VD: 04012005).",
  },
} as const;
type RoleKey = keyof typeof ROLES;

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const param = useSearchParams().get("vai-tro");
  const role: RoleKey | null = param && param in ROLES ? (param as RoleKey) : null;
  const r = role ? ROLES[role] : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1 text-center text-sm">
        {(Object.keys(ROLES) as RoleKey[]).map((k) => (
          <Link
            key={k}
            href={`/dang-nhap?vai-tro=${k}`}
            replace
            className={cn(
              "rounded-md px-2 py-1.5 font-medium",
              role === k ? "bg-background text-[#0072bc] shadow-sm dark:text-sky-300" : "text-muted-foreground"
            )}
          >
            {ROLES[k].tab}
          </Link>
        ))}
      </div>

      <form action={action} className="flex flex-col gap-4">
        <FormField
          id="identifier"
          label={r?.label ?? "Tên tài khoản, mã sinh viên hoặc email"}
          autoComplete="username"
          placeholder={r?.placeholder ?? "VD: DIEUTH2025_NN hoặc ten@htu.edu.vn"}
          required
        />
        <FormField
          id="password"
          label="Mật khẩu"
          type="password"
          autoComplete="current-password"
          hint={r ? r.hint : ROLES["sinh-vien"].hint}
          required
        />
        <FormError message={state?.error} />
        <Button type="submit" className="h-10 bg-[#0072bc] text-base text-white hover:bg-[#005a96]" disabled={pending}>
          {pending ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>
      </form>
    </div>
  );
}
