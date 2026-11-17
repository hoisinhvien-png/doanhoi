import { CalendarDays, CheckCircle2, Clock, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { monthlyConfirmed, participationRates, schoolYear, upcomingEvents } from "@/lib/stats";
import { StatTile } from "@/components/stat-tile";
import { ChartCard } from "@/components/chart-card";
import { MonthlyColumnChart, RateBarChart } from "@/components/charts";
import { UpcomingList } from "@/components/upcoming-list";

export default async function AdminHome() {
  const me = await requireRole("ADMIN");
  const now = new Date();
  const sy = schoolYear(now);
  const inYear = { date: { gte: sy.from, lte: sy.to } };

  const [students, eventsYear, confirmedYear, pending, rates, monthly, upcoming] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.event.count({ where: inYear }),
    prisma.eventParticipation.count({ where: { status: "CONFIRMED", event: inYear } }),
    prisma.eventParticipation.count({ where: { status: "PENDING" } }),
    participationRates(sy.from, sy.to),
    monthlyConfirmed(sy.from, sy.to),
    upcomingEvents(now),
  ]);
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
        <StatTile label="Lượt tham gia được duyệt" value={confirmedYear} hint="trong năm học" href="/quan-tri/bao-cao?tt=CONFIRMED" icon={<CheckCircle2 className="size-4" />} />
        <StatTile label="Đang chờ LCĐ duyệt" value={pending} hint="toàn trường" href="/quan-tri/bao-cao?tt=PENDING" icon={<Clock className="size-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Tỷ lệ tham gia theo khoa"
          description="% sinh viên có ít nhất 1 sự kiện được duyệt trong năm học"
          empty={rates.length === 0 ? "Chưa có sinh viên. Hãy nhập danh sách ở mục Sinh viên." : undefined}
          table={{ headers: ["Khoa", "Sinh viên", "Đã tham gia", "Tỷ lệ (%)"], rows: rates.map((r) => [r.name, r.total, r.active, r.rate]) }}
        >
          <RateBarChart data={rates} />
        </ChartCard>
        <ChartCard
          title="Lượt tham gia được duyệt theo tháng"
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
