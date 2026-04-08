"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuthStore, type ExperienceLevel } from "@/store/auth-store";
import { useI18n, useT } from "@/lib/i18n";
import { useCyclePhaseStore } from "@/store/cycle-phase-store";
import { useHistoryStore } from "@/store/history-store";

const LEVELS: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];

export default function SettingsPage() {
  const t = useT();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useI18n();
  const activeUserName = useAuthStore((s) => s.activeUserName);
  const activeUserEmoji = useAuthStore((s) => s.activeUserEmoji);
  const experienceLevel = useAuthStore((s) => s.experienceLevel);
  const setExperienceLevel = useAuthStore((s) => s.setExperienceLevel);
  const cycleEnabled = useCyclePhaseStore((s) => s.enabled);
  const enableCycle = useCyclePhaseStore((s) => s.enable);
  const disableCycle = useCyclePhaseStore((s) => s.disable);
  const sessions = useHistoryStore((s) => s.sessions);
  const checkins = useHistoryStore((s) => s.checkins);

  const [mounted, setMounted] = useState(false);
  const [exported, setExported] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleExport = () => {
    const data = JSON.stringify({ sessions, checkins }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hans-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div className="px-5 py-5 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-[13px] text-muted-foreground min-h-[44px] min-w-[44px] flex items-center">
          ← {t("settings.back")}
        </Link>
      </div>
      <h1 className="font-heading text-[1.5rem] font-bold mb-5">{t("settings.title")}</h1>

      {/* Profile */}
      <Section title={t("settings.profile")}>
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-full bg-surface2 border border-border flex items-center justify-center text-xl">
            {activeUserEmoji ?? "💪"}
          </span>
          <div>
            <p className="font-semibold text-[15px]">{activeUserName ?? "User"}</p>
            <p className="text-[11px] text-muted-foreground">{t("settings.profileHint")}</p>
          </div>
        </div>
      </Section>

      {/* Experience level */}
      <Section title={t("settings.experienceLevel")}>
        <div className="flex gap-2">
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setExperienceLevel(level)}
              className={`flex-1 rounded-[10px] border py-2.5 min-h-[44px] text-[12px] font-semibold transition-colors ${
                experienceLevel === level
                  ? "border-sage bg-sage-bg text-sage"
                  : "border-border bg-surface2 text-muted-foreground"
              }`}
            >
              {t(`settings.${level}`)}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">{t("settings.experienceHint")}</p>
      </Section>

      {/* Language */}
      <Section title={t("settings.language")}>
        <div className="flex gap-2">
          <button
            onClick={() => setLocale("en")}
            className={`flex-1 rounded-[10px] border py-2.5 min-h-[44px] text-[13px] font-semibold transition-colors ${
              locale === "en"
                ? "border-sage bg-sage-bg text-sage"
                : "border-border bg-surface2 text-muted-foreground"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLocale("es")}
            className={`flex-1 rounded-[10px] border py-2.5 min-h-[44px] text-[13px] font-semibold transition-colors ${
              locale === "es"
                ? "border-sage bg-sage-bg text-sage"
                : "border-border bg-surface2 text-muted-foreground"
            }`}
          >
            Espanol
          </button>
        </div>
      </Section>

      {/* Theme */}
      <Section title={t("settings.theme")}>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme("light")}
            className={`flex-1 rounded-[10px] border py-2.5 min-h-[44px] text-[13px] font-semibold transition-colors ${
              theme === "light"
                ? "border-sage bg-sage-bg text-sage"
                : "border-border bg-surface2 text-muted-foreground"
            }`}
          >
            ☀️ {t("settings.light")}
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex-1 rounded-[10px] border py-2.5 min-h-[44px] text-[13px] font-semibold transition-colors ${
              theme === "dark"
                ? "border-sage bg-sage-bg text-sage"
                : "border-border bg-surface2 text-muted-foreground"
            }`}
          >
            🌙 {t("settings.dark")}
          </button>
        </div>
      </Section>

      {/* Menstrual cycle tracking */}
      <Section title={t("settings.cycleTracking")}>
        <button
          onClick={() => (cycleEnabled ? disableCycle() : enableCycle())}
          className={`w-full rounded-[10px] border py-2.5 min-h-[44px] text-[13px] font-semibold transition-colors ${
            cycleEnabled
              ? "border-sage bg-sage-bg text-sage"
              : "border-border bg-surface2 text-muted-foreground"
          }`}
        >
          {cycleEnabled ? `✓ ${t("settings.cycleEnabled")}` : t("settings.cycleDisabled")}
        </button>
        <p className="text-[11px] text-muted-foreground mt-2">{t("settings.cycleHint")}</p>
      </Section>

      {/* Data */}
      <Section title={t("settings.data")}>
        <button
          onClick={handleExport}
          className="w-full rounded-[12px] border border-border bg-surface2 py-2.5 min-h-[44px] text-[13px] font-semibold text-foreground transition-colors hover:bg-surface3"
        >
          {exported ? `✓ ${t("settings.exported")}` : `📥 ${t("settings.exportData")}`}
        </button>
        <p className="text-[11px] text-muted-foreground mt-2">
          {sessions.length} {t("settings.sessions")} · {checkins.length} {t("settings.checkins")}
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mb-2">
        {title}
      </p>
      <div className="rounded-[16px] border border-border bg-card p-4">
        {children}
      </div>
    </div>
  );
}
