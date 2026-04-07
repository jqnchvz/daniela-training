import { z } from "zod";

// ── Session Sets ────────────────────────────────────────────────────────────

const sessionSetSchema = z.object({
  exerciseId: z.string().min(1),
  exerciseName: z.string().min(1),
  setNumber: z.number().int().min(1),
  weight: z.number().min(0),
  reps: z.number().int().min(0),
  rpe: z.number().min(0).max(10).nullable().optional(),
});

// ── Session ─────────────────────────────────────────────────────────────────

export const sessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable().optional(),
  planId: z.string().min(1),
  planName: z.string().min(1),
  date: z.string().min(1), // date string like "2024-01-15"
  startedAt: z.string().min(1), // ISO timestamp
  completedAt: z.string().min(1), // ISO timestamp
  durationMinutes: z.number().int().min(0),
  energyPre: z.number().int().min(1).max(10).nullable().optional(),
  energyPost: z.number().int().min(1).max(10).nullable().optional(),
  sleepScore: z.number().int().min(1).max(10).nullable().optional(),
  sorenessScore: z.number().int().min(1).max(10).nullable().optional(),
  sessionMode: z.string().optional(),
  notes: z.string().optional(),
  sets: z.array(sessionSetSchema).optional(),
});

// ── Check-in ────────────────────────────────────────────────────────────────

export const checkinSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid().nullable().optional(),
  date: z.string().min(1),
  energy: z.number().int().min(1).max(10),
  sleepQuality: z.number().int().min(1).max(10),
  sleepHours: z.number().min(0).max(24).nullable().optional(),
  mood: z.number().int().min(1).max(10),
  soreness: z.number().int().min(1).max(10),
  notes: z.string().optional(),
});

// ── Cycle State ─────────────────────────────────────────────────────────────

export const cycleSchema = z.object({
  userId: z.string().uuid().nullable().optional(),
  cycleStartDate: z.string().nullable().optional(),
  extensionWeeks: z.number().int().min(0).optional(),
  lastDeloadDate: z.string().nullable().optional(),
  completedSessions: z.number().int().min(0).optional(),
});

// ── Users ───────────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  action: z.literal("create"),
  name: z.string().min(1),
  avatarEmoji: z.string().optional(),
  pinHash: z.string().nullable().optional(),
});

export const verifyPinSchema = z.object({
  action: z.literal("verify-pin"),
  userId: z.string().uuid(),
  pin: z.string(),
});

export const userActionSchema = z.discriminatedUnion("action", [
  createUserSchema,
  verifyPinSchema,
]);
