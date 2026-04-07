import { describe, it, expect } from "vitest";
import {
  sessionSchema,
  checkinSchema,
  cycleSchema,
  createUserSchema,
  verifyPinSchema,
  userActionSchema,
} from "@/lib/validations";

// ── Helpers ─────────────────────────────────────────────────────────────────

function validSession() {
  return {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    userId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    planId: "upper-a",
    planName: "Upper A",
    date: "2026-04-07",
    startedAt: "2026-04-07T10:00:00Z",
    completedAt: "2026-04-07T11:00:00Z",
    durationMinutes: 60,
    energyPre: 7,
    energyPost: 8,
    sleepScore: 6,
    sorenessScore: 3,
    sessionMode: "full",
    notes: "Felt great",
    sets: [
      {
        exerciseId: "bench-press",
        exerciseName: "Bench Press",
        setNumber: 1,
        weight: 80,
        reps: 8,
        rpe: 7.5,
      },
    ],
  };
}

function validCheckin() {
  return {
    id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    userId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    date: "2026-04-07",
    energy: 7,
    sleepQuality: 8,
    sleepHours: 7.5,
    mood: 6,
    soreness: 3,
    notes: "Good day",
  };
}

// ── Session Schema ──────────────────────────────────────────────────────────

describe("sessionSchema", () => {
  it("accepts a valid session body", () => {
    const result = sessionSchema.safeParse(validSession());
    expect(result.success).toBe(true);
  });

  it("accepts a session with nullable optional fields omitted", () => {
    const { energyPre, energyPost, sleepScore, sorenessScore, sets, notes, ...minimal } =
      validSession();
    const result = sessionSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("fails when required fields are missing", () => {
    const result = sessionSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = Object.keys(result.error.flatten().fieldErrors);
      expect(fields).toContain("id");
      expect(fields).toContain("planId");
      expect(fields).toContain("date");
    }
  });

  it("fails when id is not a valid UUID", () => {
    const result = sessionSchema.safeParse({ ...validSession(), id: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("fails when durationMinutes is a string", () => {
    const result = sessionSchema.safeParse({
      ...validSession(),
      durationMinutes: "sixty",
    });
    expect(result.success).toBe(false);
  });

  it("fails when energyPre is out of range", () => {
    const result = sessionSchema.safeParse({ ...validSession(), energyPre: 11 });
    expect(result.success).toBe(false);
  });

  it("fails when a set has invalid data", () => {
    const result = sessionSchema.safeParse({
      ...validSession(),
      sets: [{ exerciseId: "", exerciseName: "Bench", setNumber: 0, weight: -1, reps: 5 }],
    });
    expect(result.success).toBe(false);
  });
});

// ── Checkin Schema ──────────────────────────────────────────────────────────

describe("checkinSchema", () => {
  it("accepts a valid checkin body", () => {
    const result = checkinSchema.safeParse(validCheckin());
    expect(result.success).toBe(true);
  });

  it("fails when required fields are missing", () => {
    const result = checkinSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = Object.keys(result.error.flatten().fieldErrors);
      expect(fields).toContain("date");
      expect(fields).toContain("energy");
      expect(fields).toContain("mood");
    }
  });

  it("fails when energy is out of range", () => {
    const result = checkinSchema.safeParse({ ...validCheckin(), energy: 0 });
    expect(result.success).toBe(false);
  });

  it("fails when sleepHours exceeds 24", () => {
    const result = checkinSchema.safeParse({ ...validCheckin(), sleepHours: 25 });
    expect(result.success).toBe(false);
  });

  it("fails when mood is a string", () => {
    const result = checkinSchema.safeParse({ ...validCheckin(), mood: "happy" });
    expect(result.success).toBe(false);
  });
});

// ── Cycle Schema ────────────────────────────────────────────────────────────

describe("cycleSchema", () => {
  it("accepts a valid cycle body", () => {
    const result = cycleSchema.safeParse({
      userId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      cycleStartDate: "2026-03-01",
      extensionWeeks: 1,
      lastDeloadDate: null,
      completedSessions: 12,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty body (all optional)", () => {
    const result = cycleSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("fails when userId is not a UUID", () => {
    const result = cycleSchema.safeParse({ userId: "bad" });
    expect(result.success).toBe(false);
  });
});

// ── User Schemas ────────────────────────────────────────────────────────────

describe("createUserSchema", () => {
  it("accepts a valid create body", () => {
    const result = createUserSchema.safeParse({
      action: "create",
      name: "Daniela",
      avatarEmoji: "🏋️",
    });
    expect(result.success).toBe(true);
  });

  it("fails when name is missing", () => {
    const result = createUserSchema.safeParse({ action: "create" });
    expect(result.success).toBe(false);
  });
});

describe("verifyPinSchema", () => {
  it("accepts a valid verify-pin body", () => {
    const result = verifyPinSchema.safeParse({
      action: "verify-pin",
      userId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      pin: "1234",
    });
    expect(result.success).toBe(true);
  });

  it("fails when pin is missing", () => {
    const result = verifyPinSchema.safeParse({
      action: "verify-pin",
      userId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    });
    expect(result.success).toBe(false);
  });
});

describe("userActionSchema (discriminated union)", () => {
  it("rejects unknown actions", () => {
    const result = userActionSchema.safeParse({ action: "delete" });
    expect(result.success).toBe(false);
  });
});
