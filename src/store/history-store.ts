import { create } from "zustand";

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

export interface BodyMeasurement {
  id: string;
  userId?: string;
  date: string;
  waist: number | null;
  hip: number | null;
  thigh: number | null;
}

interface HistoryState {
  sessions: CompletedSession[];
  checkins: SavedCheckin[];
  measurements: BodyMeasurement[];
  loaded: boolean;

  /** Replace all data (called by hydrator after DB fetch) */
  hydrate: (data: { sessions?: CompletedSession[]; checkins?: SavedCheckin[] }) => void;

  addSession: (session: CompletedSession) => void;
  addCheckin: (checkin: SavedCheckin) => void;
  addMeasurement: (m: BodyMeasurement) => void;
  getLatestMeasurement: (userId?: string) => BodyMeasurement | null;
  getMeasurementsForUser: (userId?: string) => BodyMeasurement[];
  getSessionsByWeek: (userId?: string) => { thisWeek: number; total: number };
  getLatestCheckin: (userId?: string) => SavedCheckin | null;
  getCheckinForDate: (date: string) => SavedCheckin | null;
  getLastWeightForExercise: (exerciseId: string, userId?: string) => number | null;
  getSessionsForUser: (userId?: string) => CompletedSession[];
  getCheckinsForUser: (userId?: string) => SavedCheckin[];
}

export const useHistoryStore = create<HistoryState>()(
  (set, get) => ({
    sessions: [],
    checkins: [],
    measurements: [],
    loaded: false,

    hydrate: (data) =>
      set({
        sessions: data.sessions ?? get().sessions,
        checkins: data.checkins ?? get().checkins,
        loaded: true,
      }),

    addSession: (session) => {
      set((s) => ({ sessions: [session, ...s.sessions] }));
      // Fire-and-forget write to DB
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      }).catch(() => {});
    },

    addCheckin: (checkin) => {
      set((s) => {
        const filtered = s.checkins.filter((c) => c.date !== checkin.date);
        return { checkins: [checkin, ...filtered] };
      });
      fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkin),
      }).catch(() => {});
    },

    addMeasurement: (m) => {
      set((s) => ({ measurements: [m, ...s.measurements] }));
    },

    getLatestMeasurement: (userId) => {
      const measurements = userId
        ? get().measurements.filter((m) => !m.userId || m.userId === userId)
        : get().measurements;
      return measurements[0] ?? null;
    },

    getMeasurementsForUser: (userId) => {
      const all = userId
        ? get().measurements.filter((m) => !m.userId || m.userId === userId)
        : get().measurements;
      return [...all].reverse();
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
);
