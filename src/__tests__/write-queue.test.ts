import { describe, it, expect, beforeEach, vi } from "vitest";
import { enqueueWrite, flushQueue, getPendingCount } from "@/lib/write-queue";

const STORAGE_KEY = "hans-write-queue";

describe("write-queue", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("enqueueWrite succeeds — no items in queue", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true }),
    );

    await enqueueWrite("/api/sessions", { id: "1" });

    expect(getPendingCount()).toBe(0);
  });

  it("enqueueWrite fails — item saved to localStorage", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network error")),
    );

    await enqueueWrite("/api/sessions", { id: "1" });

    expect(getPendingCount()).toBe(1);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].url).toBe("/api/sessions");
    expect(stored[0].body).toEqual({ id: "1" });
    expect(stored[0].timestamp).toBeTypeOf("number");
  });

  it("flushQueue retries and removes successful items", async () => {
    // Seed two items into the queue
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { url: "/api/sessions", body: { id: "1" }, timestamp: 1000 },
        { url: "/api/checkins", body: { id: "2" }, timestamp: 2000 },
      ]),
    );

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true }),
    );

    await flushQueue();

    expect(getPendingCount()).toBe(0);
  });

  it("flushQueue keeps failed items", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { url: "/api/sessions", body: { id: "1" }, timestamp: 1000 },
        { url: "/api/checkins", body: { id: "2" }, timestamp: 2000 },
      ]),
    );

    // First call succeeds, second fails
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true })
        .mockRejectedValueOnce(new Error("still offline")),
    );

    await flushQueue();

    expect(getPendingCount()).toBe(1);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored[0].url).toBe("/api/checkins");
  });
});
