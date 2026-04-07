import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, cleanup, act } from "@testing-library/react";
import { useAuthStore } from "@/store/auth-store";

// Mock the sync module
vi.mock("@/lib/db/sync", () => ({
  fetchSessionsFromDb: vi.fn().mockResolvedValue([]),
  fetchCheckinsFromDb: vi.fn().mockResolvedValue([]),
  fetchCycleFromDb: vi.fn().mockResolvedValue(null),
}));

import {
  fetchSessionsFromDb,
  fetchCheckinsFromDb,
  fetchCycleFromDb,
} from "@/lib/db/sync";
import { useHydrateFromDb } from "@/lib/db/use-hydrate";

describe("useHydrateFromDb", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ activeUserId: null });
  });

  it("runs hydration on first mount", async () => {
    renderHook(() => useHydrateFromDb());

    await vi.waitFor(() => {
      expect(fetchSessionsFromDb).toHaveBeenCalled();
    });

    expect(fetchCheckinsFromDb).toHaveBeenCalled();
    expect(fetchCycleFromDb).toHaveBeenCalled();
  });

  it("re-runs hydration when activeUserId changes", async () => {
    useAuthStore.setState({ activeUserId: "user-1" });
    const { unmount } = renderHook(() => useHydrateFromDb());

    // Wait for initial hydration
    await vi.waitFor(() => {
      expect(fetchSessionsFromDb).toHaveBeenCalled();
    });

    const callsAfterFirstHydration = vi.mocked(fetchSessionsFromDb).mock.calls.length;

    // Switch user
    act(() => {
      useAuthStore.setState({ activeUserId: "user-2" });
    });

    await vi.waitFor(() => {
      expect(fetchSessionsFromDb).toHaveBeenCalledTimes(callsAfterFirstHydration + 1);
    });

    expect(fetchSessionsFromDb).toHaveBeenLastCalledWith("user-2");
    expect(fetchCheckinsFromDb).toHaveBeenLastCalledWith("user-2");
    expect(fetchCycleFromDb).toHaveBeenLastCalledWith("user-2");

    unmount();
  });

  it("does not re-run hydration when rerendered with same user", async () => {
    useAuthStore.setState({ activeUserId: "user-1" });
    const { rerender, unmount } = renderHook(() => useHydrateFromDb());

    await vi.waitFor(() => {
      expect(fetchSessionsFromDb).toHaveBeenCalled();
    });

    const callCount = vi.mocked(fetchSessionsFromDb).mock.calls.length;

    // Rerender without changing the user
    rerender();

    // Give a tick for any potential effect to fire
    await new Promise((r) => setTimeout(r, 50));

    expect(fetchSessionsFromDb).toHaveBeenCalledTimes(callCount);

    unmount();
  });
});
