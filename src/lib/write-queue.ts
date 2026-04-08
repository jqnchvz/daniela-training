const STORAGE_KEY_PREFIX = "hans-write-queue";

interface QueuedWrite {
  url: string;
  body: unknown;
  timestamp: number;
}

function getStorageKey(userId?: string): string {
  return userId ? `${STORAGE_KEY_PREFIX}-${userId}` : STORAGE_KEY_PREFIX;
}

function readQueue(userId?: string): QueuedWrite[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? (JSON.parse(raw) as QueuedWrite[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueuedWrite[], userId?: string): void {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(items));
}

/**
 * Attempt a POST write. On failure, persist to localStorage for later retry.
 */
export async function enqueueWrite(
  url: string,
  body: unknown,
  userId?: string,
): Promise<void> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    const queue = readQueue(userId);
    queue.push({ url, body, timestamp: Date.now() });
    writeQueue(queue, userId);
  }
}

/**
 * Retry all pending writes. Successful ones are removed; failed ones stay.
 */
export async function flushQueue(userId?: string): Promise<void> {
  const queue = readQueue(userId);
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

  writeQueue(remaining, userId);
}

/**
 * Return the number of pending writes in the queue.
 */
export function getPendingCount(userId?: string): number {
  return readQueue(userId).length;
}
