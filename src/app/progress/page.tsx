"use client";

import { useState } from "react";
import {
  useHistoryStore,
  type CompletedSession,
  type LabResult,
} from "@/store/history-store";
import { EXERCISES, getExerciseById } from "@/lib/exercises";
import { detectRedFlags, type CheckinData } from "@/lib/checkin";
import { useAuthStore } from "@/store/auth-store";
import { useT, useI18n, t as tFn } from "@/lib/i18n";
import { useCyclePhaseStore } from "@/store/cycle-phase-store";

export default function ProgressPage() {
  const sessions = useHistoryStore((s) => s.sessions);
  const checkins = useHistoryStore((s) => s.checkins);
  const addMeasurement = useHistoryStore((s) => s.addMeasurement);
  const addLabResult = useHistoryStore((s) => s.addLabResult);
  const getLatestMeasurement = useHistoryStore((s) => s.getLatestMeasurement);
  const getMeasurements = useHistoryStore((s) => s.getMeasurementsForUser);
  const getLabResults = useHistoryStore((s) => s.getLabResultsForUser);
  const activeUserId = useAuthStore((s) => s.activeUserId);
  const latestMeasurement = getLatestMeasurement(activeUserId ?? undefined);
  const allMeasurements = getMeasurements(activeUserId ?? undefined);
  const allLabResults = getLabResults(activeUserId ?? undefined);
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]?.id ?? "");
  const [showMeasForm, setShowMeasForm] = useState(false);
  const [showLabForm, setShowLabForm] = useState(false);
  const [labDate, setLabDate] = useState(new Date().toISOString().split("T")[0]);
  const [labTsh, setLabTsh] = useState("");
  const [labFreeT4, setLabFreeT4] = useState("");
  const [labFreeT3, setLabFreeT3] = useState("");
  const [labNotes, setLabNotes] = useState("");
  const [labSaved, setLabSaved] = useState(false);
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

  const cycleEnabled = useCyclePhaseStore((s) => s.enabled);
  const periodStartDates = useCyclePhaseStore((s) => s.periodStartDates);

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
        <div
          className="rounded-[16px] border border-border bg-card p-8 text-center"
          role="img"
          aria-label={t("progress.noData")}
        >
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
                  <StrengthChart data={exerciseHistory} periodStartDates={cycleEnabled ? periodStartDates : []} />
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

          {/* Session RPE trend */}
          {sessions.some((s) => s.sessionRpe != null) && (
            <>
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-4 mb-2.5">
                {t("session.rpeTrend")}
              </p>
              <div className="rounded-[16px] border border-border bg-card p-[18px] mb-3">
                <SessionRpeChart sessions={sessions} />
              </div>
            </>
          )}

          {/* Heart rate trend */}
          {sessions.some((s) => s.averageHr != null || s.maxHr != null) && (
            <>
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-4 mb-2.5">
                {t("hr.trend")}
              </p>
              <div className="rounded-[16px] border border-border bg-card p-[18px] mb-3">
                <HrTrendChart sessions={sessions} />
                <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                  {t("hr.zoneTip")}
                </p>
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
                <WellnessChart checkins={checkins.slice(0, 14).reverse()} periodStartDates={cycleEnabled ? periodStartDates : []} />
                {cycleEnabled && periodStartDates.length > 0 && (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-[1px] font-mono">{tFn("cycle.phaseLegend")}:</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-2.5 rounded-sm bg-red-400/40" /><span className="text-[9px] text-muted-foreground">{tFn("cycle.legendMenstrual")}</span></span>
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-2.5 rounded-sm bg-purple-400/30" /><span className="text-[9px] text-muted-foreground">{tFn("cycle.legendLuteal")}</span></span>
                  </div>
                )}
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
      {/* Lab results */}
      <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-4 mb-2.5">
        {t("labs.title")}
      </p>
      <div className="rounded-[16px] border border-border bg-card p-3.5">
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
          {t("labs.hint")}
        </p>

        {/* Lab history */}
        {allLabResults.length > 0 ? (
          <div className="mb-3">
            <LabResultsChart labResults={allLabResults} sessions={sessions} />
            <div className="mt-3 space-y-2">
              {[...allLabResults].reverse().slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-[12px] border-b border-border pb-2 last:border-b-0 last:pb-0">
                  <span className="text-muted-foreground font-mono">{r.date}</span>
                  <div className="flex gap-3">
                    {r.tsh != null && <span>TSH: <span className="font-semibold">{r.tsh}</span></span>}
                    {r.freeT4 != null && <span>T4: <span className="font-semibold">{r.freeT4}</span></span>}
                    {r.freeT3 != null && <span>T3: <span className="font-semibold">{r.freeT3}</span></span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[12px] text-muted-foreground mb-3">{t("labs.noResults")}</p>
        )}

        {showLabForm ? (
          <div className="space-y-2">
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground">{t("labs.date")}</label>
              <input
                type="date"
                value={labDate}
                onChange={(e) => setLabDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface2 px-2 py-2 font-mono text-sm"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">{t("labs.tshNormal")}</p>
            <div className="flex gap-2">
              <LabInput label={`${t("labs.tsh")} (${t("labs.tshUnit")})`} value={labTsh} onChange={setLabTsh} />
              <LabInput label={`${t("labs.freeT4")} (${t("labs.t4Unit")})`} value={labFreeT4} onChange={setLabFreeT4} />
              <LabInput label={`${t("labs.freeT3")} (${t("labs.t3Unit")})`} value={labFreeT3} onChange={setLabFreeT3} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">{t("labs.notes")}</label>
              <textarea
                value={labNotes}
                onChange={(e) => setLabNotes(e.target.value)}
                placeholder={t("labs.notesPlaceholder")}
                rows={2}
                className="w-full rounded-lg border border-border bg-surface2 px-2 py-2 text-sm resize-none focus:outline-none focus:border-sage"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLabForm(false)}
                className="flex-1 rounded-[12px] border border-border bg-surface2 py-2.5 min-h-[44px] text-[13px] font-semibold"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => {
                  addLabResult({
                    id: crypto.randomUUID(),
                    userId: activeUserId ?? undefined,
                    date: labDate,
                    tsh: labTsh ? Number(labTsh) : null,
                    freeT4: labFreeT4 ? Number(labFreeT4) : null,
                    freeT3: labFreeT3 ? Number(labFreeT3) : null,
                    notes: labNotes,
                  });
                  setShowLabForm(false);
                  setLabTsh(""); setLabFreeT4(""); setLabFreeT3(""); setLabNotes("");
                  setLabSaved(true);
                  setTimeout(() => setLabSaved(false), 2000);
                }}
                className="flex-1 rounded-[12px] bg-sage py-2.5 min-h-[44px] text-[13px] font-bold text-primary-foreground"
              >
                {labSaved ? t("labs.saved") : t("labs.save")}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLabForm(true)}
            className="w-full rounded-[16px] border border-border bg-surface2 py-2.5 min-h-[44px] text-[13px] font-semibold transition-colors hover:bg-surface3"
          >
            {labSaved ? t("labs.saved") : t("labs.logNew")}
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

// ─── Cycle phase band helpers ───────────────────────────────

/**
 * Given a date string and period start dates, return the cycle phase.
 * Returns null if cycle tracking is off or no period dates are logged.
 */
function getCyclePhaseForDate(date: string, periodStartDates: string[]): "menstrual" | "follicular" | "ovulation" | "luteal" | null {
  if (periodStartDates.length === 0) return null;
  const msPerDay = 86400000;
  const d = new Date(date + "T00:00:00").getTime();
  // Find the most recent period start before or on this date
  const relevant = periodStartDates
    .filter((p) => new Date(p + "T00:00:00").getTime() <= d)
    .sort((a, b) => new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime());
  if (relevant.length === 0) return null;
  const latest = relevant[0];
  const dayInCycle = Math.round(Math.abs(d - new Date(latest + "T00:00:00").getTime()) / msPerDay) + 1;
  if (dayInCycle > 35) return null; // beyond a plausible cycle
  if (dayInCycle <= 5) return "menstrual";
  if (dayInCycle <= 13) return "follicular";
  if (dayInCycle <= 16) return "ovulation";
  return "luteal";
}

/**
 * Build a list of x-ranges to shade on a chart for menstrual and luteal phases.
 * dates: array of ISO date strings matching each data point x position.
 * xForIndex: function mapping index → x coordinate in SVG space.
 */
function buildCycleBands(
  dates: string[],
  periodStartDates: string[],
  xForIndex: (i: number) => number,
  svgWidth: number,
): Array<{ x: number; width: number; phase: "menstrual" | "luteal" }> {
  if (periodStartDates.length === 0 || dates.length === 0) return [];
  const bands: Array<{ x: number; width: number; phase: "menstrual" | "luteal" }> = [];
  const slotWidth = dates.length > 1 ? svgWidth / (dates.length - 1) : svgWidth;

  let currentBand: { startX: number; phase: "menstrual" | "luteal" } | null = null;

  for (let i = 0; i < dates.length; i++) {
    const phase = getCyclePhaseForDate(dates[i], periodStartDates);
    const x = xForIndex(i);
    const highlight = phase === "menstrual" || phase === "luteal" ? phase : null;

    if (highlight) {
      if (!currentBand || currentBand.phase !== highlight) {
        if (currentBand) {
          bands.push({ x: currentBand.startX, width: x - currentBand.startX, phase: currentBand.phase });
        }
        currentBand = { startX: Math.max(0, x - slotWidth / 2), phase: highlight };
      }
    } else {
      if (currentBand) {
        bands.push({ x: currentBand.startX, width: x - currentBand.startX, phase: currentBand.phase });
        currentBand = null;
      }
    }
  }

  if (currentBand) {
    const lastX = xForIndex(dates.length - 1);
    bands.push({ x: currentBand.startX, width: lastX + slotWidth / 2 - currentBand.startX, phase: currentBand.phase });
  }

  return bands;
}

// ─── SVG Chart components ───────────────────────────────────

function StrengthChart({ data, periodStartDates = [] }: { data: ExerciseDataPoint[]; periodStartDates?: string[] }) {
  const maxWeight = Math.max(...data.map((d) => d.maxWeight));
  const minWeight = Math.min(...data.map((d) => d.maxWeight));
  const range = maxWeight - minWeight || 1;
  const width = 300;
  const height = 80;
  const padding = 5;

  const xForIndex = (i: number) => data.length === 1 ? width / 2 : (i / (data.length - 1)) * (width - padding * 2) + padding;

  const points = data.map((d, i) => {
    const x = xForIndex(i);
    const y = height - padding - ((d.maxWeight - minWeight) / range) * (height - padding * 2 - 10);
    return { x, y, ...d };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = `M ${points[0].x},${points[0].y} ${points.map((p) => `L ${p.x},${p.y}`).join(" ")} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  const cycleBands = buildCycleBands(data.map((d) => d.date), periodStartDates, xForIndex, width);

  return (
    <>
      <svg
        className="w-full h-20"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${tFn("progress.strengthTrend")}: ${data[0].maxWeight} kg → ${data[data.length - 1].maxWeight} kg`}
      >
        <defs>
          <linearGradient id="strengthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9B8EC4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#9B8EC4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {cycleBands.map((band, i) => (
          <rect
            key={i}
            x={band.x}
            y={0}
            width={Math.max(0, band.width)}
            height={height}
            fill={band.phase === "menstrual" ? "#F87171" : "#A78BFA"}
            opacity={0.12}
          />
        ))}
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
    <svg
      className="w-full h-20"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={tFn("progress.weeklyVolume")}
    >
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
      <svg
        className="w-full h-20"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={tFn("progress.weeklyLiss")}
      >
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

function WellnessChart({ checkins, periodStartDates = [] }: { checkins: Array<{ date: string; energy: number; sleepQuality: number }>; periodStartDates?: string[] }) {
  const width = 300;
  const height = 80;
  const padding = 5;

  const xForIndex = (i: number) => checkins.length === 1 ? width / 2 : (i / (checkins.length - 1)) * (width - padding * 2) + padding;

  const makePoints = (values: number[]) =>
    values.map((v, i) => {
      const x = xForIndex(i);
      const y = height - padding - ((v - 1) / 9) * (height - padding * 2 - 10);
      return `${x},${y}`;
    }).join(" ");

  const energyPoints = makePoints(checkins.map((c) => c.energy));
  const sleepPoints = makePoints(checkins.map((c) => c.sleepQuality));

  const cycleBands = buildCycleBands(checkins.map((c) => c.date), periodStartDates, xForIndex, width);

  return (
    <svg
      className="w-full h-20"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={tFn("progress.wellnessTrend")}
    >
      {cycleBands.map((band, i) => (
        <rect
          key={i}
          x={band.x}
          y={0}
          width={Math.max(0, band.width)}
          height={height}
          fill={band.phase === "menstrual" ? "#F87171" : "#A78BFA"}
          opacity={0.12}
        />
      ))}
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
    <svg
      className="w-full h-20"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={tFn("progress.bodyMetrics")}
    >
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
    <svg
      className="w-full h-[60px]"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={tFn("progress.weightTrend")}
    >
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

function SessionRpeChart({ sessions }: { sessions: CompletedSession[] }) {
  const data = [...sessions]
    .reverse()
    .filter((s) => s.sessionRpe != null)
    .slice(-12)
    .map((s) => ({ date: s.date, rpe: s.sessionRpe! }));

  if (data.length < 2) return null;

  const width = 300;
  const height = 80;
  const padding = 5;

  const points = data.map((d, i) => {
    const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((d.rpe - 1) / 9) * (height - padding * 2 - 10);
    return { x, y, rpe: d.rpe };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const last = points[points.length - 1];

  // Flag if trending upward over last 3 sessions
  const last3 = data.slice(-3);
  const trending = last3.length === 3 && last3[2].rpe > last3[1].rpe && last3[1].rpe > last3[0].rpe;

  return (
    <>
      <svg
        className="w-full h-20"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={tFn("session.rpeTrend")}
      >
        <polyline points={polyline} stroke={trending ? "#E4A0A0" : "#9B8EC4"} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3} fill={trending ? "#E4A0A0" : "#9B8EC4"} />
        ))}
        <text x={last.x - 16} y={last.y - 8} fill={trending ? "#E4A0A0" : "#9B8EC4"} fontSize="9" fontFamily="JetBrains Mono" fontWeight="500">
          RPE {last.rpe}
        </text>
      </svg>
      {trending && (
        <p className="text-[11px] text-[var(--dt-red)] mt-1">
          ⚠️ {tFn("progress.energyRedFlag").split(".")[0]}... Session RPE rising — consider a deload.
        </p>
      )}
    </>
  );
}

function HrTrendChart({ sessions }: { sessions: CompletedSession[] }) {
  const hrSessions = [...sessions]
    .reverse()
    .filter((s) => s.averageHr != null || s.maxHr != null)
    .slice(-12);

  if (hrSessions.length === 0) return null;

  const width = 300;
  const height = 80;
  const padding = 5;

  const avgValues = hrSessions.map((s) => s.averageHr);
  const maxValues = hrSessions.map((s) => s.maxHr);
  const allValues = [...avgValues, ...maxValues].filter((v): v is number => v != null);
  if (allValues.length === 0) return null;

  const minV = Math.max(50, Math.min(...allValues) - 5);
  const maxV = Math.min(220, Math.max(...allValues) + 5);
  const range = maxV - minV || 1;

  const makePoints = (values: (number | null)[]) => {
    const valid = values.map((v, i) => v != null ? { i, v } : null).filter(Boolean) as { i: number; v: number }[];
    if (valid.length < 2) return null;
    return valid.map(({ i, v }) => {
      const x = hrSessions.length === 1 ? width / 2 : (i / (hrSessions.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((v - minV) / range) * (height - padding * 2 - 10);
      return `${x},${y}`;
    }).join(" ");
  };

  const avgPts = makePoints(avgValues);
  const maxPts = makePoints(maxValues);

  // Target zone lines: 60-75% of 180 (approx max for general population)
  const zone2y = height - padding - ((0.70 * 180 - minV) / range) * (height - padding * 2 - 10);
  const zone3y = height - padding - ((0.75 * 180 - minV) / range) * (height - padding * 2 - 10);

  return (
    <svg
      className="w-full h-20"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={tFn("hr.trend")}
    >
      {/* Zone 2-3 band */}
      <rect x={padding} y={zone3y} width={width - padding * 2} height={zone2y - zone3y} fill="#7EC8A0" opacity="0.08" />
      <line x1={padding} y1={zone2y} x2={width - padding} y2={zone2y} stroke="#7EC8A0" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
      <line x1={padding} y1={zone3y} x2={width - padding} y2={zone3y} stroke="#7EC8A0" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
      {avgPts && <polyline points={avgPts} stroke="#9B8EC4" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {maxPts && <polyline points={maxPts} stroke="#E4A0A0" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />}
      {avgPts && <><line x1="10" y1="8" x2="22" y2="8" stroke="#9B8EC4" strokeWidth="2" /><text x="25" y="11" fill="#9B8EC4" fontSize="8">{tFn("hr.average")}</text></>}
      {maxPts && <><line x1="75" y1="8" x2="87" y2="8" stroke="#E4A0A0" strokeWidth="2" strokeDasharray="4 2" /><text x="90" y="11" fill="#E4A0A0" fontSize="8">{tFn("hr.max")}</text></>}
    </svg>
  );
}

function LabInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex-1">
      <label className="text-[9px] text-muted-foreground mb-1 block leading-tight">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step="0.01"
        className="w-full rounded-lg border border-border bg-surface2 px-2 py-2 font-mono text-sm text-center min-h-[44px]"
        placeholder="—"
      />
    </div>
  );
}

function LabResultsChart({ labResults, sessions }: { labResults: LabResult[]; sessions: CompletedSession[] }) {
  if (labResults.length < 2) return null;

  const width = 300;
  const height = 80;
  const padding = 5;

  // TSH line
  const tshData = labResults.filter((r) => r.tsh != null);
  if (tshData.length < 2) return null;

  const tshMin = Math.max(0, Math.min(...tshData.map((r) => r.tsh!)) - 0.5);
  const tshMax = Math.max(...tshData.map((r) => r.tsh!)) + 0.5;
  const tshRange = tshMax - tshMin || 1;

  const tshPoints = tshData.map((r, i) => {
    const x = (i / (tshData.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((r.tsh! - tshMin) / tshRange) * (height - padding * 2 - 12);
    return { x, y, tsh: r.tsh! };
  });

  const tshPolyline = tshPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Normal range band (0.4-4.0)
  const normalLow = height - padding - ((0.4 - tshMin) / tshRange) * (height - padding * 2 - 12);
  const normalHigh = height - padding - ((4.0 - tshMin) / tshRange) * (height - padding * 2 - 12);

  // Overlay session markers as small dots on the x-axis
  const allDates = labResults.map((r) => r.date).sort();
  const firstDate = new Date(allDates[0]).getTime();
  const lastDate = new Date(allDates[allDates.length - 1]).getTime();
  const dateRange = lastDate - firstDate || 1;

  const sessionDots = sessions
    .filter((s) => s.date >= allDates[0] && s.date <= allDates[allDates.length - 1])
    .slice(0, 20)
    .map((s) => {
      const t = (new Date(s.date).getTime() - firstDate) / dateRange;
      return (t * (width - padding * 2) + padding);
    });

  return (
    <svg
      className="w-full h-20"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={tFn("labs.title")}
    >
      {/* Normal TSH range band */}
      {normalLow > normalHigh && (
        <rect x={padding} y={normalHigh} width={width - padding * 2} height={normalLow - normalHigh} fill="#7EC8A0" opacity="0.1" />
      )}
      {/* Session dots at bottom */}
      {sessionDots.map((x, i) => (
        <circle key={i} cx={x} cy={height - 4} r={2} fill="#9B8EC4" opacity="0.4" />
      ))}
      {/* TSH line */}
      <polyline points={tshPolyline} stroke="#E4A0A0" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {tshPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#E4A0A0" />
      ))}
      <line x1="10" y1="8" x2="22" y2="8" stroke="#E4A0A0" strokeWidth="2" />
      <text x="25" y="11" fill="#E4A0A0" fontSize="8">{tFn("labs.tsh")}</text>
      <rect x="90" y="4" width="10" height="6" fill="#7EC8A0" opacity="0.3" />
      <text x="104" y="11" fill="#7EC8A0" fontSize="8">{tFn("labs.tshNormal")}</text>
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
