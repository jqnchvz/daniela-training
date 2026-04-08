"use client";

import { useState } from "react";
import {
  useHistoryStore,
  type CompletedSession,
} from "@/store/history-store";
import { EXERCISES, getExerciseById } from "@/lib/exercises";
import { detectRedFlags, type CheckinData } from "@/lib/checkin";
import { useAuthStore } from "@/store/auth-store";
import { useT, useI18n, t as tFn } from "@/lib/i18n";

export default function ProgressPage() {
  const sessions = useHistoryStore((s) => s.sessions);
  const checkins = useHistoryStore((s) => s.checkins);
  const addMeasurement = useHistoryStore((s) => s.addMeasurement);
  const getLatestMeasurement = useHistoryStore((s) => s.getLatestMeasurement);
  const getMeasurements = useHistoryStore((s) => s.getMeasurementsForUser);
  const activeUserId = useAuthStore((s) => s.activeUserId);
  const latestMeasurement = getLatestMeasurement(activeUserId ?? undefined);
  const allMeasurements = getMeasurements(activeUserId ?? undefined);
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]?.id ?? "");
  const [showMeasForm, setShowMeasForm] = useState(false);
  const [waist, setWaist] = useState(latestMeasurement?.waist?.toString() ?? "");
  const [hip, setHip] = useState(latestMeasurement?.hip?.toString() ?? "");
  const [thigh, setThigh] = useState(latestMeasurement?.thigh?.toString() ?? "");
  const [weightKg, setWeightKg] = useState(latestMeasurement?.weightKg?.toString() ?? "");

  // Convert checkins to the format detectRedFlags expects
  const checkinData: CheckinData[] = checkins.map((c) => ({
    date: c.date,
    energy: c.energy,
    sleepQuality: c.sleepQuality,
    sleepHours: c.sleepHours,
    mood: c.mood,
    soreness: c.soreness,
    notes: c.notes,
    walkMinutes: c.walkMinutes ?? null,
    didStretching: c.didStretching ?? null,
    didYoga: c.didYoga ?? null,
    tookMedication: c.tookMedication ?? null,
  }));
  const redFlags = detectRedFlags(checkinData);

  // Build per-exercise progression data
  const exerciseHistory = getExerciseProgressionData(sessions, selectedExercise);

  // Build 2-week rule status for all exercises that have been logged
  const ruleStatus = get2WeekRuleStatus(sessions);

  // Build weekly volume data
  const weeklyVolumes = getWeeklyVolumeData(sessions);

  const hasData = sessions.length > 0 || checkins.length > 0;
  const t = useT();
  const locale = useI18n((s) => s.locale);

  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-muted-foreground">
          {t("progress.title")}
        </h1>
      </div>

      {/* Red flag banner */}
      {(redFlags.hasEnergyFlag || redFlags.hasMoodFlag) && (
        <div className="rounded-[16px] bg-dt-red-bg border border-destructive/30 p-3.5 flex gap-2.5 items-start mb-3">
          <span className="text-lg shrink-0">⚠️</span>
          <p className="text-[13px] text-[var(--dt-red)] leading-relaxed">
            {redFlags.hasEnergyFlag && (
              <>
                {t("progress.energyRedFlag")
                  .replace("{avg7}", String(redFlags.energyAvg7))
                  .replace("{avg30}", String(redFlags.energyAvg30))}
              </>
            )}
            {redFlags.hasMoodFlag && !redFlags.hasEnergyFlag && (
              <>
                {t("progress.moodRedFlag")
                  .replace("{avg7}", String(redFlags.moodAvg7))
                  .replace("{avg30}", String(redFlags.moodAvg30))}
              </>
            )}
          </p>
        </div>
      )}

      {/* Medication adherence */}
      {checkinData.some((c) => c.tookMedication !== null) && (
        <div className="rounded-[12px] border border-border bg-card p-3 flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">{t("progress.medicationAdherence")}</span>
          <span className="font-mono text-sm text-sage">
            {redFlags.medicationAdherence7}%
            {" "}
            <span className="text-muted-foreground text-xs">
              ({checkinData.filter((c) => c.tookMedication === true).length}/{checkinData.filter((c) => c.tookMedication !== null).length})
            </span>
          </span>
        </div>
      )}

      {!hasData ? (
        <div className="rounded-[16px] border border-border bg-card p-8 text-center">
          <p className="text-4xl mb-3">📈</p>
          <p className="font-heading text-lg font-bold mb-2">{t("progress.noData")}</p>
          <p className="text-sm text-muted-foreground">
            {t("progress.noDataDesc")}
          </p>
        </div>
      ) : (
        <>
          {/* 2-Week Rule Status */}
          {ruleStatus.length > 0 && (
            <>
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mb-2.5">
                {t("progress.ruleStatus")}
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
                {t("progress.strengthTrend")}
              </p>
              <div className="rounded-[16px] border border-border bg-card p-[18px] mb-3">
                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="w-full mb-3 rounded-[10px] border border-border bg-surface2 px-3 py-2 text-sm"
                >
                  {EXERCISES.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {locale === "es" ? (ex.nameEs ?? ex.name) : ex.name}
                    </option>
                  ))}
                </select>

                {exerciseHistory.length >= 2 ? (
                  <StrengthChart data={exerciseHistory} />
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {t("progress.needAtLeast2")}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Weekly volume */}
          {weeklyVolumes.length > 0 && (
            <>
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-4 mb-2.5">
                {t("progress.weeklyVolume")}
              </p>
              <div className="rounded-[16px] border border-border bg-card p-[18px] mb-3">
                <VolumeChart data={weeklyVolumes} />
              </div>
            </>
          )}

          {/* Weekly LISS cardio */}
          {checkins.some((c) => (c.walkMinutes ?? 0) > 0) && (
            <>
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-4 mb-2.5">
                {t("progress.weeklyLiss")}
              </p>
              <div className="rounded-[16px] border border-border bg-card p-[18px] mb-3">
                <LissChart checkins={checkins} />
              </div>
            </>
          )}

          {/* Wellness trend */}
          {checkins.length >= 3 && (
            <>
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-4 mb-2.5">
                {t("progress.wellnessTrend")}
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
        {t("progress.bodyMetrics")}
      </p>
      <div className="rounded-[16px] border border-border bg-card p-3.5">
        <div className="flex gap-2.5">
          <MetricBox value={latestMeasurement?.waist ? `${latestMeasurement.waist}` : "—"} label={t("progress.waistCm")} />
          <MetricBox value={latestMeasurement?.hip ? `${latestMeasurement.hip}` : "—"} label={t("progress.hipCm")} />
          <MetricBox value={latestMeasurement?.thigh ? `${latestMeasurement.thigh}` : "—"} label={t("progress.thighCm")} />
          <MetricBox value={latestMeasurement?.weightKg ? `${latestMeasurement.weightKg}` : "—"} label={t("progress.weightKg")} />
        </div>

        {allMeasurements.length >= 2 && (
          <div className="mt-3">
            <MeasurementsChart data={allMeasurements} />
          </div>
        )}

        {allMeasurements.filter((m) => m.weightKg != null).length >= 2 && (
          <div className="mt-3">
            <p className="text-[10px] font-semibold tracking-[1px] uppercase text-muted-foreground font-mono mb-1.5">
              {t("progress.weightTrend")}
            </p>
            <WeightChart data={allMeasurements} />
          </div>
        )}

        {showMeasForm ? (
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <MeasInput label={t("progress.waist")} value={waist} onChange={setWaist} />
              <MeasInput label={t("progress.hip")} value={hip} onChange={setHip} />
              <MeasInput label={t("progress.thigh")} value={thigh} onChange={setThigh} />
              <MeasInput label={t("progress.weight")} value={weightKg} onChange={setWeightKg} unit="kg" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowMeasForm(false)}
                className="flex-1 rounded-[12px] border border-border bg-surface2 py-2 text-[13px] font-semibold"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => {
                  addMeasurement({
                    id: crypto.randomUUID(),
                    userId: activeUserId ?? undefined,
                    date: new Date().toISOString().split("T")[0],
                    waist: waist ? Number(waist) : null,
                    hip: hip ? Number(hip) : null,
                    thigh: thigh ? Number(thigh) : null,
                    weightKg: weightKg ? Number(weightKg) : null,
                  });
                  setShowMeasForm(false);
                }}
                className="flex-1 rounded-[12px] bg-sage py-2 text-[13px] font-bold text-primary-foreground"
              >
                {t("common.save")}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowMeasForm(true)}
            className="w-full mt-3 rounded-[16px] border border-border bg-surface2 py-2.5 text-[13px] font-semibold transition-colors hover:bg-surface3"
          >
            {t("progress.logMeasurements")}
          </button>
        )}
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
    const locale = useI18n.getState().locale;

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
      detail = tFn("progress.hitTarget").replace("{count}", String(sessionCount >= 2 ? 2 : sessionCount));
    } else if (allCompleted) {
      status = "✅";
      detail = tFn("progress.completedHold");
    } else {
      status = "⏸️";
      detail = tFn("progress.incompleteHold");
    }

    results.push({
      exerciseId: exId,
      name: (locale === "es" ? ex.nameEs : ex.name) ?? ex.name,
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
        <span>{tFn("progress.started")}: <span className="text-muted-foreground">{data[0].maxWeight} kg</span></span>
        {data.length > 1 && (
          <span>
            {data[data.length - 1].maxWeight >= data[0].maxWeight ? "+" : ""}
            {data[data.length - 1].maxWeight - data[0].maxWeight} kg · {data.length} {tFn("history.sessions")}
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

function LissChart({ checkins }: { checkins: Array<{ date: string; walkMinutes: number | null }> }) {
  const weekMap = new Map<string, number>();

  for (const c of checkins) {
    const date = new Date(c.date);
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    const key = monday.toISOString().split("T")[0];
    weekMap.set(key, (weekMap.get(key) ?? 0) + (c.walkMinutes ?? 0));
  }

  const data = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([, minutes], i) => ({ label: `W${i + 1}`, minutes }));

  if (data.length === 0) return null;

  const maxMin = Math.max(150, ...data.map((d) => d.minutes));
  const width = 300;
  const height = 80;
  const barWidth = Math.min(30, (width - 20) / data.length - 4);
  const targetY = height - 15 - (150 / maxMin) * (height - 20);

  return (
    <>
      <svg className="w-full h-20" viewBox={`0 0 ${width} ${height}`}>
        {/* Target line at 150 min */}
        <line x1="5" y1={targetY} x2={width - 5} y2={targetY} stroke="#8A847E" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
        <text x={width - 5} y={targetY - 3} fill="#8A847E" fontSize="7" fontFamily="JetBrains Mono" textAnchor="end">150</text>
        {data.map((d, i) => {
          const barHeight = maxMin > 0 ? (d.minutes / maxMin) * (height - 20) : 0;
          const x = 10 + i * ((width - 20) / data.length) + ((width - 20) / data.length - barWidth) / 2;
          const y = height - 15 - barHeight;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill="#7EC8A0" opacity="0.8" />
              <text x={x + barWidth / 2} y={height - 3} fill="#8A847E" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
        <span>--- {tFn("progress.lissTarget")}</span>
        <span>{data[data.length - 1].minutes} {tFn("progress.lissMinutes")}</span>
      </div>
    </>
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
      <text x="28" y="14" fill="#9B8EC4" fontSize="9">{tFn("home.energy")}</text>
      <line x1="80" y1="10" x2="95" y2="10" stroke="#5a9fd4" strokeWidth="2" strokeDasharray="4 2" />
      <text x="98" y="14" fill="#5a9fd4" fontSize="9">{tFn("checkin.sleepQuality")}</text>
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

function MeasurementsChart({ data }: { data: Array<{ date: string; waist: number | null; hip: number | null; thigh: number | null }> }) {
  const width = 300;
  const height = 80;
  const padding = 5;

  // Gather all non-null values to find min/max
  const allValues = data.flatMap((d) => [d.waist, d.hip, d.thigh].filter((v): v is number => v !== null));
  if (allValues.length === 0) return null;
  const min = Math.min(...allValues) - 2;
  const max = Math.max(...allValues) + 2;
  const range = max - min || 1;

  const makePoints = (values: (number | null)[]) => {
    const valid = values.map((v, i) => v !== null ? { i, v } : null).filter(Boolean) as { i: number; v: number }[];
    if (valid.length < 2) return null;
    return valid.map(({ i, v }) => {
      const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((v - min) / range) * (height - padding * 2 - 10);
      return `${x},${y}`;
    }).join(" ");
  };

  const waistPts = makePoints(data.map((d) => d.waist));
  const hipPts = makePoints(data.map((d) => d.hip));
  const thighPts = makePoints(data.map((d) => d.thigh));

  return (
    <svg className="w-full h-20" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {waistPts && <polyline points={waistPts} stroke="#9B8EC4" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {hipPts && <polyline points={hipPts} stroke="#E4A0A0" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {thighPts && <polyline points={thighPts} stroke="#5a9fd4" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {/* Legend */}
      {waistPts && <><line x1="10" y1="8" x2="22" y2="8" stroke="#9B8EC4" strokeWidth="2" /><text x="25" y="11" fill="#9B8EC4" fontSize="8">{tFn("progress.waist")}</text></>}
      {hipPts && <><line x1="65" y1="8" x2="77" y2="8" stroke="#E4A0A0" strokeWidth="2" /><text x="80" y="11" fill="#E4A0A0" fontSize="8">{tFn("progress.hip")}</text></>}
      {thighPts && <><line x1="110" y1="8" x2="122" y2="8" stroke="#5a9fd4" strokeWidth="2" /><text x="125" y="11" fill="#5a9fd4" fontSize="8">{tFn("progress.thigh")}</text></>}
    </svg>
  );
}

function WeightChart({ data }: { data: Array<{ date: string; weightKg: number | null }> }) {
  const points = data
    .map((d, i) => (d.weightKg != null ? { i, date: d.date, value: d.weightKg } : null))
    .filter(Boolean) as { i: number; date: string; value: number }[];

  if (points.length < 2) return null;

  const width = 300;
  const height = 60;
  const padding = 5;

  const min = Math.min(...points.map((p) => p.value)) - 1;
  const max = Math.max(...points.map((p) => p.value)) + 1;
  const range = max - min || 1;

  const coords = points.map((p, idx) => {
    const x = points.length === 1 ? width / 2 : (idx / (points.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((p.value - min) / range) * (height - padding * 2 - 10);
    return { x, y, value: p.value };
  });

  // Rolling average (window of 4)
  const rollingAvg: { x: number; y: number }[] = [];
  for (let idx = 0; idx < coords.length; idx++) {
    const windowStart = Math.max(0, idx - 3);
    const windowSlice = coords.slice(windowStart, idx + 1);
    const avg = windowSlice.reduce((s, c) => s + c.value, 0) / windowSlice.length;
    const y = height - padding - ((avg - min) / range) * (height - padding * 2 - 10);
    rollingAvg.push({ x: coords[idx].x, y });
  }

  const avgPolyline = rollingAvg.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg className="w-full h-[60px]" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline points={avgPolyline} stroke="#7EC8A0" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, idx) => (
        <circle key={idx} cx={c.x} cy={c.y} r={3} fill="#7EC8A0" opacity="0.5" />
      ))}
      <circle cx="10" cy="8" r="2.5" fill="#7EC8A0" opacity="0.5" />
      <text x="16" y="11" fill="#7EC8A0" fontSize="8">{tFn("progress.weight")}</text>
      <line x1="60" y1="8" x2="75" y2="8" stroke="#7EC8A0" strokeWidth="2" />
      <text x="78" y="11" fill="#7EC8A0" fontSize="8">{tFn("progress.rollingAvg")}</text>
    </svg>
  );
}

function MeasInput({ label, value, onChange, unit = "cm" }: { label: string; value: string; onChange: (v: string) => void; unit?: string }) {
  return (
    <div className="flex-1">
      <label className="text-[10px] text-muted-foreground mb-1 block">{label} ({unit})</label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-surface2 px-2 py-2 font-mono text-sm text-center"
        placeholder="—"
      />
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
