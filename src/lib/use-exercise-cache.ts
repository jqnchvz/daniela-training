"use client";

import { useEffect, useState } from "react";

interface CachedExercise {
  gifUrl: string | null;
  instructions: string[] | null;
}

let globalCache: Record<string, CachedExercise> | null = null;

/**
 * Fetches the exercise cache from DB once and provides a lookup function.
 * Returns the cached animated gifUrl and instructions for an exercise,
 * or null if not cached (falls back to static data).
 */
export function useExerciseCache() {
  const [cache, setCache] = useState<Record<string, CachedExercise> | null>(globalCache);

  useEffect(() => {
    if (globalCache) return;
    fetch("/api/exercises/cache")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          globalCache = data;
          setCache(data);
        }
      })
      .catch(() => {});
  }, []);

  return {
    getGifUrl: (exerciseId: string): string | null => cache?.[exerciseId]?.gifUrl ?? null,
    getInstructions: (exerciseId: string): string[] | null => cache?.[exerciseId]?.instructions ?? null,
    loaded: cache !== null,
  };
}
