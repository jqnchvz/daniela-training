import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getTodaysWorkout,
  getNextWorkout,
  getGreeting,
  getDayName,
  WORKOUT_SCHEDULE,
} from "@/lib/workout-schedule";

describe("Workout Schedule", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("has 3 workout days defined", () => {
    expect(WORKOUT_SCHEDULE).toHaveLength(3);
    expect(WORKOUT_SCHEDULE.map((w) => w.dayOfWeek)).toEqual([1, 3, 5]);
  });

  it("returns today's workout on Monday (Day A)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-06T07:00:00")); // Monday
    const workout = getTodaysWorkout();
    expect(workout).not.toBeNull();
    expect(workout!.name).toBe("Day A");
    expect(workout!.label).toBe("Push Focus");
    vi.useRealTimers();
  });

  it("returns today's workout on Wednesday (Day B)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08T07:00:00")); // Wednesday
    const workout = getTodaysWorkout();
    expect(workout).not.toBeNull();
    expect(workout!.name).toBe("Day B");
    vi.useRealTimers();
  });

  it("returns today's workout on Friday (Day C)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-10T07:00:00")); // Friday
    const workout = getTodaysWorkout();
    expect(workout).not.toBeNull();
    expect(workout!.name).toBe("Day C");
    vi.useRealTimers();
  });

  it("returns null on rest days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-07T07:00:00")); // Tuesday
    expect(getTodaysWorkout()).toBeNull();

    vi.setSystemTime(new Date("2026-04-05T07:00:00")); // Sunday
    expect(getTodaysWorkout()).toBeNull();
    vi.useRealTimers();
  });

  it("gets next workout from Tuesday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-07T07:00:00")); // Tuesday
    const next = getNextWorkout();
    expect(next.name).toBe("Day B"); // Wednesday
    expect(next.daysUntil).toBe(1);
    vi.useRealTimers();
  });

  it("gets next workout from Saturday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T07:00:00")); // Saturday
    const next = getNextWorkout();
    expect(next.name).toBe("Day A"); // Monday
    expect(next.daysUntil).toBe(2);
    vi.useRealTimers();
  });

  it("returns correct greeting based on time", () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2026-04-06T07:00:00"));
    expect(getGreeting()).toBe("Good morning");

    vi.setSystemTime(new Date("2026-04-06T14:00:00"));
    expect(getGreeting()).toBe("Good afternoon");

    vi.setSystemTime(new Date("2026-04-06T20:00:00"));
    expect(getGreeting()).toBe("Good evening");

    vi.useRealTimers();
  });

  it("returns correct day names", () => {
    expect(getDayName(0)).toBe("Sunday");
    expect(getDayName(1)).toBe("Monday");
    expect(getDayName(3)).toBe("Wednesday");
    expect(getDayName(5)).toBe("Friday");
  });
});
