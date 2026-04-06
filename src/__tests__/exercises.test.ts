import { describe, it, expect } from "vitest";
import {
  EXERCISES,
  WORKOUT_PLANS,
  getExerciseById,
  getPlanByDayOfWeek,
  getLiteExercises,
} from "@/lib/exercises";

describe("Exercise database", () => {
  it("has 17 exercises", () => {
    expect(EXERCISES).toHaveLength(17);
  });

  it("has correct category distribution", () => {
    const compound = EXERCISES.filter((e) => e.category === "compound");
    const multiJoint = EXERCISES.filter((e) => e.category === "multi_joint");
    const isolation = EXERCISES.filter((e) => e.category === "isolation");
    expect(compound).toHaveLength(9);
    expect(multiJoint).toHaveLength(2);
    expect(isolation).toHaveLength(6);
  });

  it("all exercises have unique IDs", () => {
    const ids = EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all exercises have unique names", () => {
    const names = EXERCISES.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("all exercises have at least one muscle group and equipment", () => {
    for (const ex of EXERCISES) {
      expect(ex.muscleGroups.length).toBeGreaterThan(0);
      expect(ex.equipment.length).toBeGreaterThan(0);
    }
  });

  it("getExerciseById returns correct exercise", () => {
    const ex = getExerciseById("a0000000-0000-4000-8000-000000000001");
    expect(ex).toBeDefined();
    expect(ex!.name).toBe("Dumbbell Goblet Squat");
  });

  it("getExerciseById returns undefined for unknown ID", () => {
    expect(getExerciseById("nonexistent")).toBeUndefined();
  });
});

describe("Workout plans", () => {
  it("has 3 plans", () => {
    expect(WORKOUT_PLANS).toHaveLength(3);
  });

  it("plans are on Monday, Wednesday, Friday", () => {
    expect(WORKOUT_PLANS.map((p) => p.dayOfWeek)).toEqual([1, 3, 5]);
  });

  it("each plan has 6 exercises", () => {
    for (const plan of WORKOUT_PLANS) {
      expect(plan.exercises).toHaveLength(6);
    }
  });

  it("all plan exercises reference valid exercise IDs", () => {
    for (const plan of WORKOUT_PLANS) {
      for (const pe of plan.exercises) {
        const ex = getExerciseById(pe.exerciseId);
        expect(ex).toBeDefined();
      }
    }
  });

  it("compound exercises have 150s rest, accessories have 120s", () => {
    for (const plan of WORKOUT_PLANS) {
      for (const pe of plan.exercises) {
        const ex = getExerciseById(pe.exerciseId)!;
        if (ex.category === "compound") {
          expect(pe.restSeconds).toBe(150);
        } else {
          expect(pe.restSeconds).toBe(120);
        }
      }
    }
  });

  it("exercises are ordered sequentially", () => {
    for (const plan of WORKOUT_PLANS) {
      const orders = plan.exercises.map((e) => e.order);
      expect(orders).toEqual([1, 2, 3, 4, 5, 6]);
    }
  });

  it("getPlanByDayOfWeek returns correct plan", () => {
    const dayA = getPlanByDayOfWeek(1);
    expect(dayA).toBeDefined();
    expect(dayA!.name).toContain("Day A");

    const dayB = getPlanByDayOfWeek(3);
    expect(dayB!.name).toContain("Day B");
  });

  it("getPlanByDayOfWeek returns undefined for rest days", () => {
    expect(getPlanByDayOfWeek(0)).toBeUndefined(); // Sunday
    expect(getPlanByDayOfWeek(2)).toBeUndefined(); // Tuesday
  });
});

describe("getLiteExercises", () => {
  it("filters to compound and multi_joint only", () => {
    const dayA = WORKOUT_PLANS[0];
    const lite = getLiteExercises(dayA.exercises);
    for (const pe of lite) {
      const ex = getExerciseById(pe.exerciseId)!;
      expect(["compound", "multi_joint"]).toContain(ex.category);
    }
  });

  it("excludes isolation exercises", () => {
    const dayA = WORKOUT_PLANS[0];
    const lite = getLiteExercises(dayA.exercises);
    const liteIds = new Set(lite.map((pe) => pe.exerciseId));
    for (const pe of dayA.exercises) {
      const ex = getExerciseById(pe.exerciseId)!;
      if (ex.category === "isolation") {
        expect(liteIds.has(pe.exerciseId)).toBe(false);
      }
    }
  });

  it("reduces sets by 1 with minimum 2", () => {
    const dayA = WORKOUT_PLANS[0];
    const lite = getLiteExercises(dayA.exercises);
    for (const pe of lite) {
      const original = dayA.exercises.find((e) => e.exerciseId === pe.exerciseId)!;
      expect(pe.sets).toBe(Math.max(2, original.sets - 1));
    }
  });

  it("Day A lite has fewer exercises than full", () => {
    const dayA = WORKOUT_PLANS[0];
    const lite = getLiteExercises(dayA.exercises);
    expect(lite.length).toBeLessThan(dayA.exercises.length);
    expect(lite.length).toBeGreaterThan(0);
  });
});
