/**
 * Typed response shapes that match what each API route actually returns.
 * These are NOT raw DB models — they reflect the JSON sent over the wire.
 */

// ── GET /api/sessions ──────────────────────────────────────────────────────

export interface SessionSetResponse {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number | null;
}

export interface SessionResponse {
  id: string;
  userId: string | null;
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
  sessionMode: string;
  notes: string;
  createdAt: string;
  sets: SessionSetResponse[];
}

// ── GET /api/checkins ──────────────────────────────────────────────────────

export interface CheckinResponse {
  id: string;
  userId: string | null;
  date: string;
  energy: number;
  sleepQuality: number;
  sleepHours: number | null;
  mood: number;
  soreness: number;
  notes: string;
  createdAt: string;
}

// ── GET /api/cycle ─────────────────────────────────────────────────────────

export interface CycleResponse {
  id: string;
  userId: string | null;
  cycleStartDate: string | null;
  extensionWeeks: number;
  lastDeloadDate: string | null;
  completedSessions: number;
  updatedAt: string;
}

// ── GET /api/users ─────────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  name: string;
  avatarEmoji: string;
  hasPin: boolean;
}
