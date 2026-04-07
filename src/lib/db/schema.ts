import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
  integer,
  real,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Users ──────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  avatarEmoji: text("avatar_emoji").notNull().default("💪"),
  pinHash: text("pin_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  checkins: many(checkins),
}));

// ── Sessions ────────────────────────────────────────────────────────────────

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull(),
  planName: text("plan_name").notNull(),
  date: date("date").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  energyPre: integer("energy_pre"),
  energyPost: integer("energy_post"),
  sleepScore: integer("sleep_score"),
  sorenessScore: integer("soreness_score"),
  sessionMode: text("session_mode").notNull().default("full"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessionsRelations = relations(sessions, ({ many, one }) => ({
  sets: many(sessionSets),
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// ── Session Sets ────────────────────────────────────────────────────────────

export const sessionSets = pgTable("session_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id").notNull(),
  exerciseName: text("exercise_name").notNull(),
  setNumber: integer("set_number").notNull(),
  weight: real("weight").notNull(),
  reps: integer("reps").notNull(),
  rpe: real("rpe"),
});

export const sessionSetsRelations = relations(sessionSets, ({ one }) => ({
  session: one(sessions, {
    fields: [sessionSets.sessionId],
    references: [sessions.id],
  }),
}));

// ── Check-ins ───────────────────────────────────────────────────────────────

export const checkins = pgTable("checkins", {
  id: uuid("id").primaryKey().notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  energy: integer("energy").notNull(),
  sleepQuality: integer("sleep_quality").notNull(),
  sleepHours: real("sleep_hours"),
  mood: integer("mood").notNull(),
  soreness: integer("soreness").notNull(),
  notes: text("notes").notNull().default(""),
  walkMinutes: integer("walk_minutes"),
  didStretching: boolean("did_stretching"),
  didYoga: boolean("did_yoga"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const checkinsRelations = relations(checkins, ({ one }) => ({
  user: one(users, { fields: [checkins.userId], references: [users.id] }),
}));

// ── Cycle State ─────────────────────────────────────────────────────────────

export const cycleState = pgTable("cycle_state", {
  id: uuid("id").primaryKey().notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  cycleStartDate: date("cycle_start_date"),
  extensionWeeks: integer("extension_weeks").notNull().default(0),
  lastDeloadDate: date("last_deload_date"),
  completedSessions: integer("completed_sessions").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cycleStateRelations = relations(cycleState, ({ one }) => ({
  user: one(users, { fields: [cycleState.userId], references: [users.id] }),
}));

// ── Exercise Cache (from ExerciseDB API) ────────────────────────────────────

export const exerciseCache = pgTable("exercise_cache", {
  exerciseId: text("exercise_id").primaryKey(),
  exercisedbId: text("exercisedb_id"),
  name: text("name").notNull(),
  gifUrl: text("gif_url"),
  description: text("description"),
  instructions: text("instructions").array(),
  targetMuscles: text("target_muscles").array(),
  bodyParts: text("body_parts").array(),
  equipments: text("equipments").array(),
  secondaryMuscles: text("secondary_muscles").array(),
  syncedAt: timestamp("synced_at", { withTimezone: true }).notNull().defaultNow(),
});
