"use client";

import { useHydrateFromDb } from "@/lib/db/use-hydrate";

export function DbHydrator() {
  useHydrateFromDb();
  return null;
}
