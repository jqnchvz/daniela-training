import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncSessionToDb, syncCheckinToDb } from "@/lib/db/sync";

export interface CompletedSession {
  id: string;
  userId?: string;
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
  userId?: string;
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
  getSessionsByWeek: (userId?: string) => { thisWeek: number; total: number };
  getLatestCheckin: (userId?: string) => SavedCheckin | null;
  getCheckinForDate: (date: string) => SavedCheckin | null;
  getLastWeightForExercise: (exerciseId: string, userId?: string) => number | null;
  getSessionsForUser: (userId?: string) => CompletedSession[];
  getCheckinsForUser: (userId?: string) => SavedCheckin[];
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      sessions: [],
      checkins: [],

      addSession: (session) => {
        set((s) => ({ sessions: [session, ...s.sessions] }));
        syncSessionToDb(session);
      },

      addCheckin: (checkin) => {
        set((s) => {
          const filtered = s.checkins.filter((c) => c.date !== checkin.date);
          return { checkins: [checkin, ...filtered] };
        });
        syncCheckinToDb(checkin);
      },

      getSessionsForUser: (userId) => {
        if (!userId) return get().sessions;
        return get().sessions.filter((s) => !s.userId || s.userId === userId);
      },

      getCheckinsForUser: (userId) => {
        if (!userId) return get().checkins;
        return get().checkins.filter((c) => !c.userId || c.userId === userId);
      },

      getSessionsByWeek: (userId) => {
        const now = new Date();
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const sessions = userId
          ? get().sessions.filter((s) => !s.userId || s.userId === userId)
          : get().sessions;

        const thisWeek = sessions.filter(
          (s) => new Date(s.date) >= startOfWeek,
        ).length;

        return { thisWeek, total: sessions.length };
      },

      getLatestCheckin: (userId) => {
        const checkins = userId
          ? get().checkins.filter((c) => !c.userId || c.userId === userId)
          : get().checkins;
        const sorted = [...checkins].sort(
          (a, b) => b.date.localeCompare(a.date),
        );
        return sorted[0] ?? null;
      },

      getCheckinForDate: (date) =>
        get().checkins.find((c) => c.date === date) ?? null,

      getLastWeightForExercise: (exerciseId, userId) => {
        const sessions = userId
          ? get().sessions.filter((s) => !s.userId || s.userId === userId)
          : get().sessions;
        for (const session of sessions) {
          const sets = session.sets.filter(
            (s) => s.exerciseId === exerciseId && s.weight > 0,
          );
          if (sets.length > 0) {
            return Math.max(...sets.map((s) => s.weight));
          }
        }
        return null;
      },
    }),
    { name: "history-store" },
  ),
);
