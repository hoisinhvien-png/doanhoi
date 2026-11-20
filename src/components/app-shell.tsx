import { Suspense, type ReactNode } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { NavLinks } from "@/components/nav-links";
import { BrandFooter, BrandHeader } from "@/components/brand-header";
import { requireRole } from "@/lib/dal";
import { ROLE_LABEL, ROLE_MENU, type RoleName } from "@/lib/roles";

/** Khung trang sau khi đăng nhập: thanh đầu trang, menu theo vai trò, nội dung */
export function AppShell({ role, children }: { role: RoleName; children: ReactNode }) {
  const menu = ROLE_MENU[role];
  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-950 dark:via-background dark:to-background">
      {/* Cùng banner với trang chủ */}
      <BrandHeader
        wide
        sticky
        right={
          <Suspense fallback={<div className="h-9 w-40 animate-pulse rounded bg-white/10" />}>
            <UserBox role={role} />
          </Suspense>
        }
      />

      {/* Điện thoại: menu ngang */}
      <div className="border-b bg-background pt-2 md:hidden">
        <NavLinks items={menu} layout="horizontal" />
      </div>

      <div className="flex flex-1">
        {/* Máy tính: menu dọc */}
        <aside className="hidden w-60 shrink-0 border-r bg-background p-3 md:block">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {ROLE_LABEL[role]}
          </p>
          <NavLinks items={menu} layout="vertical" />
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Suspense fallback={<p className="text-muted-foreground">Đang tải…</p>}>
            <Guard role={role}>{children}</Guard>
          </Suspense>
        </main>
      </div>
      <BrandFooter />
    </div>
  );
}

/** Chặn người sai vai trò trước khi hiện nội dung */
async function Guard({ role, children }: { role: RoleName; children: ReactNode }) {
  await requireRole(role);
  return <>{children}</>;
}

async function UserBox({ role }: { role: RoleName }) {
  const user = await requireRole(role);
  const sub = user.role === "STUDENT" ? user.className : user.faculty;
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right leading-tight sm:block">
        <p className="text-sm font-semibold">{user.name}</p>
        <p className="text-xs text-white/75">
          {ROLE_LABEL[user.role]}
          {sub ? ` · ${sub}` : ""}
        </p>
      </div>
      <form action={logout}>
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          aria-label="Đăng xuất"
          className="text-white hover:bg-white/15 hover:text-white"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </Button>
      </form>
    </div>
  );
}
