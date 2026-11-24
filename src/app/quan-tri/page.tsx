import { CalendarDays, CheckCircle2, Clock, MessageSquare, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { STAFF_OPEN } from "@/lib/feedback";
import { monthlyConfirmed, participationRates, schoolYear, upcomingEvents } from "@/lib/stats";
import { StatTile } from "@/components/stat-tile";
import { ChartCard } from "@/components/chart-card";
import { MonthlyColumnChart, RateBarChart } from "@/components/charts";
import { UpcomingList } from "@/components/upcoming-list";
import { CONFIRM_DAYS, lcdWindow } from "@/lib/attendance";

export default async function AdminHome() {
  const me = await requireRole("ADMIN");
  const now = new Date();
  const sy = schoolYear(now);
  const inYear = { date: { gte: sy.from, lte: sy.to } };

  const [students, eventsYear, confirmedYear, recent, rates, monthly, upcoming, openFeedback] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.event.count({ where: inYear }),
    prisma.eventParticipation.count({ where: { status: "CONFIRMED", event: inYear } }),
    // Sự kiện vừa diễn ra, LCĐ còn trong hạn 7 ngày xác nhận
    prisma.event.findMany({
      where: { date: { gte: new Date(now.getTime() - (CONFIRM_DAYS + 1) * 86400e3), lte: now } },
      select: { date: true },
    }),
    participationRates(sy.from, sy.to),
    monthlyConfirmed(sy.from, sy.to),
    upcomingEvents(now),
    prisma.feedback.count({ where: { status: { in: STAFF_OPEN } } }),
  ]);
  const confirming = recent.filter((e) => lcdWindow(e.date, now) === "open").length;
  const active = rates.reduce((s, r) => s + r.active, 0);
  const overall = students ? Math.round((active / students) * 1000) / 10 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan toàn trường</h1>
        <p className="text-muted-foreground">Xin chào {me.name} · Năm học {sy.label}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Sinh viên" value={students} hint={`${overall}% đã tham gia ít nhất 1 sự kiện`} href="/quan-tri/sinh-vien" icon={<Users className="size-4" />} />
        <StatTile label="Sự kiện năm học" value={eventsYear} hint={`${upcoming.length} sự kiện sắp diễn ra`} href="/quan-tri/su-kien" icon={<CalendarDays className="size-4" />} />
        <StatTile label="Lượt tham gia" value={confirmedYear} hint="trong năm học" href="/quan-tri/bao-cao?tt=CONFIRMED" icon={<CheckCircle2 className="size-4" />} />
        <StatTile label="Đang trong hạn xác nhận" value={confirming} hint={`sự kiện LCĐ còn ${CONFIRM_DAYS} ngày xác nhận`} href="/quan-tri/su-kien" icon={<Clock className="size-4" />} />
        <StatTile label="Ý kiến chờ xử lý" value={openFeedback} hint={openFeedback ? "sinh viên đang chờ phản hồi" : "Không có"} href="/quan-tri/y-kien" icon={<MessageSquare className="size-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Tỷ lệ tham gia theo khoa"
          description="% sinh viên có ít nhất 1 sự kiện tham gia trong năm học"
          empty={rates.length === 0 ? "Chưa có sinh viên. Hãy nhập danh sách ở mục Sinh viên." : undefined}
          table={{ headers: ["Khoa", "Sinh viên", "Đã tham gia", "Tỷ lệ (%)"], rows: rates.map((r) => [r.name, r.total, r.active, r.rate]) }}
        >
          <RateBarChart data={rates} />
        </ChartCard>
        <ChartCard
          title="Lượt tham gia theo tháng"
          description="Tính theo ngày diễn ra sự kiện"
          table={{ headers: ["Tháng", "Lượt"], rows: monthly.map((m) => [m.month, m.count]) }}
        >
          <MonthlyColumnChart data={monthly} />
        </ChartCard>
      </div>

      <UpcomingList events={upcoming} linkBase="/quan-tri/su-kien" />
    </div>
  );
}
