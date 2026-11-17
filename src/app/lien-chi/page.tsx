import { CalendarDays, CheckCircle2, Clock, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { monthlyConfirmed, participationRates, schoolYear, upcomingEvents } from "@/lib/stats";
import { StatTile } from "@/components/stat-tile";
import { ChartCard } from "@/components/chart-card";
import { MonthlyColumnChart, RateBarChart } from "@/components/charts";
import { UpcomingList } from "@/components/upcoming-list";

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

  const [students, pending, confirmedYear, rates, monthly, upcoming] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", faculty: me.faculty } }),
    prisma.eventParticipation.count({ where: { ...inFaculty, status: "PENDING" } }),
    prisma.eventParticipation.count({
      where: { ...inFaculty, status: "CONFIRMED", event: { date: { gte: sy.from, lte: sy.to } } },
    }),
    participationRates(sy.from, sy.to, me.faculty),
    monthlyConfirmed(sy.from, sy.to, me.faculty),
    upcomingEvents(now, me.faculty),
  ]);
  const active = rates.reduce((s, r) => s + r.active, 0);
  const overall = students ? Math.round((active / students) * 1000) / 10 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan khoa {me.faculty}</h1>
        <p className="text-muted-foreground">Xin chào {me.name} · Năm học {sy.label}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Chờ duyệt" value={pending} hint={pending ? "Bấm để duyệt ngay" : "Không có lượt nào"} href="/lien-chi/duyet" icon={<Clock className="size-4" />} />
        <StatTile label="Sinh viên khoa" value={students} href="/lien-chi/sinh-vien" icon={<Users className="size-4" />} />
        <StatTile label="Tỷ lệ tham gia" value={`${overall}%`} hint={`${active}/${students} SV có ít nhất 1 sự kiện`} icon={<CheckCircle2 className="size-4" />} />
        <StatTile label="Lượt được duyệt" value={confirmedYear} hint="trong năm học" href="/lien-chi/bao-cao?tt=CONFIRMED" icon={<CalendarDays className="size-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Tỷ lệ tham gia theo lớp"
          description="% sinh viên có ít nhất 1 sự kiện được duyệt trong năm học"
          empty={rates.length === 0 ? "Khoa chưa có sinh viên trong hệ thống." : undefined}
          table={{ headers: ["Lớp", "Sinh viên", "Đã tham gia", "Tỷ lệ (%)"], rows: rates.map((r) => [r.name, r.total, r.active, r.rate]) }}
        >
          <RateBarChart data={rates} />
        </ChartCard>
        <ChartCard
          title="Lượt tham gia được duyệt theo tháng"
          description="Sinh viên trong khoa, theo ngày diễn ra sự kiện"
          table={{ headers: ["Tháng", "Lượt"], rows: monthly.map((m) => [m.month, m.count]) }}
        >
          <MonthlyColumnChart data={monthly} />
        </ChartCard>
      </div>

      <UpcomingList events={upcoming} />
    </div>
  );
}
