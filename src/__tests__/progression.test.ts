import { describe, it, expect, vi, afterEach } from "vitest";
import {
  suggestProgression,
  roundToNearest2_5,
  getDeloadStatus,
  applyDeload,
  calculateWeeklyVolumes,
  type SessionHistory,
} from "@/lib/progression";

describe("roundToNearest2_5", () => {
  it("rounds correctly", () => {
    expect(roundToNearest2_5(10.5)).toBe(10);
    expect(roundToNearest2_5(11.25)).toBe(12.5);
    expect(roundToNearest2_5(13.1)).toBe(12.5);
    expect(roundToNearest2_5(15)).toBe(15);
    expect(roundToNearest2_5(0)).toBe(0);
  });
});

describe("suggestProgression", () => {
  const makeHistory = (
    overrides: Partial<SessionHistory> = {},
    count = 2,
  ): SessionHistory[] =>
    Array.from({ length: count }, (_, i) => ({
      date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      weight: 10,
      reps: 10,
      targetReps: 10,
      rpe: 6,
      setsCompleted: 3,
      targetSets: 3,
      ...overrides,
    }));

  it("returns maintain with no history", () => {
    const result = suggestProgression([], null);
    expect(result.type).toBe("maintain");
  });

  it("returns maintain with only 1 session", () => {
    const result = suggestProgression(makeHistory({}, 1), null);
    expect(result.type).toBe("maintain");
  });

  it("suggests increase when 2 good sessions and 14+ days since last change", () => {
    const history = makeHistory();
    const oldChangeDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const result = suggestProgression(history, oldChangeDate);
    expect(result.type).toBe("increase");
    expect(result.suggestedWeight).toBe(10); // 10 * 1.05 = 10.5, rounds to 10
  });

  it("suggests increase with correct rounding for heavier weights", () => {
    // 20 * 1.05 = 21 → roundToNearest2_5(21) = 20 (8.4 rounds to 8)
    const history = makeHistory({ weight: 20 });
    const result = suggestProgression(history, null);
    expect(result.type).toBe("increase");
    expect(result.suggestedWeight).toBe(20);

    // 25 * 1.05 = 26.25 → roundToNearest2_5(26.25) = 27.5
    const history2 = makeHistory({ weight: 25 });
    const result2 = suggestProgression(history2, null);
    expect(result2.suggestedWeight).toBe(27.5);
  });

  it("returns maintain if reps not completed", () => {
    const history = makeHistory({ reps: 8, targetReps: 10 });
    const result = suggestProgression(history, null);
    expect(result.type).toBe("maintain");
  });

  it("returns maintain if RPE too high", () => {
    const history = makeHistory({ rpe: 9 });
    const result = suggestProgression(history, null);
    expect(result.type).toBe("maintain");
    expect(result.message).toContain("RPE");
  });

  it("returns maintain if weight changed less than 14 days ago", () => {
    const history = makeHistory();
    const recentChange = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const result = suggestProgression(history, recentChange);
    expect(result.type).toBe("maintain");
    expect(result.message).toContain("days ago");
  });

  it("detects stall: same weight for 4+ sessions, not completing reps", () => {
    const history = makeHistory({ reps: 8, targetReps: 10 }, 4);
    const result = suggestProgression(history, null);
    expect(result.type).toBe("stall");
    expect(result.message).toContain("Stalling");
  });

  it("does not detect stall if completing reps", () => {
    const history = makeHistory({ reps: 10, targetReps: 10 }, 4);
    const result = suggestProgression(history, null);
    expect(result.type).not.toBe("stall");
  });

  it("allows increase with null RPE (no RPE data)", () => {
    const history = makeHistory({ rpe: null });
    const result = suggestProgression(history, null);
    expect(result.type).toBe("increase");
  });
});

