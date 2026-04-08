"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  avatarEmoji: string;
  hasPin: boolean;
}

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

interface AuthState {
  activeUserId: string | null;
  activeUserName: string | null;
  activeUserEmoji: string | null;
  onboardingComplete: boolean;
  experienceLevel: ExperienceLevel | null;

  login: (user: User) => void;
  logout: () => void;
  completeOnboarding: (level: ExperienceLevel) => void;
  setExperienceLevel: (level: ExperienceLevel) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      activeUserId: null,
      activeUserName: null,
      activeUserEmoji: null,
      onboardingComplete: false,
      experienceLevel: null,

      login: (user) =>
        set({
          activeUserId: user.id,
          activeUserName: user.name,
          activeUserEmoji: user.avatarEmoji,
        }),

      logout: () => {
        // Reset dependent stores before clearing auth state
        const { useSessionStore } = require("@/store/session-store");
        const { useCyclePhaseStore } = require("@/store/cycle-phase-store");
        useSessionStore.getState().reset();
        useCyclePhaseStore.getState().switchUser(null);
        set({
          activeUserId: null,
          activeUserName: null,
          activeUserEmoji: null,
          onboardingComplete: false,
          experienceLevel: null,
        });
      },

      completeOnboarding: (level) =>
        set({
          onboardingComplete: true,
          experienceLevel: level,
        }),

      setExperienceLevel: (level) => set({ experienceLevel: level }),
    }),
    { name: "auth-store" },
  ),
);
