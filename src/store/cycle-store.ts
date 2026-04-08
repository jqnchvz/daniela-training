import { create } from "zustand";
import { enqueueWrite } from "@/lib/write-queue";

interface CycleState {
  cycleStartDate: string | null;
  extensionWeeks: number;
  lastDeloadDate: string | null;
  completedSessions: number;
  loaded: boolean;

  hydrate: (data: Partial<Pick<CycleState, "cycleStartDate" | "extensionWeeks" | "lastDeloadDate" | "completedSessions">>) => void;
  startCycle: () => void;
  incrementSessions: () => void;
  setLastDeload: (date: string) => void;
  extendPhase: (weeks: number) => void;
  resetCycle: () => void;
}

export const useCycleStore = create<CycleState>()(
  (set, get) => ({
    cycleStartDate: null,
    extensionWeeks: 0,
    lastDeloadDate: null,
    completedSessions: 0,
    loaded: false,

    hydrate: (data) =>
      set({
        cycleStartDate: data.cycleStartDate ?? null,
        extensionWeeks: data.extensionWeeks ?? 0,
        lastDeloadDate: data.lastDeloadDate ?? null,
        completedSessions: data.completedSessions ?? 0,
        loaded: true,
      }),

    startCycle: () => {
      set({
        cycleStartDate: new Date().toISOString().split("T")[0],
        extensionWeeks: 0,
        lastDeloadDate: null,
        completedSessions: 0,
      });
      syncCycleAfterUpdate();
    },

    incrementSessions: () => {
      set((s) => ({ completedSessions: s.completedSessions + 1 }));
      syncCycleAfterUpdate();
    },

    setLastDeload: (date) => {
      set({ lastDeloadDate: date });
      syncCycleAfterUpdate();
    },

    extendPhase: (weeks) => {
      set((s) => ({ extensionWeeks: s.extensionWeeks + weeks }));
      syncCycleAfterUpdate();
    },

    resetCycle: () => {
      set({
        cycleStartDate: null,
        extensionWeeks: 0,
        lastDeloadDate: null,
        completedSessions: 0,
      });
      syncCycleAfterUpdate();
    },
  }),
);

function syncCycleAfterUpdate() {
  // Capture userId NOW, before setTimeout fires
  const { useAuthStore } = require("@/store/auth-store");
  const userId = useAuthStore.getState().activeUserId;
  setTimeout(() => {
    const s = useCycleStore.getState();
    enqueueWrite("/api/cycle", {
      userId: userId ?? undefined,
      cycleStartDate: s.cycleStartDate,
      extensionWeeks: s.extensionWeeks,
      lastDeloadDate: s.lastDeloadDate,
      completedSessions: s.completedSessions,
    }, userId ?? undefined);
  }, 0);
}
