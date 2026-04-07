"use client";

import { useState } from "react";
import { useAuthStore, type ExperienceLevel } from "@/store/auth-store";
import { useI18n, useT } from "@/lib/i18n";

const STEPS = 3;

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<ExperienceLevel>("intermediate");
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const userName = useAuthStore((s) => s.activeUserName);
  const locale = useI18n((s) => s.locale);
  const isEs = locale === "es";
  const t = useT();

  const handleFinish = () => {
    completeOnboarding(level);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: STEPS }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i <= step ? "bg-sage" : "bg-surface3"
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <>
          <div className="text-6xl mb-4">👋</div>
          <h1 className="font-heading text-2xl font-extrabold mb-2">
            {t("onboarding.greeting").replace("{name}", userName ?? "")}
          </h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-[300px] leading-relaxed">
            {t("onboarding.introDesc")}
          </p>
          <div className="w-full max-w-[320px] rounded-[16px] border border-border bg-card p-4 text-left space-y-3">
            <Feature icon="⏱" title={t("onboarding.featureRestTitle")} desc={t("onboarding.featureRestDesc")} />
            <Feature icon="📈" title={t("onboarding.featureOverloadTitle")} desc={t("onboarding.featureOverloadDesc")} />
            <Feature icon="🎯" title={t("onboarding.featureRpeTitle")} desc={t("onboarding.featureRpeDesc")} />
            <Feature icon="❤️" title={t("onboarding.featureWellnessTitle")} desc={t("onboarding.featureWellnessDesc")} />
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-6 w-full max-w-[320px] rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-primary-foreground"
          >
            {t("onboarding.next")}
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <div className="text-6xl mb-4">🏋️</div>
          <h2 className="font-heading text-xl font-bold mb-2">
            {t("onboarding.levelTitle")}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
            {t("onboarding.levelDesc")}
          </p>

          <div className="w-full max-w-[320px] space-y-3">
            <LevelOption
              value="beginner"
              selected={level}
              onSelect={setLevel}
              emoji="🌱"
              title={t("onboarding.beginner")}
              desc={t("onboarding.beginnerDesc")}
            />
            <LevelOption
              value="intermediate"
              selected={level}
              onSelect={setLevel}
              emoji="💪"
              title={t("onboarding.intermediate")}
              desc={t("onboarding.intermediateDesc")}
            />
            <LevelOption
              value="advanced"
              selected={level}
              onSelect={setLevel}
              emoji="🔥"
              title={t("onboarding.advanced")}
              desc={t("onboarding.advancedDesc")}
            />
          </div>

          <button
            onClick={() => setStep(2)}
            className="mt-6 w-full max-w-[320px] rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-primary-foreground"
          >
            {t("onboarding.next")}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="text-6xl mb-4">✅</div>
          <h2 className="font-heading text-xl font-bold mb-2">
            {t("onboarding.allSet")}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-[300px] leading-relaxed">
            {t("onboarding.summaryDesc")}
          </p>

          <div className="w-full max-w-[320px] rounded-[16px] border border-border bg-card p-4 text-left space-y-2 mb-6">
            <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mb-1">
              {t("onboarding.yourProgram")}
            </p>
            <InfoRow label={t("onboarding.duration")} value={t("onboarding.durationValue")} />
            <InfoRow label={t("onboarding.frequency")} value={t("onboarding.frequencyValue")} />
            <InfoRow label={t("onboarding.level")} value={level === "beginner" ? t("onboarding.beginner") : level === "intermediate" ? t("onboarding.intermediate") : t("onboarding.advanced")} />
            <InfoRow label={t("onboarding.startingWeights")} value={t("onboarding.startingWeightsValue")} />
          </div>

          <button
            onClick={handleFinish}
            className="w-full max-w-[320px] rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-primary-foreground"
          >
            {t("onboarding.startTraining")}
          </button>
        </>
      )}

      {/* Skip button on first two steps */}
      {step < 2 && (
        <button
          onClick={handleFinish}
          className="mt-3 text-sm text-muted-foreground"
        >
          {t("onboarding.skip")}
        </button>
      )}
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function LevelOption({
  value,
  selected,
  onSelect,
  emoji,
  title,
  desc,
}: {
  value: ExperienceLevel;
  selected: ExperienceLevel;
  onSelect: (v: ExperienceLevel) => void;
  emoji: string;
  title: string;
  desc: string;
}) {
  const isSelected = value === selected;
  return (
    <button
      onClick={() => onSelect(value)}
      className={`w-full flex items-center gap-3 rounded-[16px] border p-4 text-left transition-colors ${
        isSelected
          ? "bg-sage-bg border-sage-dim"
          : "bg-card border-border hover:bg-surface2"
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="font-heading font-bold text-[15px]">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
