export type WorkoutDay = {
  name: string;
  nameEs: string;
  label: string;
  labelEs: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ...
  exercises: number;
  duration: string;
};

export const WORKOUT_SCHEDULE: WorkoutDay[] = [
  {
    name: "Day A",
    nameEs: "Día A",
    label: "Push Focus",
    labelEs: "Enfoque Empuje",
    dayOfWeek: 1,
    exercises: 6,
    duration: "~50 min",
  },
  {
    name: "Day B",
    nameEs: "Día B",
    label: "Pull Focus",
    labelEs: "Enfoque Tirón",
    dayOfWeek: 3,
    exercises: 6,
    duration: "~50 min",
  },
  {
    name: "Day C",
    nameEs: "Día C",
    label: "Legs / Full Body",
    labelEs: "Piernas / Cuerpo Completo",
    dayOfWeek: 5,
    exercises: 6,
    duration: "~50 min",
  },
];

export function getTodaysWorkout(): WorkoutDay | null {
  const today = new Date().getDay();
  return WORKOUT_SCHEDULE.find((w) => w.dayOfWeek === today) ?? null;
}

export function getNextWorkout(): WorkoutDay & { daysUntil: number } {
  const today = new Date().getDay();
  let minDays = 8;
  let next = WORKOUT_SCHEDULE[0];

  for (const workout of WORKOUT_SCHEDULE) {
    const daysUntil =
      (workout.dayOfWeek - today + 7) % 7 || (today === workout.dayOfWeek ? 0 : 7);
    if (daysUntil > 0 && daysUntil < minDays) {
      minDays = daysUntil;
      next = workout;
    }
  }

  return { ...next, daysUntil: minDays };
}
