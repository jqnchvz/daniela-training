const STORAGE_KEY = "hans-write-queue";

interface QueuedWrite {
  url: string;
  body: unknown;
  timestamp: number;
}

function readQueue(): QueuedWrite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedWrite[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueuedWrite[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Attempt a POST write. On failure, persist to localStorage for later retry.
 */
export async function enqueueWrite(
  url: string,
  body: unknown,
): Promise<void> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    const queue = readQueue();
    queue.push({ url, body, timestamp: Date.now() });
    writeQueue(queue);
  }
}

/**
 * Retry all pending writes. Successful ones are removed; failed ones stay.
 */
export async function flushQueue(): Promise<void> {
  const queue = readQueue();
  if (queue.length === 0) return;

  const remaining: QueuedWrite[] = [];

  for (const item of queue) {
    try {
      const res = await fetch(item.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Success — don't keep it
    } catch {
      remaining.push(item);
    }
  }

  writeQueue(remaining);
}

/**
 * Return the number of pending writes in the queue.
 */
export function getPendingCount(): number {
  return readQueue().length;
}
