"use client";

import { useAuthStore } from "@/store/auth-store";
import { Onboarding } from "@/components/onboarding";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const onboardingComplete = useAuthStore((s) => s.onboardingComplete);

  if (!onboardingComplete) {
    return <Onboarding />;
  }

  return <>{children}</>;
}
