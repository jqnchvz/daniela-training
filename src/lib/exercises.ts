export interface Exercise {
  id: string;
  name: string;
  category: "compound" | "multi_joint" | "isolation";
  muscleGroups: string[];
  equipment: string[];
  notes: string;
}

export const EXERCISES: Exercise[] = [
  // Compound
  { id: "a0000000-0000-4000-8000-000000000001", name: "Dumbbell Goblet Squat", category: "compound", muscleGroups: ["quads", "glutes", "core"], equipment: ["dumbbell"], notes: "Hold dumbbell at chest level. Keep elbows inside knees." },
  { id: "a0000000-0000-4000-8000-000000000002", name: "Romanian Deadlift (DB)", category: "compound", muscleGroups: ["hamstrings", "glutes", "lower_back"], equipment: ["dumbbell"], notes: "Hinge at hips, slight knee bend. Feel stretch in hamstrings." },
  { id: "a0000000-0000-4000-8000-000000000003", name: "Dumbbell Bench Press", category: "compound", muscleGroups: ["chest", "triceps", "shoulders"], equipment: ["dumbbell"], notes: "Flat bench. Control the eccentric." },
  { id: "a0000000-0000-4000-8000-000000000004", name: "Dumbbell Overhead Press", category: "compound", muscleGroups: ["shoulders", "triceps", "core"], equipment: ["dumbbell"], notes: "Seated or standing. Brace core throughout." },
  { id: "a0000000-0000-4000-8000-000000000005", name: "Dumbbell Bent-Over Row", category: "compound", muscleGroups: ["back", "biceps", "rear_delts"], equipment: ["dumbbell"], notes: "Hinge forward 45 degrees. Pull to hip." },
  { id: "a0000000-0000-4000-8000-000000000006", name: "Dumbbell Lunges", category: "compound", muscleGroups: ["quads", "glutes", "hamstrings"], equipment: ["dumbbell"], notes: "Alternating or walking. Knee tracks over toe." },
  { id: "a0000000-0000-4000-8000-000000000007", name: "Hip Thrust", category: "compound", muscleGroups: ["glutes", "hamstrings"], equipment: ["machine", "dumbbell"], notes: "Machine or DB on hips. Squeeze glutes at top." },
  { id: "a0000000-0000-4000-8000-000000000008", name: "Lat Pulldown", category: "compound", muscleGroups: ["back", "biceps", "rear_delts"], equipment: ["machine"], notes: "Wide grip. Pull to upper chest." },
  { id: "a0000000-0000-4000-8000-000000000009", name: "Leg Press", category: "compound", muscleGroups: ["quads", "glutes", "hamstrings"], equipment: ["machine"], notes: "Feet shoulder-width. Do not lock knees." },
  { id: "a0000000-0000-4000-8000-00000000000a", name: "Cable Face Pulls", category: "multi_joint", muscleGroups: ["rear_delts", "upper_back", "rotator_cuff"], equipment: ["cable"], notes: "Pull to face level. External rotation at top." },
  // Isolation / Accessory
  { id: "a0000000-0000-4000-8000-00000000000b", name: "Dumbbell Bicep Curls", category: "isolation", muscleGroups: ["biceps"], equipment: ["dumbbell"], notes: "Standing or seated. No swinging." },
  { id: "a0000000-0000-4000-8000-00000000000c", name: "Tricep Pushdowns", category: "isolation", muscleGroups: ["triceps"], equipment: ["cable"], notes: "Cable machine. Keep elbows pinned to sides." },
  { id: "a0000000-0000-4000-8000-00000000000d", name: "Lateral Raises", category: "isolation", muscleGroups: ["shoulders"], equipment: ["dumbbell"], notes: "Slight bend in elbows. Raise to shoulder height." },
  { id: "a0000000-0000-4000-8000-00000000000e", name: "Calf Raises", category: "isolation", muscleGroups: ["calves"], equipment: ["dumbbell", "machine"], notes: "Full range of motion. Pause at top." },
  { id: "a0000000-0000-4000-8000-00000000000f", name: "Plank", category: "isolation", muscleGroups: ["core", "shoulders"], equipment: ["bodyweight"], notes: "Hold position. Keep hips level with shoulders." },
  { id: "a0000000-0000-4000-8000-000000000010", name: "Dead Bug", category: "isolation", muscleGroups: ["core"], equipment: ["bodyweight"], notes: "Opposite arm/leg extension. Press lower back into floor." },
  { id: "a0000000-0000-4000-8000-000000000011", name: "Cable Woodchops", category: "multi_joint", muscleGroups: ["core", "obliques"], equipment: ["cable"], notes: "Rotate through core. Control the return." },
];

