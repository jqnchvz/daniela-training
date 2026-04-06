import { describe, it, expect } from "vitest";
import * as schema from "@/lib/db/schema";

describe("Database schema", () => {
  it("exports all required tables", () => {
    expect(schema.sessions).toBeDefined();
    expect(schema.sessionSets).toBeDefined();
    expect(schema.checkins).toBeDefined();
    expect(schema.cycleState).toBeDefined();
  });

  it("sessions table has expected columns", () => {
    const cols = Object.keys(schema.sessions);
    expect(cols).toContain("id");
    expect(cols).toContain("planId");
    expect(cols).toContain("date");
    expect(cols).toContain("startedAt");
    expect(cols).toContain("completedAt");
    expect(cols).toContain("energyPre");
    expect(cols).toContain("sessionMode");
  });

  it("sessionSets table has expected columns", () => {
    const cols = Object.keys(schema.sessionSets);
    expect(cols).toContain("sessionId");
    expect(cols).toContain("exerciseId");
    expect(cols).toContain("weight");
    expect(cols).toContain("reps");
    expect(cols).toContain("rpe");
  });

  it("checkins table has expected columns", () => {
    const cols = Object.keys(schema.checkins);
    expect(cols).toContain("date");
    expect(cols).toContain("energy");
    expect(cols).toContain("sleepQuality");
    expect(cols).toContain("sleepHours");
    expect(cols).toContain("mood");
    expect(cols).toContain("soreness");
  });

  it("cycleState table has expected columns", () => {
    const cols = Object.keys(schema.cycleState);
    expect(cols).toContain("cycleStartDate");
    expect(cols).toContain("extensionWeeks");
    expect(cols).toContain("lastDeloadDate");
    expect(cols).toContain("completedSessions");
  });
});
