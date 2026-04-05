import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SessionPhase = "pre-check" | "warmup" | "working" | "cooldown" | "summary";

interface SetLog {
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number | null;
  completed: boolean;
}

interface SessionState {
  planId: string | null;
  phase: SessionPhase;
  energyPre: number | null;
  energyPost: number | null;
  currentExerciseIndex: number;
  completedSets: SetLog[];
  warmupChecklist: boolean[];
  cooldownChecklist: boolean[];
  startedAt: string | null;
  notes: string;
  restTimerEnd: number | null;

  startSession: (planId: string) => void;
  setPhase: (phase: SessionPhase) => void;
  setEnergyPre: (energy: number) => void;
  setEnergyPost: (energy: number) => void;
  logSet: (set: SetLog) => void;
  nextExercise: () => void;
  toggleWarmup: (index: number) => void;
  toggleCooldown: (index: number) => void;
  setRestTimer: (endTime: number | null) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

const initialState = {
  planId: null,
  phase: "pre-check" as SessionPhase,
  energyPre: null,
  energyPost: null,
  currentExerciseIndex: 0,
  completedSets: [],
  warmupChecklist: [false, false, false],
  cooldownChecklist: [false, false, false],
  startedAt: null,
  notes: "",
  restTimerEnd: null,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...initialState,

      startSession: (planId) =>
        set({ ...initialState, planId, startedAt: new Date().toISOString() }),

      setPhase: (phase) => set({ phase }),
      setEnergyPre: (energy) => set({ energyPre: energy }),
      setEnergyPost: (energy) => set({ energyPost: energy }),

      logSet: (newSet) =>
        set((state) => ({ completedSets: [...state.completedSets, newSet] })),

      nextExercise: () =>
        set((state) => ({
          currentExerciseIndex: state.currentExerciseIndex + 1,
        })),

      toggleWarmup: (index) =>
        set((state) => {
          const list = [...state.warmupChecklist];
          list[index] = !list[index];
          return { warmupChecklist: list };
        }),

      toggleCooldown: (index) =>
        set((state) => {
          const list = [...state.cooldownChecklist];
          list[index] = !list[index];
          return { cooldownChecklist: list };
        }),

      setRestTimer: (endTime) => set({ restTimerEnd: endTime }),
      setNotes: (notes) => set({ notes }),
      reset: () => set(initialState),
    }),
    { name: "session-store" },
  ),
);
