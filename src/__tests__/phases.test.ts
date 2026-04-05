import { describe, it, expect, vi, afterEach } from "vitest";
import {
  PHASE_CONFIGS,
  getCurrentPhase,
  getPhaseAdjustedSets,
  getPhaseAdjustedReps,
  shouldSuppressProgression,
  getTransitionMessage,
} from "@/lib/phases";

describe("Phase configs", () => {
  it("has 3 phases", () => {
    expect(PHASE_CONFIGS).toHaveLength(3);
  });

  it("phases cover weeks 1-16", () => {
    expect(PHASE_CONFIGS[0].weeksRange).toEqual([1, 4]);
    expect(PHASE_CONFIGS[1].weeksRange).toEqual([5, 10]);
    expect(PHASE_CONFIGS[2].weeksRange).toEqual([11, 16]);
  });

  it("reps decrease through phases", () => {
    expect(PHASE_CONFIGS[0].repsMax).toBeGreaterThan(PHASE_CONFIGS[1].repsMax);
    expect(PHASE_CONFIGS[1].repsMax).toBeGreaterThan(PHASE_CONFIGS[2].repsMax);
  });
});

describe("getCurrentPhase", () => {
  afterEach(() => vi.useRealTimers());

  it("returns Phase 1 in week 1", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-07")); // 1 week after start
    const status = getCurrentPhase("2026-04-01");
    expect(status.phase.phase).toBe(1);
    expect(status.weekNumber).toBe(1);
    expect(status.phase.name).toBe("Stabilization");
  });

  it("returns Phase 1 in week 4", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-22")); // 3 weeks after start
    const status = getCurrentPhase("2026-04-01");
    expect(status.phase.phase).toBe(1);
    expect(status.weekNumber).toBe(4);
  });

  it("transitions to Phase 2 at week 5", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-29")); // 4 weeks after start
    const status = getCurrentPhase("2026-04-01");
    expect(status.phase.phase).toBe(2);
    expect(status.weekNumber).toBe(5);
    expect(status.phase.name).toBe("Strength Endurance");
  });

  it("transitions to Phase 3 at week 11", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10")); // 10 weeks after start
    const status = getCurrentPhase("2026-04-01");
    expect(status.phase.phase).toBe(3);
    expect(status.weekNumber).toBe(11);
    expect(status.phase.name).toBe("Muscular Development");
  });

  it("marks cycle complete after week 16", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-22")); // 16 weeks after start
    const status = getCurrentPhase("2026-04-01");
    expect(status.isComplete).toBe(true);
  });

  it("calculates progress percent", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-13")); // 6 weeks
    const status = getCurrentPhase("2026-04-01");
    expect(status.progressPercent).toBe(Math.round((7 / 16) * 100));
  });

  it("handles extension weeks", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-29")); // Week 5 normally = Phase 2
    // With 2 extension weeks, Phase 1 extends to week 6
    const status = getCurrentPhase("2026-04-01", 2);
    expect(status.phase.phase).toBe(1); // Still in Phase 1
    expect(status.totalWeeks).toBe(18);
  });

  it("identifies transitioning weeks", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-22")); // Week 4 = last week of Phase 1
    const status = getCurrentPhase("2026-04-01");
    expect(status.isTransitioning).toBe(true);
    expect(status.nextPhase).toBeDefined();
    expect(status.nextPhase!.name).toBe("Strength Endurance");
  });
});

describe("getPhaseAdjustedSets", () => {
  it("returns setsMax for compound exercises", () => {
    expect(getPhaseAdjustedSets(PHASE_CONFIGS[0], true)).toBe(3);
    expect(getPhaseAdjustedSets(PHASE_CONFIGS[2], true)).toBe(4);
  });

  it("returns setsMin for accessory exercises", () => {
    expect(getPhaseAdjustedSets(PHASE_CONFIGS[0], false)).toBe(2);
    expect(getPhaseAdjustedSets(PHASE_CONFIGS[1], false)).toBe(3);
  });
});

describe("getPhaseAdjustedReps", () => {
  it("returns repsMax for each phase", () => {
    expect(getPhaseAdjustedReps(PHASE_CONFIGS[0])).toBe(15);
    expect(getPhaseAdjustedReps(PHASE_CONFIGS[1])).toBe(12);
    expect(getPhaseAdjustedReps(PHASE_CONFIGS[2])).toBe(10);
  });
});

describe("shouldSuppressProgression", () => {
  it("suppresses in Phase 1", () => {
    expect(shouldSuppressProgression(PHASE_CONFIGS[0])).toBe(true);
  });

  it("allows in Phase 2 and 3", () => {
    expect(shouldSuppressProgression(PHASE_CONFIGS[1])).toBe(false);
    expect(shouldSuppressProgression(PHASE_CONFIGS[2])).toBe(false);
  });
});

describe("getTransitionMessage", () => {
  it("generates transition message between phases", () => {
    const msg = getTransitionMessage(PHASE_CONFIGS[0], PHASE_CONFIGS[1]);
    expect(msg).toContain("Phase 2");
    expect(msg).toContain("Strength Endurance");
    expect(msg).toContain("12-15");
    expect(msg).toContain("8-12");
    expect(msg).toContain("Progressive overload");
  });
});
