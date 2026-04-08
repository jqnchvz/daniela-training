/**
 * Progressive overload logic for hypothyroid-safe training.
 * Conservative: max 5-10% increase every 2 weeks, only when meeting all reps with good form.
 */

export interface SessionHistory {
  date: string;
  weight: number;
  reps: number;
  targetReps: number;
  rpe: number | null;
  setsCompleted: number;
  targetSets: number;
}

export interface ProgressionSuggestion {
  type: "increase" | "maintain" | "stall" | "deload" | "rest";
  message: string;
  suggestedWeight?: number;
  currentWeight: number;
}

/**
 * Round to the nearest 2.5kg increment.
 */
export function roundToNearest2_5(weight: number): number {
  return Math.round(weight / 2.5) * 2.5;
}

export interface StallRedFlags {
  hasEnergyFlag?: boolean;
  hasMoodFlag?: boolean;
  hasSleepFlag?: boolean;
  hasSorenessFlag?: boolean;
}

/**
 * Suggest weight progression for an exercise based on recent history.
 *
 * Rules:
 * - Need at least 2 sessions of data
 * - Both sessions must have all prescribed reps completed
 * - Average RPE <= 7 (if RPE data available)
 * - At least 14 days since last weight increase
 * - Increase is 5% rounded to nearest 2.5kg
 *
 * Stall logic:
 * - If stalling AND wellness red flags are active → deload/recovery suggestion
 * - If stalling AND wellness is fine → technique-limited, suggest weight drop
 */
