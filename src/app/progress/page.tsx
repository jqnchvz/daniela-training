"use client";

import { useState } from "react";
import {
  useHistoryStore,
  type CompletedSession,
} from "@/store/history-store";
import { EXERCISES, getExerciseById } from "@/lib/exercises";
import { detectRedFlags, type CheckinData } from "@/lib/checkin";

export default function ProgressPage() {
  const sessions = useHistoryStore((s) => s.sessions);
  const checkins = useHistoryStore((s) => s.checkins);
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]?.id ?? "");

  // Convert checkins to the format detectRedFlags expects
  const checkinData: CheckinData[] = checkins.map((c) => ({
    date: c.date,
    energy: c.energy,
    sleepQuality: c.sleepQuality,
    sleepHours: c.sleepHours,
    mood: c.mood,
    soreness: c.soreness,
    notes: c.notes,
  }));
  const redFlags = detectRedFlags(checkinData);

  // Build per-exercise progression data
  const exerciseHistory = getExerciseProgressionData(sessions, selectedExercise);

  // Build 2-week rule status for all exercises that have been logged
  const ruleStatus = get2WeekRuleStatus(sessions);

  // Build weekly volume data
  const weeklyVolumes = getWeeklyVolumeData(sessions);

  const hasData = sessions.length > 0 || checkins.length > 0;

  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-muted-foreground">
          Progress
        </h1>
      </div>

      {/* Red flag banner */}
      {(redFlags.hasEnergyFlag || redFlags.hasMoodFlag) && (
        <div className="rounded-[16px] bg-dt-red-bg border border-destructive/30 p-3.5 flex gap-2.5 items-start mb-3">
          <span className="text-lg shrink-0">⚠️</span>
          <p className="text-[13px] text-[var(--dt-red)] leading-relaxed">
            {redFlags.hasEnergyFlag && (
              <>
                Your 7-day energy average (<strong>{redFlags.energyAvg7}</strong>) is significantly
                lower than your 30-day average ({redFlags.energyAvg30}). Consider checking
                recovery, sleep, and stress levels.
              </>
            )}
            {redFlags.hasMoodFlag && !redFlags.hasEnergyFlag && (
              <>
                Your mood has been dropping this week (7-day avg: {redFlags.moodAvg7} vs
                30-day: {redFlags.moodAvg30}). Listen to your body.
              </>
            )}
          </p>
        </div>
      )}

      {!hasData ? (
        <div className="rounded-[16px] border border-border bg-card p-8 text-center">
          <p className="text-4xl mb-3">📈</p>
          <p className="font-heading text-lg font-bold mb-2">No data yet</p>
          <p className="text-sm text-muted-foreground">
            Complete sessions and daily check-ins to see your progress trends here.
          </p>
        </div>
      ) : (
        <>
          {/* 2-Week Rule Status */}
          {ruleStatus.length > 0 && (
            <>
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mb-2.5">
                2-Week Rule Status
              </p>
              <div className="rounded-[16px] border border-border bg-card p-3.5 mb-3">
                {ruleStatus.map((rule, i) => (
                  <RuleItem
                    key={rule.exerciseId}
                    status={rule.status}
                    name={rule.name}
                    detail={rule.detail}
                    weight={rule.weight}
                    last={i === ruleStatus.length - 1}
                  />
                ))}
              </div>
            </>
          )}

          {/* Strength trend */}
          {sessions.length > 0 && (
            <>
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-4 mb-2.5">
                Strength trend
              </p>
              <div className="rounded-[16px] border border-border bg-card p-[18px] mb-3">
                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="w-full mb-3 rounded-[10px] border border-border bg-surface2 px-3 py-2 text-sm"
                >
                  {EXERCISES.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>

                {exerciseHistory.length >= 2 ? (
                  <StrengthChart data={exerciseHistory} />
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Need at least 2 sessions with this exercise to show a trend.
                  </p>
                )}
              </div>
            </>
          )}

          {/* Weekly volume */}
          {weeklyVolumes.length > 0 && (
            <>
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-4 mb-2.5">
                Weekly volume
              </p>
              <div className="rounded-[16px] border border-border bg-card p-[18px] mb-3">
                <VolumeChart data={weeklyVolumes} />
              </div>
            </>
          )}

          {/* Wellness trend */}
          {checkins.length >= 3 && (
            <>
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-4 mb-2.5">
                Wellness trend
              </p>
              <div className="rounded-[16px] border border-border bg-card p-[18px] mb-3">
                <WellnessChart checkins={checkins.slice(0, 14).reverse()} />
              </div>
            </>
          )}
        </>
      )}

      {/* Body metrics */}
      <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-4 mb-2.5">
        Body metrics
      </p>
      <div className="rounded-[16px] border border-border bg-card p-3.5">
        <div className="flex gap-2.5">
          <MetricBox value="—" label="Waist cm" />
          <MetricBox value="—" label="Hip cm" />
          <MetricBox value="—" label="Thigh cm" />
        </div>
        <button className="w-full mt-3 rounded-[16px] border border-border bg-surface2 py-2.5 text-[13px] font-semibold transition-colors hover:bg-surface3">
          + Log measurements
        </button>
      </div>
    </div>
  );
}

