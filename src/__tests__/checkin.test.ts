import { describe, it, expect, vi, afterEach } from "vitest";
import {
  detectRedFlags,
  calculateStreak,
  rollingAverage,
  type CheckinData,
} from "@/lib/checkin";

function makeCheckin(
  daysAgo: number,
  overrides: Partial<CheckinData> = {},
): CheckinData {
  const date = new Date(Date.now() - daysAgo * 86400000)
    .toISOString()
    .split("T")[0];
  return {
    date,
    energy: 7,
    sleepQuality: 7,
    sleepHours: 7.5,
    mood: 7,
    soreness: 3,
    notes: "",
    ...overrides,
  };
}

describe("detectRedFlags", () => {
  it("returns no flags with insufficient data", () => {
    const checkins = [makeCheckin(0), makeCheckin(1)];
    const result = detectRedFlags(checkins);
    expect(result.hasEnergyFlag).toBe(false);
    expect(result.hasMoodFlag).toBe(false);
  });

  it("detects energy red flag when 7-day avg drops 2+ below 30-day avg", () => {
    // 30 days of data: first 23 days at energy 8, last 7 at energy 4
    const checkins = [
      ...Array.from({ length: 7 }, (_, i) =>
        makeCheckin(i, { energy: 4 }),
      ),
      ...Array.from({ length: 23 }, (_, i) =>
        makeCheckin(i + 7, { energy: 8 }),
      ),
    ];
    const result = detectRedFlags(checkins);
    expect(result.hasEnergyFlag).toBe(true);
    expect(result.energyAvg7).toBeLessThan(result.energyAvg30);
  });

  it("detects mood red flag", () => {
    const checkins = [
      ...Array.from({ length: 7 }, (_, i) =>
        makeCheckin(i, { mood: 3 }),
      ),
      ...Array.from({ length: 23 }, (_, i) =>
        makeCheckin(i + 7, { mood: 8 }),
      ),
    ];
    const result = detectRedFlags(checkins);
    expect(result.hasMoodFlag).toBe(true);
  });

  it("no flag when averages are close", () => {
    const checkins = Array.from({ length: 30 }, (_, i) =>
      makeCheckin(i, { energy: 7, mood: 7 }),
    );
    const result = detectRedFlags(checkins);
    expect(result.hasEnergyFlag).toBe(false);
    expect(result.hasMoodFlag).toBe(false);
  });
});

describe("calculateStreak", () => {
  afterEach(() => vi.useRealTimers());

  it("returns 0 for empty dates", () => {
    expect(calculateStreak([])).toBe(0);
  });

  it("returns 0 if no check-in today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-05"));
    expect(calculateStreak(["2026-04-04", "2026-04-03"])).toBe(0);
  });

  it("returns 1 for only today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-05"));
    expect(calculateStreak(["2026-04-05"])).toBe(1);
  });

  it("counts consecutive days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-05"));
    const dates = ["2026-04-05", "2026-04-04", "2026-04-03", "2026-04-02"];
    expect(calculateStreak(dates)).toBe(4);
  });

  it("breaks on gaps", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-05"));
    const dates = ["2026-04-05", "2026-04-04", "2026-04-02"]; // gap on Apr 3
    expect(calculateStreak(dates)).toBe(2);
  });
});

describe("rollingAverage", () => {
  it("returns original values with window 1", () => {
    expect(rollingAverage([1, 2, 3, 4], 1)).toEqual([1, 2, 3, 4]);
  });

  it("smooths with window 3", () => {
    const result = rollingAverage([2, 4, 6, 8], 3);
    expect(result[0]).toBe(2); // only 1 value
    expect(result[1]).toBe(3); // avg(2,4)
    expect(result[2]).toBe(4); // avg(2,4,6)
    expect(result[3]).toBe(6); // avg(4,6,8)
  });

  it("handles empty array", () => {
    expect(rollingAverage([], 3)).toEqual([]);
  });
});
