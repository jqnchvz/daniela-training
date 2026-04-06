"use client";

import { useEffect, useRef } from "react";
import { useHistoryStore } from "@/store/history-store";
import { useCycleStore } from "@/store/cycle-store";
import {
  fetchSessionsFromDb,
  fetchCheckinsFromDb,
  fetchCycleFromDb,
} from "./sync";

/**
 * Hydrate Zustand stores from the database on first load
 * if localStorage is empty (new device / cleared data).
 */
export function useHydrateFromDb() {
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const history = useHistoryStore.getState();
    const cycle = useCycleStore.getState();

    // Only hydrate if localStorage is empty
    const needsSessionHydration = history.sessions.length === 0;
    const needsCheckinHydration = history.checkins.length === 0;
    const needsCycleHydration = !cycle.cycleStartDate;

    if (!needsSessionHydration && !needsCheckinHydration && !needsCycleHydration) {
      return;
    }

    (async () => {
      try {
        if (needsSessionHydration || needsCheckinHydration) {
          const [dbSessions, dbCheckins] = await Promise.all([
            needsSessionHydration ? fetchSessionsFromDb() : null,
            needsCheckinHydration ? fetchCheckinsFromDb() : null,
          ]);

          if (dbSessions && dbSessions.length > 0) {
            // Map DB rows to store format
            const mapped = dbSessions.map((s: Record<string, unknown>) => ({
              id: s.id as string,
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
            }));
            useHistoryStore.setState({ sessions: mapped });
          }

          if (dbCheckins && dbCheckins.length > 0) {
            const mapped = dbCheckins.map((c: Record<string, unknown>) => ({
              id: c.id as string,
              date: c.date as string,
              energy: c.energy as number,
              sleepQuality: c.sleepQuality as number,
              sleepHours: (c.sleepHours as number) ?? 0,
              mood: c.mood as number,
              soreness: c.soreness as number,
              notes: (c.notes as string) ?? "",
            }));
            useHistoryStore.setState({ checkins: mapped });
          }
        }

        if (needsCycleHydration) {
          const dbCycle = await fetchCycleFromDb();
          if (dbCycle && dbCycle.cycleStartDate) {
            useCycleStore.setState({
              cycleStartDate: dbCycle.cycleStartDate as string,
              extensionWeeks: (dbCycle.extensionWeeks as number) ?? 0,
              lastDeloadDate: (dbCycle.lastDeloadDate as string) ?? null,
              completedSessions: (dbCycle.completedSessions as number) ?? 0,
            });
          }
        }
      } catch {
        // Offline or DB unavailable — localStorage is the fallback
        console.warn("[hydrate] Failed to hydrate from DB");
      }
    })();
  }, []);
}
