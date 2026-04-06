import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompletedSession {
  id: string;
  planId: string;
  planName: string;
  date: string;
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  energyPre: number | null;
  energyPost: number | null;
  sleepScore: number | null;
  sorenessScore: number | null;
  sets: CompletedSet[];
  notes: string;
}

export interface CompletedSet {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number | null;
}

export interface SavedCheckin {
  id: string;
  date: string;
  energy: number;
  sleepQuality: number;
  sleepHours: number;
  mood: number;
  soreness: number;
  notes: string;
}

interface HistoryState {
  sessions: CompletedSession[];
  checkins: SavedCheckin[];

  addSession: (session: CompletedSession) => void;
  addCheckin: (checkin: SavedCheckin) => void;
  getSessionsByWeek: () => { thisWeek: number; total: number };
  getLatestCheckin: () => SavedCheckin | null;
  getCheckinForDate: (date: string) => SavedCheckin | null;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      sessions: [],
      checkins: [],

      addSession: (session) =>
        set((s) => ({ sessions: [session, ...s.sessions] })),

      addCheckin: (checkin) =>
        set((s) => {
          // Replace if same date exists
          const filtered = s.checkins.filter((c) => c.date !== checkin.date);
          return { checkins: [checkin, ...filtered] };
        }),

      getSessionsByWeek: () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const thisWeek = get().sessions.filter(
          (s) => new Date(s.date) >= startOfWeek,
        ).length;

        return { thisWeek, total: get().sessions.length };
      },

      getLatestCheckin: () => {
        const sorted = [...get().checkins].sort(
          (a, b) => b.date.localeCompare(a.date),
        );
        return sorted[0] ?? null;
      },

      getCheckinForDate: (date) =>
        get().checkins.find((c) => c.date === date) ?? null,
    }),
    { name: "history-store" },
  ),
);