// ─── Data helpers ───────────────────────────────────────────

interface ExerciseDataPoint {
  date: string;
  maxWeight: number;
  label: string;
}

function getExerciseProgressionData(
  sessions: CompletedSession[],
  exerciseId: string,
): ExerciseDataPoint[] {
  const points: ExerciseDataPoint[] = [];
  for (const session of [...sessions].reverse()) {
    const sets = session.sets.filter((s) => s.exerciseId === exerciseId);
    if (sets.length === 0) continue;
    const maxWeight = Math.max(...sets.map((s) => s.weight));
    points.push({
      date: session.date,
      maxWeight,
      label: `${maxWeight}kg`,
    });
  }
  return points;
}

interface RuleStatusItem {
  exerciseId: string;
  name: string;
  status: string;
  detail: string;
  weight: string;
}

function get2WeekRuleStatus(sessions: CompletedSession[]): RuleStatusItem[] {
  // Group all sets by exercise across all sessions
  const exerciseMap = new Map<string, { weights: number[]; allCompleted: boolean[] }>();

  for (const session of sessions) {
    const byExercise = new Map<string, typeof session.sets>();
    for (const set of session.sets) {
      const existing = byExercise.get(set.exerciseId) ?? [];
      existing.push(set);
      byExercise.set(set.exerciseId, existing);
    }

    for (const [exId, sets] of byExercise) {
      const entry = exerciseMap.get(exId) ?? { weights: [], allCompleted: [] };
      const maxWeight = Math.max(...sets.map((s) => s.weight));
      entry.weights.push(maxWeight);
      entry.allCompleted.push(true); // All logged sets are completed
      exerciseMap.set(exId, entry);
    }
  }

  const results: RuleStatusItem[] = [];
  for (const [exId, data] of exerciseMap) {
    const ex = getExerciseById(exId);
    if (!ex) continue;

    const currentWeight = data.weights[data.weights.length - 1];
    const sessionCount = data.weights.length;
    const lastTwoSame =
      sessionCount >= 2 &&
      data.weights[sessionCount - 1] === data.weights[sessionCount - 2];
    const allCompleted = data.allCompleted.slice(-2).every(Boolean);

    let status: string;
    let detail: string;

    if (lastTwoSame && allCompleted && sessionCount >= 2) {
      status = "⬆️";
      detail = `Hit target for ${sessionCount >= 2 ? 2 : sessionCount} sessions · Ready to increase`;
    } else if (allCompleted) {
      status = "✅";
      detail = `Completed · Hold this week`;
    } else {
      status = "⏸️";
      detail = `Incomplete reps · Hold`;
    }

    results.push({
      exerciseId: exId,
      name: ex.name,
      status,
      detail,
      weight: `${currentWeight} kg`,
    });
  }

  return results;
}

interface WeeklyVolumePoint {
  label: string;
  volume: number;
}

function getWeeklyVolumeData(sessions: CompletedSession[]): WeeklyVolumePoint[] {
  const weekMap = new Map<string, number>();

  for (const session of sessions) {
    const date = new Date(session.date);
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    const key = monday.toISOString().split("T")[0];

    const volume = session.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    weekMap.set(key, (weekMap.get(key) ?? 0) + volume);
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([date, volume], i) => ({
      label: `W${i + 1}`,
      volume,
    }));
}

