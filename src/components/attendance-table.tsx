"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";

export type AttendanceRow = {
  id: string;
  studentId: string;
  name: string;
  className: string;
  faculty?: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  createdAt: string;
};
type Act = (formData: FormData) => Promise<void>;

/**
 * Danh sách sinh viên đăng ký một sự kiện.
 * Khi được phép sửa: tích chọn nhiều dòng rồi bấm "Tham gia" / "Không tham gia".
 */
export function AttendanceTable({
  rows,
  canEdit,
  showFaculty = false,
  markAttended,
  markAbsent,
}: {
  rows: AttendanceRow[];
  canEdit: boolean;
  showFaculty?: boolean;
  markAttended?: Act;
  markAbsent?: Act;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "rejected">("all");
  const shown = useMemo(
    () =>
      rows.filter((r) =>
        filter === "all"
          ? true
          : filter === "pending"
            ? r.status === "PENDING"
            : filter === "confirmed"
              ? r.status === "CONFIRMED"
              : r.status === "REJECTED"
      ),
    [rows, filter]
  );
  const pending = rows.filter((r) => r.status === "PENDING").length;
  const attended = rows.filter((r) => r.status === "CONFIRMED").length;
  const absent = rows.filter((r) => r.status === "REJECTED").length;
  const all = shown.length > 0 && shown.every((r) => selected.has(r.id));
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
        Chưa có sinh viên nào đăng ký.
      </div>
    );
  }

  const tabs = [
    { key: "all", label: `Tất cả (${rows.length})` },
    { key: "pending", label: `Chờ xác nhận (${pending})` },
    { key: "confirmed", label: `Tham gia (${attended})` },
    { key: "rejected", label: `Không tham gia (${absent})` },
  ] as const;

  return (
    <form className="flex flex-col gap-3" onSubmit={() => setSelected(new Set())}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setFilter(t.key);
                setSelected(new Set());
              }}
              className={
                "rounded-md px-3 py-1.5 text-sm font-medium " +
                (filter === t.key ? "bg-background shadow-sm" : "text-muted-foreground")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {canEdit && (
        <div className="sticky top-14 z-[5] flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2">
          <span className="px-2 text-sm text-muted-foreground">
            Đã chọn {selected.size}/{shown.length}
          </span>
          <Button
            type="submit"
            formAction={markAttended}
            disabled={selected.size === 0}
            size="sm"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Check className="size-4" /> Tham gia
          </Button>
          <Button type="submit" formAction={markAbsent} disabled={selected.size === 0} size="sm" variant="outline">
            <X className="size-4" /> Không tham gia
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              {canEdit && (
                <th className="w-10 px-3 py-2">
                  <input
                    type="checkbox"
                    aria-label="Chọn tất cả"
                    checked={all}
                    onChange={() => setSelected(all ? new Set() : new Set(shown.map((r) => r.id)))}
                    className="size-4 accent-[#0072bc]"
                  />
                </th>
              )}
              <th className="px-3 py-2 font-medium">Mã SV</th>
              <th className="px-3 py-2 font-medium">Họ tên</th>
              <th className="px-3 py-2 font-medium">Lớp</th>
              {showFaculty && <th className="px-3 py-2 font-medium">Khoa</th>}
              <th className="px-3 py-2 font-medium">Đăng ký lúc</th>
              <th className="px-3 py-2 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr
                key={r.id}
                className={"border-t " + (canEdit ? "cursor-pointer hover:bg-muted/40" : "")}
                onClick={canEdit ? () => toggle(r.id) : undefined}
              >
                {canEdit && (
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      name="ids"
                      value={r.id}
                      checked={selected.has(r.id)}
                      onChange={() => toggle(r.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Chọn ${r.name}`}
                      className="size-4 accent-[#0072bc]"
                    />
                  </td>
                )}
                <td className="px-3 py-2">{r.studentId}</td>
                <td className="px-3 py-2 font-medium">{r.name}</td>
                <td className="px-3 py-2">{r.className}</td>
                {showFaculty && <td className="px-3 py-2">{r.faculty}</td>}
                <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(new Date(r.createdAt))}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}
