import Link from "next/link";
import { CalendarPlus, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { formatDateTime } from "@/lib/format";
import { toggleRegistration } from "@/app/actions/events";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tag } from "@/components/status-badge";

export default async function AdminEventsPage() {
  await requireRole("ADMIN");
  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: {
      participations: { select: { status: true } },
      createdBy: { select: { role: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Sự kiện</h1>
          <p className="text-muted-foreground">{events.length} sự kiện</p>
        </div>
        <Link
          href="/quan-tri/su-kien/moi"
          className={buttonVariants({ className: "h-10 px-4" })}
        >
          <CalendarPlus className="size-4" />
          Thêm sự kiện
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-background p-10 text-center text-muted-foreground">
          Chưa có sự kiện nào. Bấm “Thêm sự kiện” để tạo sự kiện đầu tiên.
        </div>
      ) : (
        <div className="grid gap-3">
          {events.map((ev) => {
            const count = (s: string) =>
              ev.participations.filter((p) => p.status === s).length;
            return (
              <div
                key={ev.id}
                className="flex flex-col gap-3 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    href={`/quan-tri/su-kien/${ev.id}`}
                    className="font-semibold hover:underline"
                  >
                    {ev.title}
                  </Link>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span>{formatDateTime(ev.date)}</span>
                    {ev.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {ev.location}
                      </span>
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Tag tone="blue">{ev.faculty ?? "Toàn trường"}</Tag>
                    {ev.createdBy?.role === "LCD" && <Tag tone="green">LCĐ khoa tạo</Tag>}
                    <Tag>
                      {ev.participations.length} đăng ký · {count("CONFIRMED")} tham gia
                    </Tag>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={toggleRegistration.bind(null, ev.id)}>
                    <Button type="submit" variant="outline" size="sm">
                      {ev.registrationOpen ? "Đóng đăng ký" : "Mở đăng ký"}
                    </Button>
                  </form>
                  <Link
                    href={`/quan-tri/su-kien/${ev.id}`}
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    Sửa
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
