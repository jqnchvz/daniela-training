import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OfflineAction {
  id: string;
  table: string;
  type: "insert" | "update";
  data: Record<string, unknown>;
  createdAt: string;
}

interface AppState {
  isOnline: boolean;
  offlineQueue: OfflineAction[];

  setOnline: (online: boolean) => void;
  addToOfflineQueue: (action: Omit<OfflineAction, "id" | "createdAt">) => void;
  clearOfflineQueue: () => void;
  removeFromQueue: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isOnline: true,
      offlineQueue: [],

      setOnline: (online) => set({ isOnline: online }),

      addToOfflineQueue: (action) =>
        set((state) => ({
          offlineQueue: [
            ...state.offlineQueue,
            {
              ...action,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      clearOfflineQueue: () => set({ offlineQueue: [] }),

      removeFromQueue: (id) =>
        set((state) => ({
          offlineQueue: state.offlineQueue.filter((a) => a.id !== id),
        })),
    }),
    { name: "app-store" },
  ),
);
