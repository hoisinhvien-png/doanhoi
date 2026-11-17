"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

/** Nút gửi form có hỏi xác nhận trước (dùng cho thao tác xoá) */
export function ConfirmButton({
  action,
  message,
  children,
  ...props
}: {
  action: () => Promise<void>;
  message: string;
} & ComponentProps<typeof Button>) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <Button type="submit" {...props}>
        {children}
      </Button>
    </form>
  );
}
