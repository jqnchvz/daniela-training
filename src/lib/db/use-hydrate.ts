"use client";

import { useEffect, useRef } from "react";
import { useHistoryStore } from "@/store/history-store";
import { useCycleStore } from "@/store/cycle-store";
import { useSessionStore } from "@/store/session-store";
import { useCyclePhaseStore } from "@/store/cycle-phase-store";
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
  const lastHydratedUser = useRef<string | null | undefined>(undefined);
  const activeUserId = useAuthStore((s) => s.activeUserId);

  useEffect(() => {
    if (lastHydratedUser.current === (activeUserId ?? null)) return;
    lastHydratedUser.current = activeUserId ?? null;

    // Reset client-only stores on user switch to prevent data leakage
    useSessionStore.getState().reset();
    useCyclePhaseStore.getState().switchUser(activeUserId ?? null);

    (async () => {
      try {
        const [dbSessions, dbCheckins, dbCycle] = await Promise.all([
          fetchSessionsFromDb(activeUserId ?? undefined),
          fetchCheckinsFromDb(activeUserId ?? undefined),
          fetchCycleFromDb(activeUserId ?? undefined),
        ]);

        const sessions = dbSessions
          ? dbSessions.map((s) => ({
              id: s.id,
              userId: s.userId ?? undefined,
              planId: s.planId,
              planName: s.planName,
              date: s.date,
              startedAt: s.startedAt,
              completedAt: s.completedAt,
              durationMinutes: s.durationMinutes,
              energyPre: s.energyPre,
              energyPost: s.energyPost,
              sleepScore: s.sleepScore,
              sorenessScore: s.sorenessScore,
              sets: (s.sets ?? []).map((set) => ({
                exerciseId: set.exerciseId,
                exerciseName: set.exerciseName,
                setNumber: set.setNumber,
                weight: set.weight,
                reps: set.reps,
                rpe: set.rpe,
              })),
              notes: s.notes ?? "",
              averageHr: s.averageHr ?? null,
              maxHr: s.maxHr ?? null,
              sessionRpe: s.sessionRpe ?? null,
              cyclePhase: null,
            }))
          : [];

        const checkins = dbCheckins
          ? dbCheckins.map((c) => ({
              id: c.id,
              userId: c.userId ?? undefined,
              date: c.date,
              energy: c.energy,
              sleepQuality: c.sleepQuality,
              sleepHours: c.sleepHours ?? 0,
              mood: c.mood,
              soreness: c.soreness,
              notes: c.notes ?? "",
              walkMinutes: c.walkMinutes ?? null,
              didStretching: c.didStretching ?? null,
              didYoga: c.didYoga ?? null,
              tookMedication: c.tookMedication ?? null,
            }))
          : [];

        useHistoryStore.getState().hydrate({ sessions, checkins });

        if (dbCycle && dbCycle.cycleStartDate) {
          useCycleStore.getState().hydrate({
            cycleStartDate: dbCycle.cycleStartDate,
            extensionWeeks: dbCycle.extensionWeeks ?? 0,
            lastDeloadDate: dbCycle.lastDeloadDate ?? null,
            completedSessions: dbCycle.completedSessions ?? 0,
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
