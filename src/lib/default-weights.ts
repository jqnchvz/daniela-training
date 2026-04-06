/**
 * Default starting weights for exercises when no history exists.
 * Based on common starting points for intermediate female lifters
 * with hypothyroidism (conservative to prioritize form over load).
 *
 * Weights are in kg and represent a safe starting point.
 * Users can adjust from here; the progressive overload system
 * will handle increases over time.
 */

/** Starting weight by exercise category and muscle group */
const DEFAULT_WEIGHTS: Record<string, number> = {
  // Compound — Lower body
  "a0000000-0000-4000-8000-000000000001": 8,   // Goblet Squat — 8kg DB
  "a0000000-0000-4000-8000-000000000002": 8,   // Romanian Deadlift — 8kg per DB
  "a0000000-0000-4000-8000-000000000006": 6,   // Lunges — 6kg per DB
  "a0000000-0000-4000-8000-000000000007": 10,  // Hip Thrust — 10kg
  "a0000000-0000-4000-8000-000000000009": 20,  // Leg Press — 20kg (machine)

  // Compound — Upper body
  "a0000000-0000-4000-8000-000000000003": 6,   // DB Bench Press — 6kg per DB
  "a0000000-0000-4000-8000-000000000004": 4,   // DB Overhead Press — 4kg per DB
  "a0000000-0000-4000-8000-000000000005": 8,   // Bent-Over Row — 8kg per DB
  "a0000000-0000-4000-8000-000000000008": 20,  // Lat Pulldown — 20kg (machine)

  // Multi-joint / Accessory
  "a0000000-0000-4000-8000-00000000000a": 10,  // Cable Face Pulls — 10kg
  "a0000000-0000-4000-8000-00000000000b": 4,   // Bicep Curls — 4kg per DB
  "a0000000-0000-4000-8000-00000000000c": 10,  // Tricep Pushdowns — 10kg
  "a0000000-0000-4000-8000-00000000000d": 3,   // Lateral Raises — 3kg per DB
  "a0000000-0000-4000-8000-00000000000e": 0,   // Calf Raises — bodyweight
  "a0000000-0000-4000-8000-00000000000f": 0,   // Plank — bodyweight
  "a0000000-0000-4000-8000-000000000010": 0,   // Dead Bug — bodyweight
  "a0000000-0000-4000-8000-000000000011": 10,  // Cable Woodchops — 10kg
};

/**
 * Get the default starting weight for an exercise.
 * Returns null for bodyweight exercises (weight = 0 is intentional).
 */
export function getDefaultWeight(exerciseId: string): number {
  return DEFAULT_WEIGHTS[exerciseId] ?? 0;
}
