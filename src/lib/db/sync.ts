/**
 * Client-side sync utilities.
 * Offline-first: localStorage is primary, DB is backup.
 * Writes are fire-and-forget; hydration happens on first load if localStorage is empty.
 */

// ── Write helpers (fire after local save) ───────────────────────────────────

export async function syncSessionToDb(session: Record<string, unknown>) {
  try {
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    });
  } catch {
    // Offline — will be retried on next session save or hydration
    console.warn("[sync] Failed to sync session to DB");
  }
}

export async function syncCheckinToDb(checkin: Record<string, unknown>) {
  try {
    await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkin),
    });
  } catch {
    console.warn("[sync] Failed to sync check-in to DB");
  }
}

export async function syncCycleToDb(cycle: Record<string, unknown>) {
  try {
    await fetch("/api/cycle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cycle),
    });
  } catch {
    console.warn("[sync] Failed to sync cycle to DB");
  }
}

// ── Read helpers (hydrate from DB on new device) ────────────────────────────

export async function fetchSessionsFromDb(): Promise<Record<string, unknown>[] | null> {
  try {
    const res = await fetch("/api/sessions");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchCheckinsFromDb(): Promise<Record<string, unknown>[] | null> {
  try {
    const res = await fetch("/api/checkins");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchCycleFromDb(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch("/api/cycle");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
