"use client";

import { Button } from "@/components/ui/button";

/** Nút xoá có hỏi xác nhận trước */
export function DeleteEventButton({
  action,
  title,
}: {
  action: () => Promise<void>;
  title: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Xoá sự kiện “${title}”? Thao tác này không khôi phục được.`)) {
          e.preventDefault();
        }
      }}
      className="mt-3"
    >
      <Button type="submit" variant="destructive">
        Xoá sự kiện
      </Button>
    </form>
  );
}
