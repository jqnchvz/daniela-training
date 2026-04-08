import { create } from "zustand";
import type { Locale } from "@/lib/i18n";

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

interface CyclePhaseState {
  enabled: boolean; // opt-in feature
  periodStartDates: string[]; // ISO date strings, most recent first
  defaultCycleLength: number;
  activeUserId: string | null;

  enable: () => void;
  disable: () => void;
  logPeriodStart: (date: string) => void;
  removePeriodStart: (date: string) => void;
  switchUser: (userId: string | null) => void;
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

const PER_USER_KEY_PREFIX = "cycle-phase-store";

function getUserKey(userId: string | null): string {
  return userId ? `${PER_USER_KEY_PREFIX}-${userId}` : PER_USER_KEY_PREFIX;
}

function loadUserData(userId: string | null): { enabled: boolean; periodStartDates: string[] } {
  try {
    const raw = localStorage.getItem(getUserKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: parsed.state?.enabled ?? false,
        periodStartDates: parsed.state?.periodStartDates ?? [],
      };
    }
  } catch { /* ignore */ }
  return { enabled: false, periodStartDates: [] };
}

function saveUserData(userId: string | null, state: CyclePhaseState) {
  const key = getUserKey(userId);
  const data = {
    state: {
      enabled: state.enabled,
      periodStartDates: state.periodStartDates,
      defaultCycleLength: state.defaultCycleLength,
      activeUserId: userId,
    },
    version: 0,
  };
  localStorage.setItem(key, JSON.stringify(data));
}

export const useCyclePhaseStore = create<CyclePhaseState>()(
  (set, get) => ({
      enabled: false,
      periodStartDates: [],
      defaultCycleLength: 28,
      activeUserId: null,

      enable: () => {
        set({ enabled: true });
        saveUserData(get().activeUserId, get());
      },
      disable: () => {
        set({ enabled: false, periodStartDates: [] });
        saveUserData(get().activeUserId, get());
      },
      logPeriodStart: (date: string) => {
        const existing = get().periodStartDates;
        if (existing.includes(date)) return;
        const updated = [date, ...existing].sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime(),
        );
        set({ periodStartDates: updated });
        saveUserData(get().activeUserId, { ...get(), periodStartDates: updated });
      },

      removePeriodStart: (date: string) => {
        const updated = get().periodStartDates.filter((d) => d !== date);
        set({ periodStartDates: updated });
        saveUserData(get().activeUserId, { ...get(), periodStartDates: updated });
      },

      switchUser: (userId: string | null) => {
        // Save current user's data before switching
        const current = get();
        if (current.activeUserId !== userId) {
          saveUserData(current.activeUserId, current);
        }
        // Load new user's data
        const userData = loadUserData(userId);
        set({
          activeUserId: userId,
          enabled: userData.enabled,
          periodStartDates: userData.periodStartDates,
        });
      },

      getCurrentPhase: () => {
        const { periodStartDates, enabled } = get();
        if (!enabled || periodStartDates.length === 0) return null;

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
