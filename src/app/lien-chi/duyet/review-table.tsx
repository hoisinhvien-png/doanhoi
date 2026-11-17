"use client";

import { useState } from "react";
import { Check, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

type Row = {
  id: string;
  studentId: string;
  name: string;
  className: string;
  eventTitle: string;
  eventDate: string;
  createdAt: string;
};
type Act = (formData: FormData) => Promise<void>;

/** Bảng duyệt: tích chọn nhiều dòng rồi bấm Duyệt / Từ chối một lần */
export function ReviewTable({
  tab,
  rows,
  approve,
  reject,
  reset,
}: {
  tab: "PENDING" | "CONFIRMED" | "REJECTED";
  rows: Row[];
  approve: Act;
  reject: Act;
  reset: Act;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const all = rows.length > 0 && selected.size === rows.length;
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-background p-10 text-center text-muted-foreground">
        Không có lượt đăng ký nào ở mục này.
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={() => setSelected(new Set())}>
      <div className="sticky top-14 z-[5] flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2">
        <span className="px-2 text-sm text-muted-foreground">
          Đã chọn {selected.size}/{rows.length}
        </span>
        {tab !== "CONFIRMED" && (
          <Button type="submit" formAction={approve} disabled={selected.size === 0} size="sm"
            className="bg-emerald-600 text-white hover:bg-emerald-700">
            <Check className="size-4" /> Duyệt
          </Button>
        )}
        {tab !== "REJECTED" && (
          <Button type="submit" formAction={reject} disabled={selected.size === 0} size="sm" variant="destructive">
            <X className="size-4" /> Từ chối
          </Button>
        )}
        {tab !== "PENDING" && (
          <Button type="submit" formAction={reset} disabled={selected.size === 0} size="sm" variant="outline">
            <Undo2 className="size-4" /> Đưa về chờ duyệt
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  aria-label="Chọn tất cả"
                  checked={all}
                  onChange={() => setSelected(all ? new Set() : new Set(rows.map((r) => r.id)))}
                  className="size-4 accent-[#0b4f9c]"
                />
              </th>
              <th className="px-3 py-2 font-medium">Mã SV</th>
              <th className="px-3 py-2 font-medium">Họ tên</th>
              <th className="px-3 py-2 font-medium">Lớp</th>
              <th className="px-3 py-2 font-medium">Sự kiện</th>
              <th className="px-3 py-2 font-medium">Đăng ký lúc</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="cursor-pointer border-t hover:bg-muted/40"
                onClick={() => toggle(r.id)}
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    name="ids"
                    value={r.id}
                    checked={selected.has(r.id)}
                    onChange={() => toggle(r.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Chọn ${r.name}`}
                    className="size-4 accent-[#0b4f9c]"
                  />
                </td>
                <td className="px-3 py-2">{r.studentId}</td>
                <td className="px-3 py-2 font-medium">{r.name}</td>
                <td className="px-3 py-2">{r.className}</td>
                <td className="px-3 py-2">
                  {r.eventTitle}
                  <span className="block text-xs text-muted-foreground">
                    {formatDateTime(new Date(r.eventDate))}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(new Date(r.createdAt))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}
