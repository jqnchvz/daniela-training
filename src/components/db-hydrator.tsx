"use client";

import { useEffect } from "react";
import { useHydrateFromDb } from "@/lib/db/use-hydrate";
import { flushQueue } from "@/lib/write-queue";

export function DbHydrator() {
  useHydrateFromDb();

  useEffect(() => {
    // Flush any pending writes after hydration
    flushQueue();

    // Also flush when connectivity returns
    const handleOnline = () => flushQueue();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return null;
}
