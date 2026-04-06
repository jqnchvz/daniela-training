import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncCycleToDb } from "@/lib/db/sync";

interface CycleState {
  /** ISO date string when the training cycle started, or null if not started */
  cycleStartDate: string | null;
  /** Additional extension weeks added to the cycle */
  extensionWeeks: number;
  /** ISO date string of the last deload week */
  lastDeloadDate: string | null;
  /** Number of completed sessions */
  completedSessions: number;

  startCycle: () => void;
  incrementSessions: () => void;
  setLastDeload: (date: string) => void;
  extendPhase: (weeks: number) => void;
  resetCycle: () => void;
}

export const useCycleStore = create<CycleState>()(
  persist(
    (set) => ({
      cycleStartDate: null,
      extensionWeeks: 0,
      lastDeloadDate: null,
      completedSessions: 0,

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
    { name: "cycle-store" },
  ),
);

function syncCycleAfterUpdate() {
  // Read from store after set() has applied
  setTimeout(() => {
    const s = useCycleStore.getState();
    syncCycleToDb({
      cycleStartDate: s.cycleStartDate,
      extensionWeeks: s.extensionWeeks,
      lastDeloadDate: s.lastDeloadDate,
      completedSessions: s.completedSessions,
    });
  }, 0);
}
