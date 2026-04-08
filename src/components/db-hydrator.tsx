"use client";

import { useEffect } from "react";
import { useHydrateFromDb } from "@/lib/db/use-hydrate";
import { flushQueue } from "@/lib/write-queue";
import { useAuthStore } from "@/store/auth-store";

export function DbHydrator() {
  useHydrateFromDb();

  useEffect(() => {
    // Flush any pending writes after hydration
    const userId = useAuthStore.getState().activeUserId;
    flushQueue(userId ?? undefined);

    // Also flush when connectivity returns
    const handleOnline = () => flushQueue(useAuthStore.getState().activeUserId ?? undefined);
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return null;
}