describe("getDeloadStatus", () => {
  afterEach(() => vi.useRealTimers());

  it("returns no deload in early weeks", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14")); // 2 weeks after start
    const status = getDeloadStatus("2026-04-01", null);
    expect(status.shouldDeload).toBe(false);
    expect(status.isDeloadWeek).toBe(false);
    expect(status.message).toBeNull();
    vi.useRealTimers();
  });

  it("warns at week 3", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17")); // ~2.3 weeks after start
    const status = getDeloadStatus("2026-04-01", null);
    expect(status.weekNumber).toBe(3);
    expect(status.shouldDeload).toBe(true);
    expect(status.message).toContain("Deload week coming up");
    vi.useRealTimers();
  });

  it("marks deload week at week 4", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24")); // ~3.3 weeks
    const status = getDeloadStatus("2026-04-01", null);
    expect(status.isDeloadWeek).toBe(true);
    expect(status.message).toContain("DELOAD WEEK");
    vi.useRealTimers();
  });

  it("resets counter after deload", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-17")); // 1 week after deload
    const status = getDeloadStatus("2026-04-01", "2026-05-10");
    expect(status.weekNumber).toBe(2); // 7 days = start of week 2
    expect(status.shouldDeload).toBe(false);
    vi.useRealTimers();
  });

  it("suggests early deload when energy red flag is active", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08")); // week 2
    const status = getDeloadStatus("2026-04-01", null, {
      hasEnergyFlag: true,
      hasMoodFlag: false,
    });
    expect(status.earlyDeloadSuggested).toBe(true);
    expect(status.message).toContain("declining energy or mood");
    vi.useRealTimers();
  });

  it("suggests early deload when mood red flag is active", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08")); // week 2
    const status = getDeloadStatus("2026-04-01", null, {
      hasEnergyFlag: false,
      hasMoodFlag: true,
    });
    expect(status.earlyDeloadSuggested).toBe(true);
    vi.useRealTimers();
  });

  it("does not suggest early deload without red flags", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08")); // week 2
    const status = getDeloadStatus("2026-04-01", null, {
      hasEnergyFlag: false,
      hasMoodFlag: false,
    });
    expect(status.earlyDeloadSuggested).toBe(false);
    expect(status.message).toBeNull();
    vi.useRealTimers();
  });

  it("does not suggest early deload at week 3+ (already approaching scheduled deload)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17")); // week 3
    const status = getDeloadStatus("2026-04-01", null, {
      hasEnergyFlag: true,
      hasMoodFlag: true,
    });
    // Week 3 already shows "deload coming up" — no need for early suggestion
    expect(status.earlyDeloadSuggested).toBe(false);
    expect(status.shouldDeload).toBe(true);
    vi.useRealTimers();
  });
});

describe("applyDeload", () => {
  it("halves sets and applies 60% weight multiplier", () => {
    expect(applyDeload(3)).toEqual({ sets: 2, weightMultiplier: 0.6 });
    expect(applyDeload(4)).toEqual({ sets: 2, weightMultiplier: 0.6 });
  });

  it("minimum 1 set", () => {
    expect(applyDeload(2)).toEqual({ sets: 1, weightMultiplier: 0.6 });
    expect(applyDeload(1)).toEqual({ sets: 1, weightMultiplier: 0.6 });
  });
});

describe("calculateWeeklyVolumes", () => {
  it("returns empty for no data", () => {
    expect(calculateWeeklyVolumes([])).toEqual([]);
  });

  it("calculates volume correctly", () => {
    const logs = [
      { date: "2026-04-06", weight: 10, reps: 10 }, // Monday
      { date: "2026-04-06", weight: 10, reps: 10 }, // Same day
    ];
    const result = calculateWeeklyVolumes(logs);
    expect(result).toHaveLength(1);
    expect(result[0].volume).toBe(200); // 10*10 + 10*10
  });

  it("detects overreaching warning (>10% increase)", () => {
    const logs = [
      { date: "2026-03-30", weight: 10, reps: 10 }, // Week 1: 100
      { date: "2026-04-06", weight: 10, reps: 12 }, // Week 2: 120 (20% increase)
    ];
    const result = calculateWeeklyVolumes(logs);
    expect(result).toHaveLength(2);
    expect(result[1].overreaching).toBe("warning");
  });

  it("detects overreaching with lower threshold when wellness flags active", () => {
    const logs = [
      { date: "2026-03-30", weight: 10, reps: 10 }, // Week 1: 100
      { date: "2026-04-06", weight: 10, reps: 11 }, // Week 2: 110 (10% — normally fine, but 8% threshold with flags)
    ];
    const result = calculateWeeklyVolumes(logs, { hasEnergyFlag: true });
    expect(result[1].overreaching).toBe("warning");
  });

  it("detects caution for 3 consecutive weeks of increase", () => {
    const logs = [
      { date: "2026-03-23", weight: 10, reps: 10 }, // Week 1: 100
      { date: "2026-03-30", weight: 10, reps: 10.5 }, // Week 2: 105
      { date: "2026-04-06", weight: 10, reps: 10.8 }, // Week 3: 108 (each <10%, but 3 consecutive)
    ];
    const result = calculateWeeklyVolumes(logs);
    expect(result[2].overreaching).toBe("caution");
  });

  it("limits to last 8 weeks", () => {
    const logs = Array.from({ length: 10 }, (_, i) => ({
      date: new Date(2026, 0, 5 + i * 7).toISOString().split("T")[0],
      weight: 10,
      reps: 10,
    }));
    const result = calculateWeeklyVolumes(logs);
    expect(result.length).toBeLessThanOrEqual(8);
  });
});
