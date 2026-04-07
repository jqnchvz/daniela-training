/**
 * Default starting weights for exercises based on experience level.
 * Conservative values for hypothyroidism training — prioritize form over load.
 * All weights in kg, must be multiples of 2.5.
 */

import type { ExperienceLevel } from "@/store/auth-store";

interface WeightTier {
  beginner: number;
  intermediate: number;
  advanced: number;
}

const DEFAULT_WEIGHTS: Record<string, WeightTier> = {
  // Compound — Lower body
  "a0000000-0000-4000-8000-000000000001": { beginner: 5,    intermediate: 7.5,  advanced: 15 },   // Goblet Squat
  "a0000000-0000-4000-8000-000000000002": { beginner: 5,    intermediate: 7.5,  advanced: 12.5 },  // Romanian Deadlift
  "a0000000-0000-4000-8000-000000000006": { beginner: 2.5,  intermediate: 5,    advanced: 10 },    // Lunges
  "a0000000-0000-4000-8000-000000000007": { beginner: 5,    intermediate: 10,   advanced: 20 },    // Hip Thrust
  "a0000000-0000-4000-8000-000000000009": { beginner: 10,   intermediate: 20,   advanced: 40 },    // Leg Press

  // Compound — Upper body
  "a0000000-0000-4000-8000-000000000003": { beginner: 2.5,  intermediate: 5,    advanced: 10 },    // DB Bench Press
  "a0000000-0000-4000-8000-000000000004": { beginner: 2.5,  intermediate: 5,    advanced: 7.5 },   // DB Overhead Press
  "a0000000-0000-4000-8000-000000000005": { beginner: 5,    intermediate: 7.5,  advanced: 12.5 },  // Bent-Over Row
  "a0000000-0000-4000-8000-000000000008": { beginner: 10,   intermediate: 20,   advanced: 30 },    // Lat Pulldown

  // Multi-joint / Accessory
  "a0000000-0000-4000-8000-00000000000a": { beginner: 5,    intermediate: 10,   advanced: 15 },    // Cable Face Pulls
  "a0000000-0000-4000-8000-00000000000b": { beginner: 2.5,  intermediate: 5,    advanced: 7.5 },   // Bicep Curls
  "a0000000-0000-4000-8000-00000000000c": { beginner: 5,    intermediate: 10,   advanced: 15 },    // Tricep Pushdowns
  "a0000000-0000-4000-8000-00000000000d": { beginner: 2.5,  intermediate: 2.5,  advanced: 5 },     // Lateral Raises
  "a0000000-0000-4000-8000-00000000000e": { beginner: 0,    intermediate: 0,    advanced: 10 },    // Calf Raises
  "a0000000-0000-4000-8000-00000000000f": { beginner: 0,    intermediate: 0,    advanced: 0 },     // Plank (bodyweight)
  "a0000000-0000-4000-8000-000000000010": { beginner: 0,    intermediate: 0,    advanced: 0 },     // Dead Bug (bodyweight)
  "a0000000-0000-4000-8000-000000000011": { beginner: 5,    intermediate: 10,   advanced: 15 },    // Cable Woodchops
};

/**
 * Get the default starting weight for an exercise based on experience level.
 * Always returns a multiple of 2.5kg.
 */
export function getDefaultWeight(exerciseId: string, level?: ExperienceLevel | null): number {
  const tier = DEFAULT_WEIGHTS[exerciseId];
  if (!tier) return 0;
  const raw = tier[level ?? "intermediate"];
  return Math.round(raw / 2.5) * 2.5;
}
