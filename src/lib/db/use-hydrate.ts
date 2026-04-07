"use client";

import { useEffect, useRef } from "react";
import { useHistoryStore } from "@/store/history-store";
import { useCycleStore } from "@/store/cycle-store";
import { useAuthStore } from "@/store/auth-store";
import {
  fetchSessionsFromDb,
  fetchCheckinsFromDb,
  fetchCycleFromDb,
} from "./sync";

/**
 * Hydrate Zustand stores from the database on load.
 * DB is the single source of truth — always fetch fresh data.
 */
export function useHydrateFromDb() {
  const hydrated = useRef(false);
  const activeUserId = useAuthStore((s) => s.activeUserId);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    (async () => {
      try {
        const [dbSessions, dbCheckins, dbCycle] = await Promise.all([
          fetchSessionsFromDb(activeUserId ?? undefined),
          fetchCheckinsFromDb(activeUserId ?? undefined),
          fetchCycleFromDb(activeUserId ?? undefined),
        ]);

        const sessions = dbSessions
          ? dbSessions.map((s: Record<string, unknown>) => ({
              id: s.id as string,
              userId: s.userId as string | undefined,
              planId: s.planId as string,
              planName: s.planName as string,
              date: s.date as string,
              startedAt: s.startedAt as string,
              completedAt: s.completedAt as string,
              durationMinutes: s.durationMinutes as number,
              energyPre: s.energyPre as number | null,
              energyPost: s.energyPost as number | null,
              sleepScore: s.sleepScore as number | null,
              sorenessScore: s.sorenessScore as number | null,
              sets: ((s.sets as Record<string, unknown>[]) ?? []).map(
                (set: Record<string, unknown>) => ({
                  exerciseId: set.exerciseId as string,
                  exerciseName: set.exerciseName as string,
                  setNumber: set.setNumber as number,
                  weight: set.weight as number,
                  reps: set.reps as number,
                  rpe: set.rpe as number | null,
                }),
              ),
              notes: (s.notes as string) ?? "",
            }))
          : [];

        const checkins = dbCheckins
          ? dbCheckins.map((c: Record<string, unknown>) => ({
              id: c.id as string,
              userId: c.userId as string | undefined,
              date: c.date as string,
              energy: c.energy as number,
              sleepQuality: c.sleepQuality as number,
              sleepHours: (c.sleepHours as number) ?? 0,
              mood: c.mood as number,
              soreness: c.soreness as number,
              notes: (c.notes as string) ?? "",
            }))
          : [];

        useHistoryStore.getState().hydrate({ sessions, checkins });

        if (dbCycle && dbCycle.cycleStartDate) {
          useCycleStore.getState().hydrate({
            cycleStartDate: dbCycle.cycleStartDate as string,
            extensionWeeks: (dbCycle.extensionWeeks as number) ?? 0,
            lastDeloadDate: (dbCycle.lastDeloadDate as string) ?? null,
            completedSessions: (dbCycle.completedSessions as number) ?? 0,
          });
        } else {
          useCycleStore.getState().hydrate({});
        }
      } catch {
        // DB unavailable — stores remain empty, mark as loaded
        useHistoryStore.getState().hydrate({});
        useCycleStore.getState().hydrate({});
      }
    })();
  }, [activeUserId]);
}
