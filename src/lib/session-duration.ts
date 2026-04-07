/**
 * Estimate total session duration in minutes based on actual sets, rest times,
 * inter-exercise rest, RPE input time, warmup and cooldown.
 */

import { getExerciseById, type PlanExercise } from "@/lib/exercises";

const SET_DURATION = 35;         // seconds per set (performing the exercise)
const RPE_TIME = 8;              // seconds for RPE input after each set
const INTER_REST_COMPOUND = 180; // seconds between compound exercises
const INTER_REST_MIXED = 150;    // compound→accessory or vice versa
const INTER_REST_ACCESSORY = 120; // between accessory exercises

export function estimateWorkingMinutes(exercises: PlanExercise[]): number {
  let totalSeconds = 0;

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const exerciseInfo = getExerciseById(ex.exerciseId);
    const isCompound = exerciseInfo?.category === "compound";

    // Time performing sets + RPE
    totalSeconds += ex.sets * (SET_DURATION + RPE_TIME);

    // Intra-exercise rest (between sets of same exercise)
    totalSeconds += (ex.sets - 1) * ex.restSeconds;

    // Inter-exercise rest (between different exercises, except after last)
    if (i < exercises.length - 1) {
      const nextInfo = getExerciseById(exercises[i + 1].exerciseId);
      const nextIsCompound = nextInfo?.category === "compound";

      if (isCompound && nextIsCompound) {
        totalSeconds += INTER_REST_COMPOUND;
      } else if (isCompound || nextIsCompound) {
        totalSeconds += INTER_REST_MIXED;
      } else {
        totalSeconds += INTER_REST_ACCESSORY;
      }
    }
  }

  return Math.ceil(totalSeconds / 60);
}

export function estimateSessionDuration(
  exercises: PlanExercise[],
  warmupMinutes: number,
  cooldownMinutes: number,
): number {
  return warmupMinutes + estimateWorkingMinutes(exercises) + cooldownMinutes;
}
