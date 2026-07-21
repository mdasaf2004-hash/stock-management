"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = [
  "oklch(0.623 0.265 262.881)",
  "oklch(0.696 0.215 153.582)",
  "oklch(0.769 0.188 70.08)",
  "oklch(0.828 0.18 25.463)",
  "oklch(0.623 0.265 290)",
  "oklch(0.7 0.2 200)",
];

interface ChartData {
  category: string;
  value: number;
}

export function StockChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
        <XAxis
          dataKey="category"
          tick={{ fill: "oklch(0.708 0 0)", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "oklch(0.708 0 0)", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "oklch(0.175 0.01 262)",
            border: "1px solid oklch(1 0 0 / 8%)",
            borderRadius: "8px",
            color: "oklch(0.985 0 0)",
            fontSize: "13px",
          }}
          formatter={(value) => [
            `₹${Number(value).toLocaleString()}`,
            "Value",
          ]}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
