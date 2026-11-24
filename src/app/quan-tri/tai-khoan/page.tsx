import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { getFaculties } from "@/lib/queries";
import { ROLE_LABEL } from "@/lib/roles";
import { deleteStaffAccount } from "@/app/actions/accounts";
import { ConfirmButton } from "@/components/confirm-button";
import { CreateStaffForm, ResetStaffButton } from "./account-forms";

export default async function AccountsPage() {
  await requireRole("ADMIN");
  const [faculties, accounts] = await Promise.all([
    getFaculties(),
    prisma.user.findMany({
      where: { role: "LCD" },
      orderBy: [{ faculty: "asc" }, { email: "asc" }],
      select: { id: true, email: true, name: true, role: true, faculty: true, mustChangePassword: true, _count: { select: { approvals: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Tài khoản Liên chi Đoàn</h1>
        <p className="text-muted-foreground">
          Tài khoản Liên chi Đoàn khoa: xem, xác nhận sinh viên và nhận ý kiến của khoa mình.
        </p>
      </div>

      <section className="rounded-xl border bg-background p-4">
        <h2 className="mb-3 font-semibold">Tạo tài khoản mới</h2>
        <CreateStaffForm faculties={faculties} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Danh sách ({accounts.length})</h2>
        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có tài khoản cán bộ nào.</p>
        ) : (
          <div className="grid gap-3">
            {accounts.map((a) => (
              <div key={a.id} className="flex flex-col gap-3 rounded-xl border bg-background p-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium">
                    {a.name} <span className="text-sm font-normal text-muted-foreground">· {ROLE_LABEL[a.role]}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {a.email}
                    {` · Khoa ${a.faculty ?? "(chưa gán)"} · đã xác nhận ${a._count.approvals} lượt`}
                    {a.mustChangePassword ? " · chưa đổi mật khẩu" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  <ResetStaffButton userId={a.id} />
                  <ConfirmButton
                    action={deleteStaffAccount.bind(null, a.id)}
                    message={`Xoá tài khoản ${a.email}? Các lượt/phản hồi đã thực hiện vẫn được giữ.`}
                    variant="destructive"
                    size="sm"
                  >
                    Xoá
                  </ConfirmButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
