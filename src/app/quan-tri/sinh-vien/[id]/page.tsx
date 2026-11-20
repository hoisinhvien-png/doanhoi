import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock, LockOpen, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { getFaculties } from "@/lib/queries";
import { formatDateTime } from "@/lib/format";
import {
  deleteStudent,
  resetStudentPassword,
  setStudentLocked,
  updateStudent,
} from "@/app/actions/students";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/confirm-button";
import { StatusBadge } from "@/components/status-badge";
import { StudentForm } from "../student-form";

export default async function EditStudentPage({ params, searchParams }: PageProps<"/quan-tri/sinh-vien/[id]">) {
  await requireRole("ADMIN");
  const { id } = await params;
  const sp = await searchParams;
  const [s, faculties] = await Promise.all([
    prisma.user.findFirst({
      where: { id, role: "STUDENT" },
      include: {
        participations: {
          orderBy: { event: { date: "desc" } },
          include: { event: { select: { id: true, title: true, date: true } } },
        },
      },
    }),
    getFaculties(),
  ]);
  if (!s) notFound();
  const attended = s.participations.filter((p) => p.status === "CONFIRMED").length;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/quan-tri/sinh-vien" className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Danh sách sinh viên
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            {s.name}
            {s.locked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-200">
                <Lock className="size-3" /> Đã khoá
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">
            Tài khoản <b className="font-mono text-foreground">{s.username ?? "(chưa có)"}</b> · Mã SV {s.studentId} ·{" "}
            {s.mustChangePassword ? "chưa đổi mật khẩu lần đầu" : "đã đổi mật khẩu"}
          </p>
        </div>
      </div>

      {sp.moi === "1" && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          Đã tạo tài khoản <b className="font-mono">{s.username}</b>. Mật khẩu ban đầu là ngày sinh (ddMMyyyy); sinh viên
          sẽ được yêu cầu đổi ở lần đăng nhập đầu.
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Thông tin</h2>
        <StudentForm
          action={updateStudent.bind(null, s.id)}
          faculties={faculties}
          submitLabel="Lưu thay đổi"
          initial={{
            studentId: s.studentId ?? "",
            name: s.name,
            dob: s.dob ? s.dob.toISOString().slice(0, 10) : "",
            className: s.className ?? "",
            faculty: s.faculty ?? "",
            username: s.username ?? "",
          }}
        />
      </section>

      <section className="flex max-w-3xl flex-wrap gap-2 rounded-xl border bg-background p-4">
        <form action={resetStudentPassword.bind(null, s.id)}>
          <Button type="submit" variant="outline" disabled={!s.dob}>
            Đặt lại mật khẩu về ngày sinh
          </Button>
        </form>
        <form action={setStudentLocked.bind(null, s.id, !s.locked)}>
          <Button type="submit" variant="outline">
            {s.locked ? <LockOpen className="size-4" /> : <Lock className="size-4" />}
            {s.locked ? "Mở khoá tài khoản" : "Khoá tài khoản"}
          </Button>
        </form>
        <ConfirmButton
          action={deleteStudent.bind(null, s.id)}
          message={`Xoá hẳn tài khoản ${s.name} (${s.studentId}) và ${s.participations.length} lượt đăng ký sự kiện? Không khôi phục được. Nếu chỉ muốn tạm ngừng, hãy dùng "Khoá tài khoản".`}
          variant="destructive"
        >
          <Trash2 className="size-4" /> Xoá tài khoản
        </ConfirmButton>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          Sự kiện đã đăng ký ({s.participations.length}) · {attended} tham gia
        </h2>
        {s.participations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa đăng ký sự kiện nào.</p>
        ) : (
          <ul className="flex max-w-3xl flex-col divide-y rounded-xl border bg-background">
            {s.participations.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <Link href={`/quan-tri/su-kien/${p.event.id}`} className="font-medium hover:underline">
                    {p.event.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{formatDateTime(p.event.date)}</p>
                </div>
                <StatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
