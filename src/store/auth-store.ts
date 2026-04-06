"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  avatarEmoji: string;
  hasPin: boolean;
}

interface AuthState {
  activeUserId: string | null;
  activeUserName: string | null;
  activeUserEmoji: string | null;

  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      activeUserId: null,
      activeUserName: null,
      activeUserEmoji: null,

      login: (user) =>
        set({
          activeUserId: user.id,
          activeUserName: user.name,
          activeUserEmoji: user.avatarEmoji,
        }),

      logout: () =>
        set({
          activeUserId: null,
          activeUserName: null,
          activeUserEmoji: null,
        }),
    }),
    { name: "auth-store" },
  ),
);
