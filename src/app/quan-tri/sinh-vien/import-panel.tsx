"use client";

import { startTransition, useActionState } from "react";
import { Download, FileUp } from "lucide-react";
import { importStudents, type ImportState } from "@/app/actions/students";
import { Button } from "@/components/ui/button";
import { FormError, FormField } from "@/components/form-field";
import { Label } from "@/components/ui/label";

/** Nhập sinh viên từ Excel: chọn file -> Xem trước -> Nhập vào hệ thống */
export function ImportPanel({ faculties }: { faculties: string[] }) {
  const [state, action, pending] = useActionState<ImportState, FormData>(importStudents, undefined);
  const preview = state && "mode" in state && state.mode === "preview" ? state : null;
  const done = state && "mode" in state && state.mode === "done" ? state : null;

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-background p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Nhập danh sách từ Excel</h2>
        <a
          href="/api/excel/mau-sinh-vien"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0b4f9c] hover:underline dark:text-sky-400"
        >
          <Download className="size-4" /> Tải file mẫu
        </a>
      </div>
      <p className="text-sm text-muted-foreground">
        Dùng file danh sách điểm của trường. Phần mềm tự tìm các cột <b>Mã SV</b>, <b>Họ và tên</b>{" "}
        (hoặc Họ đệm + Tên), <b>Ngày sinh</b>, <b>Lớp</b>, <b>Khoa</b>. Sinh viên mới có mật khẩu
        ban đầu là ngày sinh (ddMMyyyy); sinh viên đã có chỉ được cập nhật thông tin, giữ nguyên mật khẩu.
      </p>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          // Gửi thủ công (không dùng action=) để form KHÔNG bị xoá trắng sau khi Xem trước,
          // nhờ vậy bấm "Nhập" không phải chọn lại file.
          e.preventDefault();
          const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
          const fd = new FormData(e.currentTarget);
          fd.set("mode", submitter?.value ?? "preview");
          startTransition(() => action(fd));
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="file">File Excel (.xlsx) *</Label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".xlsx"
              required
              className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
            />
          </div>
          <FormField
            id="defaultFaculty"
            label="Khoa (nếu file không có cột Khoa)"
            list="faculty-list-import"
            placeholder="VD: Công nghệ thông tin"
          />
          <datalist id="faculty-list-import">
            {faculties.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
        </div>

        <FormError message={state && "error" in state ? state.error : undefined} />

        <div className="flex flex-wrap gap-2">
          <Button type="submit" value="preview" variant="outline" disabled={pending} className="h-10">
            <FileUp className="size-4" />
            {pending ? "Đang đọc…" : "Xem trước"}
          </Button>
          {preview && preview.valid > 0 && (
            <Button type="submit" value="import" disabled={pending} className="h-10">
              Nhập {preview.valid} sinh viên
            </Button>
          )}
        </div>
      </form>

      {done && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          Đã nhập xong: thêm mới {done.created}, cập nhật {done.updated}, bỏ qua {done.skipped} dòng lỗi.
        </p>
      )}

      {preview && (
        <div className="flex flex-col gap-3">
          <p className="text-sm">
            Sheet <b>{preview.sheetName}</b>, tiêu đề ở dòng {preview.headerLine}. Nhận ra cột:{" "}
            {Object.entries(preview.found).map(([k, v]) => (
              <span key={k} className="mr-2 inline-block rounded bg-muted px-1.5 py-0.5 text-xs">
                {k} ← “{v}”
              </span>
            ))}
          </p>
          <p className="text-sm">
            Tổng <b>{preview.total}</b> dòng: <b className="text-emerald-700">{preview.valid}</b> hợp lệ (
            {preview.newCount} mới, {preview.updateCount} cập nhật),{" "}
            <b className="text-destructive">{preview.total - preview.valid}</b> dòng lỗi sẽ bị bỏ qua.
          </p>
          <div className="max-h-96 overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted text-left">
                <tr>
                  <th className="px-2 py-1.5 font-medium">Dòng</th>
                  <th className="px-2 py-1.5 font-medium">Mã SV</th>
                  <th className="px-2 py-1.5 font-medium">Họ tên</th>
                  <th className="px-2 py-1.5 font-medium">Ngày sinh</th>
                  <th className="px-2 py-1.5 font-medium">Lớp</th>
                  <th className="px-2 py-1.5 font-medium">Khoa</th>
                  <th className="px-2 py-1.5 font-medium">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {preview.sample.map((r) => (
                  <tr key={r.line} className={r.errors.length ? "border-t bg-destructive/5" : "border-t"}>
                    <td className="px-2 py-1.5">{r.line}</td>
                    <td className="px-2 py-1.5">{r.studentId}</td>
                    <td className="px-2 py-1.5">{r.name}</td>
                    <td className="px-2 py-1.5">{r.dob}</td>
                    <td className="px-2 py-1.5">{r.className}</td>
                    <td className="px-2 py-1.5">{r.faculty}</td>
                    <td className="px-2 py-1.5">
                      {r.errors.length ? (
                        <span className="text-destructive">{r.errors.join("; ")}</span>
                      ) : r.isNew ? (
                        "Mới"
                      ) : (
                        "Cập nhật"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Bảng trên hiện 10 dòng hợp lệ đầu tiên và tối đa 100 dòng lỗi.
          </p>
        </div>
      )}
    </section>
  );
}
