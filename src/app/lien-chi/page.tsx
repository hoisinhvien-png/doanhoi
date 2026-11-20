import { CalendarDays, CheckCircle2, Clock, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { monthlyConfirmed, participationRates, schoolYear, upcomingEvents } from "@/lib/stats";
import { StatTile } from "@/components/stat-tile";
import { ChartCard } from "@/components/chart-card";
import { MonthlyColumnChart, RateBarChart } from "@/components/charts";
import { UpcomingList } from "@/components/upcoming-list";
import { CONFIRM_DAYS, lcdWindow } from "@/lib/attendance";

export default async function LcdHome() {
  const me = await requireRole("LCD");
  if (!me.faculty) {
    return (
      <p className="text-muted-foreground">
        Tài khoản chưa được gán khoa. Liên hệ Đoàn trường để được gán khoa quản lý.
      </p>
    );
  }
  const now = new Date();
  const sy = schoolYear(now);
  const inFaculty = { user: { faculty: me.faculty } };

  const [students, recent, confirmedYear, rates, monthly, upcoming] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", faculty: me.faculty } }),
    // Sự kiện vừa diễn ra có sinh viên khoa mình đăng ký, còn trong hạn xác nhận
    prisma.event.findMany({
      where: {
        date: { gte: new Date(now.getTime() - (CONFIRM_DAYS + 1) * 86400e3), lte: now },
        participations: { some: inFaculty },
      },
      select: { date: true },
    }),
    prisma.eventParticipation.count({
      where: { ...inFaculty, status: "CONFIRMED", event: { date: { gte: sy.from, lte: sy.to } } },
    }),
    participationRates(sy.from, sy.to, me.faculty),
    monthlyConfirmed(sy.from, sy.to, me.faculty),
    upcomingEvents(now, me.faculty),
  ]);
  const confirming = recent.filter((e) => lcdWindow(e.date, now) === "open").length;
  const active = rates.reduce((s, r) => s + r.active, 0);
  const overall = students ? Math.round((active / students) * 1000) / 10 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan khoa {me.faculty}</h1>
        <p className="text-muted-foreground">Xin chào {me.name} · Năm học {sy.label}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Cần xác nhận tham gia" value={confirming} hint={confirming ? `sự kiện còn trong hạn ${CONFIRM_DAYS} ngày` : "Không có sự kiện nào"} href="/lien-chi/su-kien" icon={<Clock className="size-4" />} />
        <StatTile label="Sinh viên khoa" value={students} href="/lien-chi/sinh-vien" icon={<Users className="size-4" />} />
        <StatTile label="Tỷ lệ tham gia" value={`${overall}%`} hint={`${active}/${students} SV có ít nhất 1 sự kiện`} icon={<CheckCircle2 className="size-4" />} />
        <StatTile label="Lượt tham gia" value={confirmedYear} hint="trong năm học" href="/lien-chi/bao-cao?tt=CONFIRMED" icon={<CalendarDays className="size-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Tỷ lệ tham gia theo lớp"
          description="% sinh viên có ít nhất 1 sự kiện tham gia trong năm học"
          empty={rates.length === 0 ? "Khoa chưa có sinh viên trong hệ thống." : undefined}
          table={{ headers: ["Lớp", "Sinh viên", "Đã tham gia", "Tỷ lệ (%)"], rows: rates.map((r) => [r.name, r.total, r.active, r.rate]) }}
        >
          <RateBarChart data={rates} />
        </ChartCard>
        <ChartCard
          title="Lượt tham gia theo tháng"
          description="Sinh viên trong khoa, theo ngày diễn ra sự kiện"
          table={{ headers: ["Tháng", "Lượt"], rows: monthly.map((m) => [m.month, m.count]) }}
        >
          <MonthlyColumnChart data={monthly} />
        </ChartCard>
      </div>

      <UpcomingList events={upcoming} linkBase="/lien-chi/su-kien" />
    </div>
  );
}