export function suggestProgression(
  history: SessionHistory[],
  lastWeightChangeDate: string | null,
  redFlags?: StallRedFlags,
): ProgressionSuggestion {
  if (history.length === 0) {
    return {
      type: "maintain",
      message: "No history yet. Start with a comfortable weight.",
      currentWeight: 0,
    };
  }

  const currentWeight = history[0].weight;

  // Need at least 2 sessions
  if (history.length < 2) {
    return {
      type: "maintain",
      message: "Need more sessions before suggesting changes.",
      currentWeight,
    };
  }

  const lastTwo = history.slice(0, 2);

  // Check for stall: same weight for 4+ sessions AND not completing reps
  if (history.length >= 4) {
    const lastFour = history.slice(0, 4);
    const allSameWeight = lastFour.every((s) => s.weight === currentWeight);
    const avgReps =
      lastTwo.reduce((sum, s) => sum + s.reps, 0) / lastTwo.length;
    const targetReps = lastTwo[0].targetReps;

    if (allSameWeight && avgReps < targetReps) {
      // Check wellness: if any red flag active, stall is likely recovery-related, not technique-limited
      const hasWellnessIssue =
        redFlags?.hasEnergyFlag ||
        redFlags?.hasMoodFlag ||
        redFlags?.hasSleepFlag ||
        redFlags?.hasSorenessFlag;

      if (hasWellnessIssue) {
        return {
          type: "deload",
          message:
            "Your wellness scores suggest your body needs recovery, not a weight drop. Consider a deload week — same exercises, half the sets, 60% weight.",
          currentWeight,
        };
      }

      return {
        type: "stall",
        message: `Stalling at ${currentWeight}kg? Try dropping 10% to ${roundToNearest2_5(currentWeight * 0.9)}kg and focusing on form, or try a variation.`,
        currentWeight,
      };
    }
  }

  // Check if both recent sessions completed all prescribed reps
  const bothCompletedReps = lastTwo.every(
    (s) => s.reps >= s.targetReps && s.setsCompleted >= s.targetSets,
  );

  if (!bothCompletedReps) {
    return {
      type: "maintain",
      message: "Keep working at this weight until you hit all reps consistently.",
      currentWeight,
    };
  }

  // Check RPE (if available, must average <= 7)
  const rpeSessions = lastTwo.filter((s) => s.rpe !== null);
  if (rpeSessions.length > 0) {
    const avgRpe =
      rpeSessions.reduce((sum, s) => sum + s.rpe!, 0) / rpeSessions.length;
    if (avgRpe > 7) {
      return {
        type: "maintain",
        message: "RPE is still high. Maintain weight until it feels easier.",
        currentWeight,
      };
    }
  }

  // Check time since last weight change (minimum 14 days)
  if (lastWeightChangeDate) {
    const daysSinceChange = Math.floor(
      (Date.now() - new Date(lastWeightChangeDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    if (daysSinceChange < 14) {
      return {
        type: "maintain",
        message: `Weight increased ${daysSinceChange} days ago. Wait ${14 - daysSinceChange} more days.`,
        currentWeight,
      };
    }
  }

  // Ready to progress!
  const suggestedWeight = roundToNearest2_5(currentWeight * 1.05);

  return {
    type: "increase",
    message: `Ready to progress! Try ${suggestedWeight}kg next time.`,
    suggestedWeight,
    currentWeight,
  };
}

/**
 * Deload detection based on weeks since start or last deload.
 */
export interface RedFlagInput {
  hasEnergyFlag: boolean;
  hasMoodFlag: boolean;
}

export interface DeloadStatus {
  weekNumber: number;
  shouldDeload: boolean;
  isDeloadWeek: boolean;
  earlyDeloadSuggested: boolean;
  message: string | null;
}

export function getDeloadStatus(
  programStartDate: string,
  lastDeloadDate: string | null,
  redFlags?: RedFlagInput,
): DeloadStatus {
  const referenceDate = lastDeloadDate ?? programStartDate;
  const daysSince = Math.floor(
    (Date.now() - new Date(referenceDate).getTime()) / (1000 * 60 * 60 * 24),
  );
  const weekNumber = Math.floor(daysSince / 7) + 1;

  const earlyDeloadSuggested = !!(
    redFlags &&
    (redFlags.hasEnergyFlag || redFlags.hasMoodFlag) &&
    weekNumber < 3
  );

  if (weekNumber >= 4) {
    return {
      weekNumber,
      shouldDeload: false,
      isDeloadWeek: true,
      earlyDeloadSuggested: false,
      message:
        "DELOAD WEEK: Same exercises, half the sets, 60% weight. Your body needs this to get stronger.",
    };
  }

  if (weekNumber === 3) {
    return {
      weekNumber,
      shouldDeload: true,
      isDeloadWeek: false,
      earlyDeloadSuggested: false,
      message:
        "Deload week coming up! Next week, same exercises but half the sets and 60% weight. Recovery is where progress happens.",
    };
  }

  return {
    weekNumber,
    shouldDeload: false,
    isDeloadWeek: false,
    earlyDeloadSuggested,
    message: earlyDeloadSuggested
      ? "Your recent check-ins show declining energy or mood. Consider taking a deload week early — recovery is where progress happens."
      : null,
  };
}

/**
 * Apply deload to a workout plan's sets and weight.
 */
export interface DeloadAdjustment {
  sets: number;
  weightMultiplier: number;
}

export function applyDeload(targetSets: number): DeloadAdjustment {
  return {
    sets: Math.max(1, Math.ceil(targetSets / 2)),
    weightMultiplier: 0.6,
  };
}

/**
 * Calculate weekly training volume from set logs.
 */
export type OverreachingSeverity = "none" | "caution" | "warning";

export interface WeeklyVolume {
  weekStart: string;
  volume: number;
  overreaching: OverreachingSeverity;
}

export interface WellnessFlags {
  hasSleepFlag?: boolean;
  hasEnergyFlag?: boolean;
}

export function calculateWeeklyVolumes(
  setLogs: Array<{ date: string; weight: number; reps: number }>,
  wellnessFlags?: WellnessFlags,
): WeeklyVolume[] {
  if (setLogs.length === 0) return [];

  // Group by ISO week
  const weekMap = new Map<string, number>();

  for (const log of setLogs) {
    const date = new Date(log.date);
    const weekStart = getWeekStart(date);
    const key = weekStart.toISOString().split("T")[0];
    weekMap.set(key, (weekMap.get(key) ?? 0) + log.weight * log.reps);
  }

  // Threshold: 10% base, 8% when wellness flags active
  const hasWellnessIssue = wellnessFlags?.hasSleepFlag || wellnessFlags?.hasEnergyFlag;
  const spikeThreshold = hasWellnessIssue ? 1.08 : 1.10;

  // Sort by date and calculate overreaching
  const sorted = Array.from(weekMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  const weeks: WeeklyVolume[] = sorted.map(([weekStart, volume], i) => {
    let severity: OverreachingSeverity = "none";

    if (i > 0) {
      const prevVolume = sorted[i - 1][1];

      // Rule 1: Single-week spike above threshold
      if (volume > prevVolume * spikeThreshold) {
        severity = "warning";
      }

      // Rule 2: 3+ consecutive weeks of any increase (creeping overload)
      if (severity === "none" && i >= 2) {
        const threeWeeksIncreasing =
          sorted[i][1] > sorted[i - 1][1] &&
          sorted[i - 1][1] > sorted[i - 2][1];
        if (threeWeeksIncreasing) {
          severity = "caution";
        }
      }
    }

    return { weekStart, volume, overreaching: severity };
  });

  return weeks.slice(-8); // Last 8 weeks
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
