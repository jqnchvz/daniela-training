/**
 * Daily check-in utilities and red flag detection for hypothyroid monitoring.
 */

export interface CheckinData {
  date: string;
  energy: number;
  sleepQuality: number;
  sleepHours: number | null;
  mood: number;
  soreness: number;
  notes: string;
  walkMinutes: number | null;
  didStretching: boolean | null;
  didYoga: boolean | null;
}

/**
 * Red flag detection: compares 7-day average to 30-day average.
 * If 7-day avg is 2+ points lower, it's a warning sign for overtraining.
 */
export interface RedFlagResult {
  hasEnergyFlag: boolean;
  hasMoodFlag: boolean;
  hasSleepFlag: boolean;
  hasSorenessFlag: boolean;
  latestSoreness: number;
  energyAvg7: number;
  energyAvg30: number;
  moodAvg7: number;
  moodAvg30: number;
  sleepAvg7: number;
}

export function detectRedFlags(checkins: CheckinData[]): RedFlagResult {
  const sorted = [...checkins].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const last7 = sorted.slice(0, 7);
  const last30 = sorted.slice(0, 30);

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

  const energyAvg7 = avg(last7.map((c) => c.energy));
  const energyAvg30 = avg(last30.map((c) => c.energy));
  const moodAvg7 = avg(last7.map((c) => c.mood));
  const moodAvg30 = avg(last30.map((c) => c.mood));

  // Sleep: use absolute threshold (< 7h) — chronic deprivation worsens thyroid function
  const sleepHours7 = last7
    .map((c) => c.sleepHours)
    .filter((h): h is number => h !== null);
  const sleepAvg7 = sleepHours7.length > 0
    ? sleepHours7.reduce((s, v) => s + v, 0) / sleepHours7.length
    : 0;

  // Soreness: flag when most recent check-in reports ≥ 8/10
  const latestSoreness = sorted.length > 0 ? sorted[0].soreness : 0;

  return {
    hasEnergyFlag: last7.length >= 3 && last30.length >= 7 && energyAvg30 - energyAvg7 >= 2,
    hasMoodFlag: last7.length >= 3 && last30.length >= 7 && moodAvg30 - moodAvg7 >= 2,
    hasSleepFlag: sleepHours7.length >= 3 && sleepAvg7 < 7,
    hasSorenessFlag: sorted.length > 0 && latestSoreness >= 8,
    latestSoreness,
    energyAvg7: Math.round(energyAvg7 * 10) / 10,
    energyAvg30: Math.round(energyAvg30 * 10) / 10,
    moodAvg7: Math.round(moodAvg7 * 10) / 10,
    moodAvg30: Math.round(moodAvg30 * 10) / 10,
    sleepAvg7: Math.round(sleepAvg7 * 10) / 10,
  };
}

/**
 * Calculate check-in streak (consecutive days with check-ins ending today).
 */
export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sorted = [...dates]
    .map((d) => new Date(d).toISOString().split("T")[0])
    .sort((a, b) => b.localeCompare(a)); // newest first

  const today = new Date().toISOString().split("T")[0];
  if (sorted[0] !== today) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Compute rolling average for chart smoothing.
 */
export function rollingAverage(
  values: number[],
  window: number,
): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    return slice.reduce((s, v) => s + v, 0) / slice.length;
  });
}
