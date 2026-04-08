import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/i18n";

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

interface CyclePhaseState {
  enabled: boolean; // opt-in feature
  periodStartDates: string[]; // ISO date strings, most recent first
  defaultCycleLength: number;

  enable: () => void;
  disable: () => void;
  logPeriodStart: (date: string) => void;
  removePeriodStart: (date: string) => void;
  getCurrentPhase: () => {
    phase: CyclePhase;
    dayInCycle: number;
    cycleLength: number;
  } | null;
  getEstimatedCycleLength: () => number;
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000;
  const dateA = new Date(a + "T00:00:00");
  const dateB = new Date(b + "T00:00:00");
  return Math.round(Math.abs(dateA.getTime() - dateB.getTime()) / msPerDay);
}

function getPhaseForDay(day: number): CyclePhase {
  if (day <= 5) return "menstrual";
  if (day <= 13) return "follicular";
  if (day <= 16) return "ovulation";
  return "luteal";
}

export const useCyclePhaseStore = create<CyclePhaseState>()(
  persist(
    (set, get) => ({
      enabled: false,
      periodStartDates: [],
      defaultCycleLength: 28,

      enable: () => set({ enabled: true }),
      disable: () => set({ enabled: false, periodStartDates: [] }),
      logPeriodStart: (date: string) => {
        const existing = get().periodStartDates;
        if (existing.includes(date)) return;
        const updated = [date, ...existing].sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime(),
        );
        set({ periodStartDates: updated });
      },

      removePeriodStart: (date: string) => {
        set({
          periodStartDates: get().periodStartDates.filter((d) => d !== date),
        });
      },

      getCurrentPhase: () => {
        const { periodStartDates } = get();
        if (periodStartDates.length === 0) return null;

        const latest = periodStartDates[0];
        const today = new Date().toISOString().split("T")[0];
        const dayInCycle = daysBetween(latest, today) + 1;
        const cycleLength = get().getEstimatedCycleLength();

        if (dayInCycle > cycleLength) return null;

        return {
          phase: getPhaseForDay(dayInCycle),
          dayInCycle,
          cycleLength,
        };
      },

      getEstimatedCycleLength: () => {
        const { periodStartDates, defaultCycleLength } = get();
        if (periodStartDates.length < 2) return defaultCycleLength;

        // periodStartDates is sorted most recent first
        const gaps: number[] = [];
        for (let i = 0; i < periodStartDates.length - 1; i++) {
          gaps.push(daysBetween(periodStartDates[i], periodStartDates[i + 1]));
        }

        const avg = Math.round(
          gaps.reduce((sum, g) => sum + g, 0) / gaps.length,
        );
        return Math.max(21, Math.min(40, avg));
      },
    }),
    { name: "cycle-phase-store" },
  ),
);

const phaseLabels: Record<CyclePhase, Record<Locale, string>> = {
  menstrual: { en: "Menstrual", es: "Menstrual" },
  follicular: { en: "Follicular", es: "Folicular" },
  ovulation: { en: "Ovulation", es: "Ovulación" },
  luteal: { en: "Luteal", es: "Lútea" },
};

export function getCyclePhaseLabel(
  phase: CyclePhase,
  locale: Locale,
): string {
  return phaseLabels[phase][locale];
}