// ─── SVG Chart components ───────────────────────────────────

function StrengthChart({ data }: { data: ExerciseDataPoint[] }) {
  const maxWeight = Math.max(...data.map((d) => d.maxWeight));
  const minWeight = Math.min(...data.map((d) => d.maxWeight));
  const range = maxWeight - minWeight || 1;
  const width = 300;
  const height = 80;
  const padding = 5;

  const points = data.map((d, i) => {
    const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((d.maxWeight - minWeight) / range) * (height - padding * 2 - 10);
    return { x, y, ...d };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = `M ${points[0].x},${points[0].y} ${points.map((p) => `L ${p.x},${p.y}`).join(" ")} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  return (
    <>
      <svg className="w-full h-20" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="strengthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9B8EC4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#9B8EC4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#strengthGrad)" />
        <polyline points={polyline} stroke="#9B8EC4" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3} fill="#9B8EC4" stroke={i === points.length - 1 ? "#1A1625" : "none"} strokeWidth={i === points.length - 1 ? 2 : 0} />
        ))}
        <text x={points[points.length - 1].x - 20} y={points[points.length - 1].y - 8} fill="#9B8EC4" fontSize="9" fontFamily="JetBrains Mono" fontWeight="500">
          {data[data.length - 1].label}
        </text>
      </svg>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>Started: <span className="text-muted-foreground">{data[0].maxWeight} kg</span></span>
        {data.length > 1 && (
          <span>
            {data[data.length - 1].maxWeight >= data[0].maxWeight ? "+" : ""}
            {data[data.length - 1].maxWeight - data[0].maxWeight} kg over {data.length} sessions
          </span>
        )}
      </div>
    </>
  );
}

function VolumeChart({ data }: { data: WeeklyVolumePoint[] }) {
  const maxVol = Math.max(...data.map((d) => d.volume));
  const width = 300;
  const height = 80;
  const barWidth = Math.min(30, (width - 20) / data.length - 4);

  return (
    <svg className="w-full h-20" viewBox={`0 0 ${width} ${height}`}>
      {data.map((d, i) => {
        const barHeight = maxVol > 0 ? (d.volume / maxVol) * (height - 20) : 0;
        const x = 10 + i * ((width - 20) / data.length) + ((width - 20) / data.length - barWidth) / 2;
        const y = height - 15 - barHeight;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill="#9B8EC4" opacity="0.8" />
            <text x={x + barWidth / 2} y={height - 3} fill="#8A847E" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function WellnessChart({ checkins }: { checkins: Array<{ date: string; energy: number; sleepQuality: number }> }) {
  const width = 300;
  const height = 80;
  const padding = 5;

  const makePoints = (values: number[]) =>
    values.map((v, i) => {
      const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((v - 1) / 9) * (height - padding * 2 - 10);
      return `${x},${y}`;
    }).join(" ");

  const energyPoints = makePoints(checkins.map((c) => c.energy));
  const sleepPoints = makePoints(checkins.map((c) => c.sleepQuality));

  return (
    <svg className="w-full h-20" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline points={energyPoints} stroke="#9B8EC4" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={sleepPoints} stroke="#5a9fd4" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />
      <line x1="10" y1="10" x2="25" y2="10" stroke="#9B8EC4" strokeWidth="2" />
      <text x="28" y="14" fill="#9B8EC4" fontSize="9">Energy</text>
      <line x1="80" y1="10" x2="95" y2="10" stroke="#5a9fd4" strokeWidth="2" strokeDasharray="4 2" />
      <text x="98" y="14" fill="#5a9fd4" fontSize="9">Sleep</text>
    </svg>
  );
}

// ─── Shared components ──────────────────────────────────────

function RuleItem({ status, name, detail, weight, last = false }: {
  status: string; name: string; detail: string; weight: string; last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 py-3 ${last ? "" : "border-b border-border"}`}>
      <span className="text-xl shrink-0">{status}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
      </div>
      <span className="font-mono text-[13px] text-sage shrink-0">{weight}</span>
    </div>
  );
}

function MetricBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 text-center rounded-[10px] bg-surface2 p-3">
      <p className="font-heading text-[1.2rem] font-extrabold">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
