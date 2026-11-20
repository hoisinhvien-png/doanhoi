"use client";

// Biểu đồ dùng chung. Một chuỗi số liệu nên không cần chú thích màu (tiêu đề đã nói rõ).
// Cột/thanh mảnh (≤ 24px), bo 4px ở đầu số liệu, lưới mờ, có ô chú thích khi rê chuột.
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SERIES = "var(--chart-1)";
const GRID = "var(--chart-grid)";
const AXIS = "var(--chart-axis)";

function TooltipBox({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{title}</p>
      {lines.map((l) => (
        <p key={l} className="text-muted-foreground">{l}</p>
      ))}
    </div>
  );
}

export type RateDatum = { name: string; total: number; active: number; rate: number };

/** Thanh ngang: tỷ lệ tham gia (%) theo khoa hoặc lớp */
export function RateBarChart({ data }: { data: RateDatum[] }) {
  const height = Math.max(120, data.length * 36 + 30);
  // Cột tên vừa đủ tên dài nhất (khoảng 7px mỗi ký tự), tối đa 180px
  const labelWidth = Math.min(180, Math.max(60, ...data.map((d) => d.name.length * 7 + 12)));
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }}>
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis
            type="number"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: AXIS, fontSize: 12 }}
            axisLine={{ stroke: GRID }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={labelWidth}
            interval={0}
            tick={{ fill: "var(--foreground)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            content={({ active, payload }) =>
              active && payload?.[0] ? (
                <TooltipBox
                  title={(payload[0].payload as RateDatum).name}
                  lines={[
                    `Tỷ lệ tham gia: ${(payload[0].payload as RateDatum).rate}%`,
                    `${(payload[0].payload as RateDatum).active}/${(payload[0].payload as RateDatum).total} sinh viên có ít nhất 1 sự kiện tham gia`,
                  ]}
                />
              ) : null
            }
          />
          <Bar dataKey="rate" fill={SERIES} barSize={18} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList
              dataKey="rate"
              position="right"
              formatter={(v) => `${v}%`}
              style={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type MonthDatum = { month: string; count: number };

/** Cột đứng: số lượt tham gia theo tháng */
export function MonthlyColumnChart({ data }: { data: MonthDatum[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 8, bottom: 4, left: -16 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis
            dataKey="month"
            tick={{ fill: AXIS, fontSize: 12 }}
            axisLine={{ stroke: GRID }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: AXIS, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            content={({ active, payload }) =>
              active && payload?.[0] ? (
                <TooltipBox
                  title={`Tháng ${(payload[0].payload as MonthDatum).month}`}
                  lines={[`${(payload[0].payload as MonthDatum).count} lượt tham gia`]}
                />
              ) : null
            }
          />
          <Bar dataKey="count" fill={SERIES} barSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
