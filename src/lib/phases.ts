/**
 * 16-week periodization system for hypothyroid-safe training.
 * Three phases with progressive intensity and decreasing reps.
 */

export interface PhaseConfig {
  phase: 1 | 2 | 3;
  name: string;
  weeksRange: [number, number];
  repsMin: number;
  repsMax: number;
  setsMin: number;
  setsMax: number;
  restSeconds: number;
  focus: string;
  description: string;
}

export const PHASE_CONFIGS: PhaseConfig[] = [
  {
    phase: 1,
    name: "Stabilization",
    weeksRange: [1, 4],
    repsMin: 12,
    repsMax: 15,
    setsMin: 2,
    setsMax: 3,
    restSeconds: 120,
    focus: "Form mastery & work capacity",
    description:
      "Focus on learning proper form with lighter weights. Higher reps build work capacity and neural adaptation.",
  },
  {
    phase: 2,
    name: "Strength Endurance",
    weeksRange: [5, 10],
    repsMin: 8,
    repsMax: 12,
    setsMin: 3,
    setsMax: 3,
    restSeconds: 150,
    focus: "Progressive overload",
    description:
      "Standard hypertrophy range. Increase weight when you can complete all reps with good form.",
  },
  {
    phase: 3,
    name: "Muscular Development",
    weeksRange: [11, 16],
    repsMin: 6,
    repsMax: 10,
    setsMin: 3,
    setsMax: 4,
    restSeconds: 180,
    focus: "Volume & strength gains",
    description:
      "Heavier loads, lower reps. Focus on progressive volume and building strength.",
  },
];

export interface PhaseStatus {
  phase: PhaseConfig;
  weekNumber: number;
  weekInPhase: number;
  totalWeeks: number;
  progressPercent: number;
  isComplete: boolean;
  isTransitioning: boolean;
  nextPhase: PhaseConfig | null;
}

/**
 * Calculate the current phase based on cycle start date.
 * Extension weeks shift subsequent phase boundaries forward.
 */
export function getCurrentPhase(
  cycleStartDate: string,
  extensionWeeks: number = 0,
): PhaseStatus {
  const start = new Date(cycleStartDate);
  const now = new Date();
  const daysSince = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  const weekNumber = Math.max(1, Math.floor(daysSince / 7) + 1);
  const totalWeeks = 16 + extensionWeeks;

  // Adjust phase boundaries for extensions
  const p1End = 4 + extensionWeeks;
  const p2End = 10 + extensionWeeks;
  const p3End = totalWeeks;

  let phaseConfig: PhaseConfig;
  let weekInPhase: number;
  let isTransitioning = false;

  if (weekNumber <= p1End) {
    phaseConfig = PHASE_CONFIGS[0];
    weekInPhase = weekNumber;
    isTransitioning = weekNumber === p1End;
  } else if (weekNumber <= p2End) {
    phaseConfig = PHASE_CONFIGS[1];
    weekInPhase = weekNumber - p1End;
    isTransitioning = weekNumber === p2End;
  } else if (weekNumber <= p3End) {
    phaseConfig = PHASE_CONFIGS[2];
    weekInPhase = weekNumber - p2End;
    isTransitioning = weekNumber === p3End;
  } else {
    // Cycle complete — still in phase 3 config
    phaseConfig = PHASE_CONFIGS[2];
    weekInPhase = weekNumber - p2End;
    isTransitioning = false;
  }

  const isComplete = weekNumber > totalWeeks;
  const progressPercent = Math.min(
    100,
    Math.round((weekNumber / totalWeeks) * 100),
  );

  const currentPhaseIndex = PHASE_CONFIGS.indexOf(phaseConfig);
  const nextPhase =
    currentPhaseIndex < PHASE_CONFIGS.length - 1
      ? PHASE_CONFIGS[currentPhaseIndex + 1]
      : null;

  return {
    phase: phaseConfig,
    weekNumber,
    weekInPhase,
    totalWeeks,
    progressPercent,
    isComplete,
    isTransitioning,
    nextPhase,
  };
}

/**
 * Get phase-adjusted sets for an exercise.
 * Uses the phase's setsMax for compound, setsMin for accessories.
 */
export function getPhaseAdjustedSets(
  phaseConfig: PhaseConfig,
  isCompound: boolean,
): number {
  return isCompound ? phaseConfig.setsMax : phaseConfig.setsMin;
}

/**
 * Get phase-adjusted target reps (uses repsMax as the primary target).
 */
export function getPhaseAdjustedReps(phaseConfig: PhaseConfig): number {
  return phaseConfig.repsMax;
}

/**
 * Check if weight progression should be suppressed in this phase.
 * Phase 1 focuses on form — no weight increases.
 */
export function shouldSuppressProgression(phaseConfig: PhaseConfig): boolean {
  return phaseConfig.phase === 1;
}

/**
 * Generate transition message when moving between phases.
 */
export function getTransitionMessage(
  from: PhaseConfig,
  to: PhaseConfig,
): string {
  return `Moving into Phase ${to.phase}: ${to.name}!\n\n` +
    `What changes:\n` +
    `- Reps: ${from.repsMin}-${from.repsMax} → ${to.repsMin}-${to.repsMax}\n` +
    `- Sets: ${from.setsMin}-${from.setsMax} → ${to.setsMin}-${to.setsMax}\n` +
    `- Rest: ${Math.round(from.restSeconds / 60)}:${String(from.restSeconds % 60).padStart(2, "0")} → ${Math.round(to.restSeconds / 60)}:${String(to.restSeconds % 60).padStart(2, "0")}\n` +
    `- Focus: ${to.focus}`;
}
