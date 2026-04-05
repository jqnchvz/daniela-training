export type WorkoutDay = {
  name: string;
  label: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ...
  exercises: number;
  duration: string;
};

export const WORKOUT_SCHEDULE: WorkoutDay[] = [
  {
    name: "Day A",
    label: "Push Focus",
    dayOfWeek: 1,
    exercises: 6,
    duration: "~50 min",
  },
  {
    name: "Day B",
    label: "Pull Focus",
    dayOfWeek: 3,
    exercises: 6,
    duration: "~50 min",
  },
  {
    name: "Day C",
    label: "Legs / Full Body",
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

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek];
}
