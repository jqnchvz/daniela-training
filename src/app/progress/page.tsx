"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Demo data for charts (will be replaced with Supabase queries)
const DEMO_WELLBEING = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }),
  energy: Math.round(5 + Math.random() * 4),
  sleep: Math.round(5 + Math.random() * 4),
  mood: Math.round(5 + Math.random() * 4),
  soreness: Math.round(2 + Math.random() * 5),
}));

const DEMO_VOLUME = Array.from({ length: 8 }, (_, i) => ({
  week: `W${i + 1}`,
  volume: Math.round(1500 + i * 200 + Math.random() * 300),
}));

export default function ProgressPage() {
  const [wellbeingRange, setWellbeingRange] = useState<7 | 30 | 90>(7);

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">Progress</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Track your strength and wellbeing trends.
      </p>

      {/* Summary cards */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <SummaryCard label="Streak" value="--" detail="days" />
        <SummaryCard label="This week" value="0/3" detail="sessions" />
        <SummaryCard label="Energy avg" value="--" detail="7-day" />
        <SummaryCard label="Next session" value="--" detail="" />
      </div>

      {/* Wellbeing chart */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Wellbeing Trends</h2>
          <div className="flex gap-1">
            {([7, 30, 90] as const).map((range) => (
              <button
                key={range}
                onClick={() => setWellbeingRange(range)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  wellbeingRange === range
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {range}d
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={DEMO_WELLBEING}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                stroke="var(--muted-foreground)"
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 10 }}
                stroke="var(--muted-foreground)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#EF9F27"
                strokeWidth={2}
                dot={false}
                name="Energy"
              />
              <Line
                type="monotone"
                dataKey="sleep"
                stroke="#378ADD"
                strokeWidth={2}
                dot={false}
                name="Sleep"
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#639922"
                strokeWidth={2}
                dot={false}
                name="Mood"
              />
              <Line
                type="monotone"
                dataKey="soreness"
                stroke="#D85A30"
                strokeWidth={2}
                dot={false}
                name="Soreness"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#EF9F27]" /> Energy
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#378ADD]" /> Sleep
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#639922]" /> Mood
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#D85A30]" /> Soreness
            </span>
          </div>
        </div>
      </div>

      {/* Weekly volume chart */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold mb-3">Weekly Volume</h2>
        <div className="rounded-xl border border-border bg-card p-3">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={DEMO_VOLUME}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10 }}
                stroke="var(--muted-foreground)"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="var(--muted-foreground)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="volume" fill="#7F77DD" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
      {detail && <p className="text-[10px] text-muted-foreground">{detail}</p>}
    </div>
  );
}
