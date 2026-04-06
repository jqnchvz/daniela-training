/**
 * Client-side sync utilities.
 * Offline-first: localStorage is primary, DB is backup.
 * Writes are fire-and-forget with a retry queue for failures.
 */

interface PendingSync {
  url: string;
  body: string;
}

const QUEUE_KEY = "sync-queue";

function getQueue(): PendingSync[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(queue: PendingSync[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function addToQueue(url: string, body: string) {
  const queue = getQueue();
  queue.push({ url, body });
  saveQueue(queue);
}

/** Flush any previously failed syncs before the new one. */
async function flushQueue() {
  const queue = getQueue();
  if (queue.length === 0) return;

  const remaining: PendingSync[] = [];
  for (const item of queue) {
    try {
      const res = await fetch(item.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: item.body,
      });
      if (!res.ok) remaining.push(item);
    } catch {
      remaining.push(item);
      break; // Still offline — stop flushing
    }
  }
  saveQueue(remaining);
}

async function syncToApi(url: string, data: unknown) {
  const body = JSON.stringify(data);
  try {
    await flushQueue();
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    if (!res.ok) addToQueue(url, body);
  } catch {
    addToQueue(url, body);
  }
}

// ── Write helpers (fire after local save) ───────────────────────────────────

export async function syncSessionToDb(session: unknown) {
  await syncToApi("/api/sessions", session);
}

export async function syncCheckinToDb(checkin: unknown) {
  await syncToApi("/api/checkins", checkin);
}

export async function syncCycleToDb(cycle: unknown) {
  await syncToApi("/api/cycle", cycle);
}

// ── Auto-flush on reconnect ────────────────────────────────────────────────

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    flushQueue();
  });
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
