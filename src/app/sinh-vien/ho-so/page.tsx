import Link from "next/link";
import { KeyRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { buttonVariants } from "@/components/ui/button";
import { ProfileForm } from "./profile-form";

export default async function StudentProfilePage() {
  const me = await requireRole("STUDENT");
  const u = await prisma.user.findUniqueOrThrow({ where: { id: me.id }, select: { dob: true } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground">Thông tin dùng trong danh sách tham gia và báo cáo của Đoàn – Hội.</p>
      </div>
      <ProfileForm
        initial={{
          studentId: me.studentId ?? "",
          faculty: me.faculty ?? "",
          name: me.name,
          dob: u.dob ? u.dob.toISOString().slice(0, 10) : "",
          className: me.className ?? "",
        }}
      />
      <div className="border-t pt-5">
        <Link href="/doi-mat-khau" className={buttonVariants({ variant: "outline", className: "h-10" })}>
          <KeyRound className="size-4" /> Đổi mật khẩu
        </Link>
      </div>
    </div>
  );
}
