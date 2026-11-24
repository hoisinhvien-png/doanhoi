import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { schoolYear } from "@/lib/stats";
import { NewFeedbackForm } from "../new-feedback-form";

export default async function NewFeedbackPage() {
  await requireRole("STUDENT");
  const sy = schoolYear(new Date());
  const events = await prisma.event.findMany({
    where: { date: { gte: sy.from, lte: sy.to } },
    orderBy: { date: "desc" },
    select: { id: true, title: true },
  });

  return (
    <div className="flex flex-col gap-5">
      <Link href="/sinh-vien/y-kien" className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Ý kiến của tôi
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Gửi ý kiến mới</h1>
        <p className="text-muted-foreground">
          Chọn nơi gửi (Liên chi Đoàn khoa hoặc Đoàn trường); nơi đó sẽ xem xét và phản hồi.
        </p>
      </div>
      <NewFeedbackForm events={events} />
    </div>
  );
}
