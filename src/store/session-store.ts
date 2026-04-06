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

export type SessionMode = "full" | "lite";

interface SessionState {
  planId: string | null;
  phase: SessionPhase;
  sessionMode: SessionMode;
  energyPre: number | null;
  energyPost: number | null;
  currentExerciseIndex: number;
  completedSets: SetLog[];
  warmupChecklist: boolean[];
  cooldownChecklist: boolean[];
  startedAt: string | null;
  workingStartedAt: string | null;
  notes: string;
  restTimerEnd: number | null;
  restTimerNextInfo: string | null;

  startSession: (planId: string) => void;
  setPhase: (phase: SessionPhase) => void;
  setSessionMode: (mode: SessionMode) => void;
  setEnergyPre: (energy: number) => void;
  setEnergyPost: (energy: number) => void;
  logSet: (set: SetLog) => void;
  nextExercise: () => void;
  toggleWarmup: (index: number) => void;
  toggleCooldown: (index: number) => void;
  updateLastSetRpe: (rpe: number) => void;
  setRestTimer: (endTime: number | null, nextInfo?: string | null) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

const initialState = {
  planId: null,
  phase: "pre-check" as SessionPhase,
  sessionMode: "full" as SessionMode,
  energyPre: null,
  energyPost: null,
  currentExerciseIndex: 0,
  completedSets: [],
  warmupChecklist: [false, false, false],
  cooldownChecklist: [false, false, false],
  startedAt: null,
  workingStartedAt: null,
  notes: "",
  restTimerEnd: null,
  restTimerNextInfo: null,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...initialState,

      startSession: (planId) =>
        set({ ...initialState, planId, startedAt: new Date().toISOString() }),

      setPhase: (phase) =>
        set((state) => ({
          phase,
          // Record when warmup starts as the effective session start time
          workingStartedAt:
            phase === "warmup" && !state.workingStartedAt
              ? new Date().toISOString()
              : state.workingStartedAt,
        })),
      setSessionMode: (mode) => set({ sessionMode: mode }),
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

      updateLastSetRpe: (rpe) =>
        set((state) => {
          const sets = [...state.completedSets];
          if (sets.length > 0) {
            sets[sets.length - 1] = { ...sets[sets.length - 1], rpe };
          }
          return { completedSets: sets };
        }),

      setRestTimer: (endTime, nextInfo) => set({ restTimerEnd: endTime, restTimerNextInfo: nextInfo ?? null }),
      setNotes: (notes) => set({ notes }),
      reset: () => set(initialState),
    }),
    { name: "session-store" },
  ),
);
