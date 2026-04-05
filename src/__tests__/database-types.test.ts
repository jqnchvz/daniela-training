import { describe, it, expect } from "vitest";
import type { Database } from "@/types/database";

// Type-level tests: these verify the database types are well-formed
// by using TypeScript satisfies checks at compile time.

type Tables = Database["public"]["Tables"];

describe("Database types", () => {
  it("has all required tables defined", () => {
    const tableNames: (keyof Tables)[] = [
      "exercises",
      "workout_plans",
      "workout_plan_exercises",
      "session_logs",
      "set_logs",
      "daily_checkins",
      "body_measurements",
    ];
    expect(tableNames).toHaveLength(7);
  });

  it("exercises table has correct shape", () => {
    const exercise: Tables["exercises"]["Row"] = {
      id: "test-id",
      name: "Goblet Squat",
      category: "compound",
      muscle_groups: ["quads", "glutes"],
      equipment: ["dumbbell"],
      notes: null,
    };
    expect(exercise.name).toBe("Goblet Squat");
    expect(exercise.category).toBe("compound");
  });

  it("set_logs table has correct shape", () => {
    const setLog: Tables["set_logs"]["Row"] = {
      id: "test-id",
      session_log_id: "session-1",
      exercise_id: "ex-1",
      set_number: 1,
      weight: 12.5,
      reps: 10,
      rpe: 7,
      completed: true,
    };
    expect(setLog.weight).toBe(12.5);
    expect(setLog.completed).toBe(true);
  });

  it("daily_checkins table has correct shape", () => {
    const checkin: Tables["daily_checkins"]["Row"] = {
      id: "test-id",
      date: "2024-03-15",
      energy: 7,
      sleep_quality: 8,
      sleep_hours: 7.5,
      mood: 7,
      soreness: 3,
      notes: null,
      created_at: "2024-03-15T08:00:00Z",
    };
    expect(checkin.energy).toBe(7);
    expect(checkin.sleep_hours).toBe(7.5);
  });
});
