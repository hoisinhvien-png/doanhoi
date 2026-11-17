import { CalendarDays, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { formatDateTime, startOfTodayVN } from "@/lib/format";
import { cancelRegistration, registerEvent } from "@/app/actions/participations";
import { Button } from "@/components/ui/button";
import { StatusBadge, Tag } from "@/components/status-badge";

export default async function StudentHome() {
  const me = await requireRole("STUDENT");

  // Sự kiện đang mở: chưa qua ngày, toàn trường hoặc đúng khoa mình
  const events = await prisma.event.findMany({
    where: {
      registrationOpen: true,
      date: { gte: startOfTodayVN(new Date()) },
      OR: [{ faculty: null }, ...(me.faculty ? [{ faculty: me.faculty }] : [])],
    },
    orderBy: { date: "asc" },
    include: { participations: { where: { userId: me.id }, select: { status: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Xin chào, {me.name}</h1>
        <p className="text-muted-foreground">
          {me.studentId} · {me.className} · {me.faculty}
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Sự kiện đang mở đăng ký</h2>
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-background p-10 text-center text-muted-foreground">
            Hiện chưa có sự kiện nào mở đăng ký.
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {events.map((ev) => {
              const mine = ev.participations[0];
              return (
                <article key={ev.id} className="flex flex-col gap-3 rounded-xl border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{ev.title}</h3>
                    {mine && <StatusBadge status={mine.status} />}
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4" />
                      {formatDateTime(ev.date)}
                    </span>
                    {ev.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-4" />
                        {ev.location}
                      </span>
                    )}
                  </div>
                  {ev.description && (
                    <p className="line-clamp-3 text-sm whitespace-pre-line">{ev.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <Tag tone="blue">{ev.faculty ?? "Toàn trường"}</Tag>
                    {!mine && (
                      <form action={registerEvent.bind(null, ev.id)}>
                        <Button type="submit" className="h-9 px-5">Đăng ký</Button>
                      </form>
                    )}
                    {mine?.status === "PENDING" && (
                      <form action={cancelRegistration.bind(null, ev.id)}>
                        <Button type="submit" variant="outline" className="h-9">Huỷ đăng ký</Button>
                      </form>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
