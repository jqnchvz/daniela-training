import { describe, it, expect, beforeEach } from "vitest";
import { useSessionStore } from "@/store/session-store";
import { useAppStore } from "@/store/app-store";

describe("Session Store", () => {
  beforeEach(() => {
    useSessionStore.getState().reset();
  });

  it("starts with initial state", () => {
    const state = useSessionStore.getState();
    expect(state.planId).toBeNull();
    expect(state.phase).toBe("pre-check");
    expect(state.completedSets).toEqual([]);
    expect(state.startedAt).toBeNull();
  });

  it("starts a session", () => {
    useSessionStore.getState().startSession("plan-123");
    const state = useSessionStore.getState();
    expect(state.planId).toBe("plan-123");
    expect(state.startedAt).toBeTruthy();
    expect(state.phase).toBe("pre-check");
  });

  it("transitions phases", () => {
    useSessionStore.getState().setPhase("warmup");
    expect(useSessionStore.getState().phase).toBe("warmup");

    useSessionStore.getState().setPhase("working");
    expect(useSessionStore.getState().phase).toBe("working");
  });

  it("logs sets", () => {
    useSessionStore.getState().logSet({
      exerciseId: "ex-1",
      setNumber: 1,
      weight: 12.5,
      reps: 10,
      rpe: 7,
      completed: true,
    });

    const sets = useSessionStore.getState().completedSets;
    expect(sets).toHaveLength(1);
    expect(sets[0].weight).toBe(12.5);
    expect(sets[0].reps).toBe(10);
  });

  it("advances exercise index", () => {
    expect(useSessionStore.getState().currentExerciseIndex).toBe(0);
    useSessionStore.getState().nextExercise();
    expect(useSessionStore.getState().currentExerciseIndex).toBe(1);
  });

  it("toggles warmup checklist", () => {
    useSessionStore.getState().toggleWarmup(0);
    expect(useSessionStore.getState().warmupChecklist).toEqual([
      true,
      false,
      false,
    ]);
    useSessionStore.getState().toggleWarmup(0);
    expect(useSessionStore.getState().warmupChecklist).toEqual([
      false,
      false,
      false,
    ]);
  });

  it("toggles cooldown checklist", () => {
    useSessionStore.getState().toggleCooldown(2);
    expect(useSessionStore.getState().cooldownChecklist).toEqual([
      false,
      false,
      true,
    ]);
  });

  it("sets energy ratings", () => {
    useSessionStore.getState().setEnergyPre(7);
    useSessionStore.getState().setEnergyPost(8);
    const state = useSessionStore.getState();
    expect(state.energyPre).toBe(7);
    expect(state.energyPost).toBe(8);
  });

  it("resets to initial state", () => {
    useSessionStore.getState().startSession("plan-1");
    useSessionStore.getState().setPhase("working");
    useSessionStore.getState().logSet({
      exerciseId: "ex-1",
      setNumber: 1,
      weight: 10,
      reps: 10,
      rpe: null,
      completed: true,
    });

    useSessionStore.getState().reset();
    const state = useSessionStore.getState();
    expect(state.planId).toBeNull();
    expect(state.phase).toBe("pre-check");
    expect(state.completedSets).toEqual([]);
  });
});

describe("App Store", () => {
  beforeEach(() => {
    useAppStore.setState({ isOnline: true, offlineQueue: [] });
  });

  it("tracks online status", () => {
    expect(useAppStore.getState().isOnline).toBe(true);
    useAppStore.getState().setOnline(false);
    expect(useAppStore.getState().isOnline).toBe(false);
  });

  it("adds to offline queue", () => {
    useAppStore.getState().addToOfflineQueue({
      table: "set_logs",
      type: "insert",
      data: { weight: 10, reps: 10 },
    });

    const queue = useAppStore.getState().offlineQueue;
    expect(queue).toHaveLength(1);
    expect(queue[0].table).toBe("set_logs");
    expect(queue[0].id).toBeTruthy();
  });

  it("removes from offline queue", () => {
    useAppStore.getState().addToOfflineQueue({
      table: "set_logs",
      type: "insert",
      data: { weight: 10 },
    });

    const id = useAppStore.getState().offlineQueue[0].id;
    useAppStore.getState().removeFromQueue(id);
    expect(useAppStore.getState().offlineQueue).toHaveLength(0);
  });

  it("clears entire offline queue", () => {
    useAppStore.getState().addToOfflineQueue({
      table: "a",
      type: "insert",
      data: {},
    });
    useAppStore.getState().addToOfflineQueue({
      table: "b",
      type: "insert",
      data: {},
    });

    useAppStore.getState().clearOfflineQueue();
    expect(useAppStore.getState().offlineQueue).toHaveLength(0);
  });
});
