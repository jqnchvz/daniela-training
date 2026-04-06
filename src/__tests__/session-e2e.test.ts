import { describe, it, expect, beforeEach } from "vitest";
import { useSessionStore } from "@/store/session-store";
import { WORKOUT_PLANS, getExerciseById } from "@/lib/exercises";

/**
 * End-to-end session flow test — simulates a complete workout session
 * through all phases: pre-check → warmup → working (all exercises × all sets) → cooldown → summary
 */
describe("Full session E2E flow", () => {
  const dayA = WORKOUT_PLANS[0]; // Day A — Push Focus

  beforeEach(() => {
    useSessionStore.getState().reset();
  });

  it("completes a full Day A session with all 6 exercises and all sets logged", () => {
    const store = useSessionStore;

    // 1. Start session
    store.getState().startSession(dayA.id);
    expect(store.getState().planId).toBe(dayA.id);
    expect(store.getState().phase).toBe("pre-check");
    expect(store.getState().startedAt).toBeTruthy();

    // 2. Pre-check: rate energy
    store.getState().setEnergyPre(7);
    expect(store.getState().energyPre).toBe(7);
    store.getState().setPhase("warmup");
    expect(store.getState().phase).toBe("warmup");

    // 3. Warmup: complete all items
    store.getState().toggleWarmup(0);
    store.getState().toggleWarmup(1);
    store.getState().toggleWarmup(2);
    expect(store.getState().warmupChecklist.every(Boolean)).toBe(true);
    store.getState().setPhase("working");
    expect(store.getState().phase).toBe("working");

    // 4. Working phase: log ALL sets for ALL 6 exercises
    let totalSetsLogged = 0;

    for (let exIndex = 0; exIndex < dayA.exercises.length; exIndex++) {
      const planEx = dayA.exercises[exIndex];
      const exercise = getExerciseById(planEx.exerciseId)!;

      expect(store.getState().currentExerciseIndex).toBe(exIndex);
      expect(exercise).toBeDefined();

      // Log each set for this exercise
      for (let setNum = 0; setNum < planEx.sets; setNum++) {
        const weight = 10 + exIndex * 2.5; // Simulate different weights per exercise
        const reps = planEx.reps;

        store.getState().logSet({
          exerciseId: exercise.id,
          setNumber: setNum + 1,
          weight,
          reps,
          rpe: setNum === planEx.sets - 1 ? 7 : null, // RPE on last set
          completed: true,
        });

        totalSetsLogged++;

        // Verify set was logged
        const setsForEx = store
          .getState()
          .completedSets.filter((s) => s.exerciseId === exercise.id);
        expect(setsForEx).toHaveLength(setNum + 1);
        expect(setsForEx[setNum].weight).toBe(weight);
        expect(setsForEx[setNum].reps).toBe(reps);
      }

      // All sets done for this exercise — move to next
      const setsForEx = store
        .getState()
        .completedSets.filter((s) => s.exerciseId === exercise.id);
      expect(setsForEx).toHaveLength(planEx.sets);

      // Advance to next exercise (except after the last one)
      if (exIndex < dayA.exercises.length - 1) {
        store.getState().nextExercise();
        expect(store.getState().currentExerciseIndex).toBe(exIndex + 1);
      }
    }

    // Verify total sets logged
    expect(store.getState().completedSets).toHaveLength(totalSetsLogged);

    // Calculate expected total: Day A has exercises with 3+3+3+2+2+2 = 15 sets
    const expectedSets = dayA.exercises.reduce((sum, e) => sum + e.sets, 0);
    expect(totalSetsLogged).toBe(expectedSets);
    expect(expectedSets).toBe(15);

    // 5. Cooldown
    store.getState().setPhase("cooldown");
    store.getState().toggleCooldown(0);
    store.getState().toggleCooldown(1);
    store.getState().toggleCooldown(2);
    expect(store.getState().cooldownChecklist.every(Boolean)).toBe(true);

    // 6. Summary
    store.getState().setEnergyPost(8);
    store.getState().setPhase("summary");
    expect(store.getState().phase).toBe("summary");
    expect(store.getState().energyPre).toBe(7);
    expect(store.getState().energyPost).toBe(8);

    // Verify session data integrity
    const finalSets = store.getState().completedSets;
    expect(finalSets).toHaveLength(15);

    // Verify each exercise has the correct number of sets
    for (const planEx of dayA.exercises) {
      const exercise = getExerciseById(planEx.exerciseId)!;
      const setsForEx = finalSets.filter((s) => s.exerciseId === exercise.id);
      expect(setsForEx).toHaveLength(planEx.sets);

      // Verify sets are numbered correctly
      const setNumbers = setsForEx.map((s) => s.setNumber);
      expect(setNumbers).toEqual(
        Array.from({ length: planEx.sets }, (_, i) => i + 1),
      );

      // Verify all marked complete
      expect(setsForEx.every((s) => s.completed)).toBe(true);
    }

    // Calculate total volume
    const totalVolume = finalSets.reduce(
      (sum, s) => sum + s.weight * s.reps,
      0,
    );
    expect(totalVolume).toBeGreaterThan(0);

    // 7. Reset
    store.getState().reset();
    expect(store.getState().planId).toBeNull();
    expect(store.getState().completedSets).toEqual([]);
    expect(store.getState().phase).toBe("pre-check");
  });

  it("completes Day B session with correct exercise count", () => {
    const dayB = WORKOUT_PLANS[1];
    const store = useSessionStore;

    store.getState().startSession(dayB.id);
    store.getState().setEnergyPre(6);
    store.getState().setPhase("working");

    // Log all sets for all exercises
    for (let exIndex = 0; exIndex < dayB.exercises.length; exIndex++) {
      const planEx = dayB.exercises[exIndex];
      for (let setNum = 0; setNum < planEx.sets; setNum++) {
        store.getState().logSet({
          exerciseId: planEx.exerciseId,
          setNumber: setNum + 1,
          weight: 15,
          reps: planEx.reps,
          rpe: null,
          completed: true,
        });
      }
      if (exIndex < dayB.exercises.length - 1) {
        store.getState().nextExercise();
      }
    }

    const expectedSets = dayB.exercises.reduce((sum, e) => sum + e.sets, 0);
    expect(store.getState().completedSets).toHaveLength(expectedSets);
    expect(expectedSets).toBe(15); // Day B: 3+3+3+2+2+2 = 15

    const exercisesLogged = new Set(
      store.getState().completedSets.map((s) => s.exerciseId),
    ).size;
    expect(exercisesLogged).toBe(6);
  });

  it("completes Day C session with correct exercise count", () => {
    const dayC = WORKOUT_PLANS[2];
    const store = useSessionStore;

    store.getState().startSession(dayC.id);
    store.getState().setEnergyPre(8);
    store.getState().setPhase("working");

    for (let exIndex = 0; exIndex < dayC.exercises.length; exIndex++) {
      const planEx = dayC.exercises[exIndex];
      for (let setNum = 0; setNum < planEx.sets; setNum++) {
        store.getState().logSet({
          exerciseId: planEx.exerciseId,
          setNumber: setNum + 1,
          weight: 20,
          reps: planEx.reps,
          rpe: null,
          completed: true,
        });
      }
      if (exIndex < dayC.exercises.length - 1) {
        store.getState().nextExercise();
      }
    }

    const expectedSets = dayC.exercises.reduce((sum, e) => sum + e.sets, 0);
    expect(store.getState().completedSets).toHaveLength(expectedSets);
    expect(expectedSets).toBe(14); // Day C: 3+3+2+2+2+2 = 14

    const exercisesLogged = new Set(
      store.getState().completedSets.map((s) => s.exerciseId),
    ).size;
    expect(exercisesLogged).toBe(6);
  });

  it("tracks volume correctly across all sets", () => {
    const store = useSessionStore;
    store.getState().startSession(dayA.id);
    store.getState().setPhase("working");

    // Log 3 sets of 10kg × 10 reps
    for (let i = 0; i < 3; i++) {
      store.getState().logSet({
        exerciseId: dayA.exercises[0].exerciseId,
        setNumber: i + 1,
        weight: 10,
        reps: 10,
        rpe: null,
        completed: true,
      });
    }

    const totalVolume = store
      .getState()
      .completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    expect(totalVolume).toBe(300); // 3 × 10 × 10
  });

  it("handles skip exercise correctly", () => {
    const store = useSessionStore;
    store.getState().startSession(dayA.id);
    store.getState().setPhase("working");

    expect(store.getState().currentExerciseIndex).toBe(0);

    // Skip first exercise (no sets logged)
    store.getState().nextExercise();
    expect(store.getState().currentExerciseIndex).toBe(1);

    // Log sets for second exercise
    store.getState().logSet({
      exerciseId: dayA.exercises[1].exerciseId,
      setNumber: 1,
      weight: 14,
      reps: 10,
      rpe: null,
      completed: true,
    });

    expect(store.getState().completedSets).toHaveLength(1);
    expect(store.getState().completedSets[0].exerciseId).toBe(
      dayA.exercises[1].exerciseId,
    );
  });

  it("rest timer sets and clears correctly", () => {
    const store = useSessionStore;
    store.getState().startSession(dayA.id);

    // Set rest timer
    const endTime = Date.now() + 150000; // 2.5 min
    store.getState().setRestTimer(endTime);
    expect(store.getState().restTimerEnd).toBe(endTime);

    // Clear rest timer (skip)
    store.getState().setRestTimer(null);
    expect(store.getState().restTimerEnd).toBeNull();
  });
});
