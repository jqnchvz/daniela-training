"use client";

import { useAuthStore } from "@/store/auth-store";
import { Onboarding } from "@/components/onboarding";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const onboardingComplete = useAuthStore((s) => s.onboardingComplete);
  const experienceLevel = useAuthStore((s) => s.experienceLevel);

  // Skip onboarding if user already has an experience level (returning user)
  // Only show for genuine first-time users who never completed onboarding
  if (!onboardingComplete && !experienceLevel) {
    return <Onboarding />;
  }

  return <>{children}</>;
}