export const EXERCISE_MAP = new Map(EXERCISES.map((e) => [e.id, e]));

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_MAP.get(id);
}

export interface PlanExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  restSeconds: number;
  order: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  dayOfWeek: number;
  exercises: PlanExercise[];
}

export const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: "b0000000-0000-4000-8000-000000000001",
    name: "Day A — Push Focus",
    dayOfWeek: 1,
    exercises: [
      { exerciseId: "a0000000-0000-4000-8000-000000000001", sets: 3, reps: 10, restSeconds: 150, order: 1 },
      { exerciseId: "a0000000-0000-4000-8000-000000000003", sets: 3, reps: 10, restSeconds: 150, order: 2 },
      { exerciseId: "a0000000-0000-4000-8000-000000000005", sets: 3, reps: 10, restSeconds: 150, order: 3 },
      { exerciseId: "a0000000-0000-4000-8000-00000000000d", sets: 2, reps: 12, restSeconds: 120, order: 4 },
      { exerciseId: "a0000000-0000-4000-8000-00000000000c", sets: 2, reps: 12, restSeconds: 120, order: 5 },
      { exerciseId: "a0000000-0000-4000-8000-00000000000f", sets: 2, reps: 30, restSeconds: 120, order: 6 },
    ],
  },
  {
    id: "b0000000-0000-4000-8000-000000000002",
    name: "Day B — Pull Focus",
    dayOfWeek: 3,
    exercises: [
      { exerciseId: "a0000000-0000-4000-8000-000000000002", sets: 3, reps: 10, restSeconds: 150, order: 1 },
      { exerciseId: "a0000000-0000-4000-8000-000000000008", sets: 3, reps: 10, restSeconds: 150, order: 2 },
      { exerciseId: "a0000000-0000-4000-8000-000000000004", sets: 3, reps: 10, restSeconds: 150, order: 3 },
      { exerciseId: "a0000000-0000-4000-8000-00000000000a", sets: 2, reps: 12, restSeconds: 120, order: 4 },
      { exerciseId: "a0000000-0000-4000-8000-00000000000b", sets: 2, reps: 12, restSeconds: 120, order: 5 },
      { exerciseId: "a0000000-0000-4000-8000-000000000010", sets: 2, reps: 10, restSeconds: 120, order: 6 },
    ],
  },
  {
    id: "b0000000-0000-4000-8000-000000000003",
    name: "Day C — Legs / Full Body",
    dayOfWeek: 5,
    exercises: [
      { exerciseId: "a0000000-0000-4000-8000-000000000009", sets: 3, reps: 10, restSeconds: 150, order: 1 },
      { exerciseId: "a0000000-0000-4000-8000-000000000007", sets: 3, reps: 10, restSeconds: 150, order: 2 },
      { exerciseId: "a0000000-0000-4000-8000-000000000006", sets: 2, reps: 10, restSeconds: 150, order: 3 },
      { exerciseId: "a0000000-0000-4000-8000-000000000011", sets: 2, reps: 12, restSeconds: 120, order: 4 },
      { exerciseId: "a0000000-0000-4000-8000-00000000000e", sets: 2, reps: 15, restSeconds: 120, order: 5 },
      { exerciseId: "a0000000-0000-4000-8000-00000000000f", sets: 2, reps: 30, restSeconds: 120, order: 6 },
    ],
  },
];

export function getPlanByDayOfWeek(dayOfWeek: number): WorkoutPlan | undefined {
  return WORKOUT_PLANS.find((p) => p.dayOfWeek === dayOfWeek);
}
