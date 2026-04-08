"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  getTodaysWorkout,
  getNextWorkout,
} from "@/lib/workout-schedule";
import { WORKOUT_PLANS, getLiteExercises } from "@/lib/exercises";
import { getSessionProtocol } from "@/lib/session-protocols";
import { estimateSessionDuration } from "@/lib/session-duration";
import { getCurrentPhase } from "@/lib/phases";
import { getDeloadStatus } from "@/lib/progression";
import { detectRedFlags } from "@/lib/checkin";
import { useCycleStore } from "@/store/cycle-store";
import { useHistoryStore } from "@/store/history-store";
import { useCyclePhaseStore } from "@/store/cycle-phase-store";
import { useT, useI18n } from "@/lib/i18n";
import { useAuthStore, type User } from "@/store/auth-store";
import { fetchUsers } from "@/lib/db/sync";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [earlyDeloadDismissed, setEarlyDeloadDismissed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [periodLogged, setPeriodLogged] = useState(false);
  const t = useT();
  const locale = useI18n((s) => s.locale);
  const isEs = locale === "es";
  const cycle = useCycleStore();
  const history = useHistoryStore();
  const activeUserName = useAuthStore((s) => s.activeUserName);
  const activeUserEmoji = useAuthStore((s) => s.activeUserEmoji);
  const activeUserId = useAuthStore((s) => s.activeUserId);
  const logout = useAuthStore((s) => s.logout);
  const login = useAuthStore((s) => s.login);
  const weekStats = history.getSessionsByWeek(activeUserId ?? undefined);
  const latestCheckin = history.getLatestCheckin(activeUserId ?? undefined);
  const cyclePhaseEnabled = useCyclePhaseStore((s) => s.enabled);
  const cyclePhase = useCyclePhaseStore((s) => s.getCurrentPhase)();
  const logPeriodStart = useCyclePhaseStore((s) => s.logPeriodStart);
  const enableCyclePhase = useCyclePhaseStore((s) => s.enable);
  const [showCycleExplainer, setShowCycleExplainer] = useState(false);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const experienceLevel = useAuthStore((s) => s.experienceLevel);

  // Compute early deload suggestion from red flags
  const redFlags = detectRedFlags(
    history.checkins.map((c) => ({ ...c, sleepHours: c.sleepHours ?? null })),
  );
  const deloadStatus = cycle.cycleStartDate
    ? getDeloadStatus(cycle.cycleStartDate, cycle.lastDeloadDate ?? null, redFlags)
    : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12
      ? "home.goodMorning"
      : hour < 18
        ? "home.goodAfternoon"
        : "home.goodEvening";

  const todaysWorkout = getTodaysWorkout();
  const nextWorkout = getNextWorkout();
  const today = new Date().getDay();

  // Dynamic duration based on actual plan data
  const todayPlan = todaysWorkout ? WORKOUT_PLANS.find((p) => p.dayOfWeek === todaysWorkout.dayOfWeek) : null;
  const todayProtocol = todayPlan ? getSessionProtocol(todayPlan.id) : null;
  const fullDuration = todayPlan && todayProtocol ? estimateSessionDuration(todayPlan.exercises, todayProtocol.warmupMinutes, todayProtocol.cooldownMinutes) : 0;
  const liteDuration = todayPlan && todayProtocol ? estimateSessionDuration(getLiteExercises(todayPlan.exercises), todayProtocol.warmupMinutes, todayProtocol.cooldownMinutes) : 0;

  const phaseStatus = cycle.cycleStartDate
    ? getCurrentPhase(cycle.cycleStartDate, cycle.extensionWeeks)
    : null;

  const weekDays = [
    { name: "MON", dow: 1, isWorkout: true },
    { name: "TUE", dow: 2, isWorkout: false },
    { name: "WED", dow: 3, isWorkout: true },
    { name: "THU", dow: 4, isWorkout: false },
    { name: "FRI", dow: 5, isWorkout: true },
    { name: "SAT", dow: 6, isWorkout: false },
    { name: "SUN", dow: 0, isWorkout: false },
  ];

  return (
    <div className="px-5 py-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 relative">
          <button
            onClick={async () => {
              if (!showUserMenu) {
                try {
                  const data = await fetchUsers();
                  if (data) {
                    setAllUsers(data);
                  }
                } catch { /* offline */ }
              }
              setShowUserMenu(!showUserMenu);
            }}
            className="w-12 h-12 rounded-full bg-surface2 border border-border flex items-center justify-center text-xl"
            title={t("auth.switchUser")}
          >
            {activeUserEmoji ?? "💪"}
          </button>
          <div>
            <p className="text-[13px] text-muted-foreground">
              {mounted ? t(greetingKey) : t("home.goodMorning")} ☀️
            </p>
            <h1 className="font-heading text-[1.35rem] font-bold">{activeUserName ?? "Daniela"}</h1>
            {mounted && (
              <p className="text-[11px] text-muted-foreground/60">
                {new Date().toLocaleDateString(isEs ? "es" : "en", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            )}
          </div>

          {/* User switcher dropdown */}
          {showUserMenu && (
            <div className="absolute top-12 left-0 z-50 w-56 rounded-[14px] border border-border bg-card shadow-lg overflow-hidden">
              {allUsers.filter((u) => u.id !== activeUserId).map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    if (user.hasPin) {
                      logout();
                    } else {
                      login(user);
                    }
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-surface2 transition-colors border-b border-border last:border-b-0"
                >
                  <span className="text-xl">{user.avatarEmoji}</span>
                  <span className="font-semibold text-sm">{user.name}</span>
                  {user.hasPin && <span className="text-[10px] text-muted-foreground ml-auto">🔒</span>}
                </button>
              ))}
              <button
                onClick={() => { logout(); setShowUserMenu(false); }}
                className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-surface2 transition-colors text-muted-foreground"
              >
                <span className="text-lg">➕</span>
                <span className="text-sm">{t("auth.addUser")}</span>
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-surface2 border border-border text-base transition-colors hover:bg-surface3"
            aria-label="Settings"
          >
            ⚙️
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Close dropdown on outside tap */}
      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
      )}

      {/* Phase badge */}
      {phaseStatus ? (
        <div className="mt-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-sage" />
            {t("home.phase")} {phaseStatus.phase.phase} · {t("home.week")} {phaseStatus.weekNumber} {t("home.of")}{" "}
            {phaseStatus.totalWeeks}
          </div>
          <p className="text-[11px] text-muted-foreground/70 mt-1 ml-1">
            {phaseStatus.phase.phase === 1
              ? t("home.phaseStabilization")
              : phaseStatus.phase.phase === 2
                ? t("home.phaseHypertrophy")
                : t("home.phaseStrength")}
          </p>
        </div>
      ) : (
        <div className="mt-3 rounded-[16px] border border-sage-dim bg-gradient-to-br from-sage-bg to-card p-4">
          <p className="font-heading text-[15px] font-bold">{t("home.startProgramTitle")}</p>
          <p className="text-[12px] text-muted-foreground leading-relaxed mt-1.5 mb-3">
            {t("home.startProgramDesc2")}
          </p>
          <div className="flex gap-2 text-[11px] text-sage font-semibold mb-3">
            <span className="rounded-full bg-sage-bg border border-sage-dim px-2.5 py-1">1. {t("home.phaseStabilization")}</span>
            <span className="rounded-full bg-sage-bg border border-sage-dim px-2.5 py-1">2. {t("home.phaseHypertrophy")}</span>
            <span className="rounded-full bg-sage-bg border border-sage-dim px-2.5 py-1">3. {t("home.phaseStrength")}</span>
          </div>
          {experienceLevel && (
            <p className="text-[11px] text-muted-foreground mb-3">
              📊 {t("home.personalizedTo")} {t(`settings.${experienceLevel}`)}
            </p>
          )}
          {!showStartConfirm ? (
            <button
              onClick={() => setShowStartConfirm(true)}
              className="w-full rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-primary-foreground transition-all hover:bg-sage/80"
            >
              {t("home.startProgram")}
            </button>
          ) : (
            <div className="rounded-[12px] border border-border bg-surface2 p-3.5">
              <p className="text-[13px] text-foreground leading-relaxed mb-3">
                {t("home.startConfirmDesc")}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowStartConfirm(false)}
                  className="flex-1 rounded-[10px] border border-border bg-card py-2.5 min-h-[44px] text-[12px] font-semibold"
                >
                  {t("home.notYet")}
                </button>
                <button
                  onClick={() => { cycle.startCycle(); setShowStartConfirm(false); }}
                  className="flex-1 rounded-[10px] bg-sage py-2.5 min-h-[44px] text-[12px] font-bold text-primary-foreground"
                >
                  {t("home.letsGo")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Menstrual cycle tracking (opt-in) */}
      {cyclePhaseEnabled ? (
        <>
          {cyclePhase && (
            <div className="mt-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-surface2 border border-border px-3 py-1 text-[11px] text-muted-foreground">
                <span>{cyclePhase.phase === "menstrual" ? "🔴" : cyclePhase.phase === "follicular" ? "🌱" : cyclePhase.phase === "ovulation" ? "🌸" : "🌙"}</span>
                <span>{t(`cycle.${cyclePhase.phase}`)} · {t("cycle.day")} {cyclePhase.dayInCycle}</span>
              </div>
              {cyclePhase.phase === "luteal" && cyclePhase.dayInCycle >= 22 && (
                <p className="text-[11px] text-muted-foreground/70 mt-1 ml-1">
                  {t("cycle.lutealSuggestion")}
                </p>
              )}
            </div>
          )}
          <button
            onClick={() => {
              const today = new Date().toISOString().split("T")[0];
              logPeriodStart(today);
              setPeriodLogged(true);
              setTimeout(() => setPeriodLogged(false), 2000);
            }}
            className="mt-2 inline-flex items-center justify-center rounded-[10px] border border-border bg-surface2 px-3 min-h-[44px] text-[12px] text-muted-foreground font-medium"
          >
            {periodLogged ? t("cycle.logged") : t("cycle.logPeriod")}
          </button>
        </>
      ) : (
        <>
          {!showCycleExplainer ? (
            <button
              onClick={() => setShowCycleExplainer(true)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface2 border border-border px-3 py-2.5 min-h-[44px] text-[11px] text-muted-foreground"
            >
              {t("cycle.startTracking")}
            </button>
          ) : (
            <div className="mt-2 rounded-[12px] border border-border bg-card p-3.5">
              <p className="font-semibold text-[13px]">{t("cycle.explainerTitle")}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                {t("cycle.explainerDesc")}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowCycleExplainer(false)}
                  className="flex-1 rounded-[10px] border border-border bg-surface2 py-2.5 min-h-[44px] text-[12px] font-semibold"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={() => {
                    enableCyclePhase();
                    setShowCycleExplainer(false);
                    const today = new Date().toISOString().split("T")[0];
                    logPeriodStart(today);
                    setPeriodLogged(true);
                    setTimeout(() => setPeriodLogged(false), 2000);
                  }}
                  className="flex-1 rounded-[10px] bg-sage py-2.5 min-h-[44px] text-[12px] font-bold text-primary-foreground"
                >
                  {t("cycle.enableAndLog")}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Early deload suggestion */}
      {deloadStatus?.earlyDeloadSuggested && !earlyDeloadDismissed && (
        <div className="mt-3 rounded-[12px] bg-gold-bg border border-gold/30 px-4 py-3 flex items-start gap-3">
          <p className="text-[13px] text-gold leading-relaxed flex-1">
            ⚠️ {t("home.earlyDeload")}
          </p>
          <button
            onClick={() => setEarlyDeloadDismissed(true)}
            className="text-[12px] text-gold/70 font-semibold shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {t("home.dismiss")}
          </button>
        </div>
      )}

      {/* Week strip */}
      <div className="flex gap-1.5 mt-4">
        {weekDays.map((day) => {
          const isToday = day.dow === today;
          const isPast = day.dow !== 0 && day.dow < today;
          return (
            <div
              key={day.name}
              className={`flex-1 rounded-[10px] border py-2.5 px-1 text-center ${
                isToday
                  ? "border-sage bg-sage-bg"
                  : isPast
                    ? "border-border bg-surface2"
                    : day.isWorkout
                      ? "border-border bg-card"
                      : "border-border bg-card opacity-40"
              }`}
            >
              <p className="text-[9px] font-semibold tracking-[1px] uppercase text-muted-foreground">
                {day.name}
              </p>
              <p className="text-sm leading-none mt-1">
                {isToday && day.isWorkout
                  ? "💪"
                  : day.isWorkout
                    ? isPast
                      ? "✓"
                      : "💪"
                    : day.dow === 6
                      ? "🧘"
                      : day.dow === 0
                        ? "—"
                        : "🚶"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Today's workout card */}
      <div className="mt-4 rounded-[20px] border border-sage-dim bg-gradient-to-br from-sage-bg to-card p-[22px] relative overflow-hidden">
        <div className="absolute -top-[30px] -right-[30px] w-[120px] h-[120px] rounded-full bg-sage opacity-[0.08]" />
        {todaysWorkout ? (
          <>
            <p className="text-[11px] font-semibold tracking-[2px] uppercase text-sage">
              {t("home.today")} · {isEs ? todaysWorkout.nameEs : todaysWorkout.name}
            </p>
            <h2 className="font-heading text-[1.6rem] font-extrabold leading-tight mt-2">
              {isEs ? todaysWorkout.labelEs : todaysWorkout.label}
            </h2>
            <p className="text-[13px] text-muted-foreground mt-1.5">
              {todaysWorkout.exercises} {t("common.exercises")} &middot; ~{fullDuration} min
            </p>
            {phaseStatus && (
              <p className="text-[11px] text-sage mt-1">
                {t("home.phase")} {phaseStatus.phase.phase}: {phaseStatus.phase.setsMax}×{phaseStatus.phase.repsMin}-
                {phaseStatus.phase.repsMax}
              </p>
            )}
            <div className="flex gap-4 mt-4 mb-5">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                ⏱ ~{fullDuration} min
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                📋 {todaysWorkout.exercises} {t("common.exercises")}
              </span>
            </div>
            <Link
              href="/session"
              className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-primary-foreground transition-all hover:bg-sage/80 hover:-translate-y-0.5 active:translate-y-0"
            >
              {t("home.startSession")}
            </Link>
          </>
        ) : (
          <>
            <p className="text-[11px] font-semibold tracking-[2px] uppercase text-sage">
              {t("home.restDay")}
            </p>
            <h2 className="font-heading text-[1.4rem] font-bold mt-2">
              {t("home.recoveryDay")} 🧘
            </h2>
            <p className="text-[13px] text-muted-foreground mt-1.5 mb-4">
              {t("home.nextSession")}: {t(`dayFull.${nextWorkout.dayOfWeek}`)} — {isEs ? nextWorkout.labelEs : nextWorkout.label}
            </p>

            <div className="space-y-2.5">
              <RecoveryTip
                icon="🚶"
                title={t("recovery.walkTitle")}
                desc={t("recovery.walkDesc")}
              />
              <RecoveryTip
                icon="🧘"
                title={t("recovery.stretchTitle")}
                desc={t("recovery.stretchDesc")}
              />
              <RecoveryTip
                icon="😴"
                title={t("recovery.sleepTitle")}
                desc={t("recovery.sleepDesc")}
              />
              <RecoveryTip
                icon="💧"
                title={t("recovery.nutritionTitle")}
                desc={t("recovery.nutritionDesc")}
              />
              <RecoveryTip
                icon="🧊"
                title={t("recovery.stressTitle")}
                desc={t("recovery.stressDesc")}
              />
            </div>

            {/* LISS activity log */}
            <LissActivityCard />
          </>
        )}
      </div>

      {/* Wellness row */}
      <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-5 mb-2">
        {t("home.lastWellness")}
      </p>
      <div className="flex gap-2">
        <WellnessCard label={t("home.energy")} value={latestCheckin ? String(latestCheckin.energy) : "--"} color="text-sage" />
        <WellnessCard label={t("home.sleep")} value={latestCheckin ? String(latestCheckin.sleepQuality) : "--"} color="text-dt-blue" />
        <WellnessCard label={t("home.soreness")} value={latestCheckin ? String(latestCheckin.soreness) : "--"} color="text-gold" />
      </div>

      {/* Stats row */}
      <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-4 mb-2">
        {t("home.thisWeek")}
      </p>
      <div className="flex gap-2.5">
        <StatBox
          value={`${weekStats.thisWeek}/3`}
          label={t("home.thisWeek")}
          color="text-sage"
        />
        <StatBox value={String(weekStats.total)} label={t("home.totalSessions")} color="text-gold" />
        <StatBox value={String(history.checkins.length)} label={t("home.checkins")} color="text-dt-blue" />
      </div>

      {/* Phase progress */}
      {phaseStatus && (
        <div className="mt-3 rounded-[16px] border border-border bg-card p-4">
          <p className="text-xs font-semibold tracking-[1px] uppercase text-muted-foreground font-mono mb-1.5">
            {t("home.phaseProgress")}
          </p>
          <p className="text-[13px] text-muted-foreground mb-2.5">
            {phaseStatus.phase.name} · Week {phaseStatus.weekInPhase} &middot;{" "}
            {phaseStatus.phase.focus}
          </p>
          <div className="h-1 rounded-full bg-surface3">
            <div
              className="h-full rounded-full bg-sage transition-all"
              style={{ width: `${phaseStatus.progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* No cycle prompt */}
      {!phaseStatus && (
        <div className="mt-3 rounded-[16px] border border-border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t("home.startProgramDesc")}
          </p>
        </div>
      )}
    </div>
  );
}

function RecoveryTip({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-lg shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="font-semibold text-[13px]">{title}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function WellnessCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex-1 rounded-[10px] border border-border bg-surface2 p-3 text-center">
      <p className={`font-heading text-[1.4rem] font-extrabold ${color}`}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function LissActivityCard() {
  const t = useT();
  const history = useHistoryStore();
  const activeUserId = useAuthStore((s) => s.activeUserId);
  const today = new Date().toISOString().split("T")[0];
  const existing = history.getCheckinForDate(today, activeUserId ?? undefined);

  const [walkMinutes, setWalkMinutes] = useState(existing?.walkMinutes ?? 0);
  const [didStretching, setDidStretching] = useState(existing?.didStretching ?? false);
  const [didYoga, setDidYoga] = useState(existing?.didYoga ?? false);
  const [saved, setSaved] = useState(false);

  // Sync from store if checkin loads after hydration
  useEffect(() => {
    if (existing) {
      setWalkMinutes(existing.walkMinutes ?? 0);
      setDidStretching(existing.didStretching ?? false);
      setDidYoga(existing.didYoga ?? false);
    }
  }, [existing]);

  const handleSave = useCallback(() => {
    history.addCheckin({
      id: existing?.id ?? crypto.randomUUID(),
      userId: activeUserId ?? undefined,
      date: today,
      energy: existing?.energy ?? 5,
      sleepQuality: existing?.sleepQuality ?? 5,
      sleepHours: existing?.sleepHours ?? 7,
      mood: existing?.mood ?? 5,
      soreness: existing?.soreness ?? 3,
      notes: existing?.notes ?? "",
      walkMinutes,
      didStretching,
      didYoga,
      tookMedication: existing?.tookMedication ?? null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [existing, activeUserId, today, walkMinutes, didStretching, didYoga, history]);

  return (
    <div className="mt-4 rounded-[16px] border border-border bg-card p-4">
      <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mb-3">
        {t("home.todayActivity")}
      </p>

      {/* Walk minutes */}
      <div className="mb-3">
        <label className="text-sm font-medium">{t("home.walkMinutes")}</label>
        <input
          type="number"
          inputMode="numeric"
          value={walkMinutes}
          onChange={(e) => setWalkMinutes(Math.max(0, Math.min(300, Number(e.target.value) || 0)))}
          step={5}
          min={0}
          max={300}
          className="w-full mt-1 rounded-[10px] border border-border bg-surface2 px-3 py-2 text-sm font-mono"
        />
      </div>

      {/* Toggle buttons */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setDidStretching(!didStretching)}
          className={`flex-1 rounded-[10px] border py-2.5 min-h-[44px] text-[13px] font-semibold transition-colors ${
            didStretching
              ? "border-sage bg-sage-bg text-sage"
              : "border-border bg-surface2 text-muted-foreground"
          }`}
        >
          {didStretching ? "✓ " : ""}{t("home.stretching")}
        </button>
        <button
          onClick={() => setDidYoga(!didYoga)}
          className={`flex-1 rounded-[10px] border py-2.5 min-h-[44px] text-[13px] font-semibold transition-colors ${
            didYoga
              ? "border-sage bg-sage-bg text-sage"
              : "border-border bg-surface2 text-muted-foreground"
          }`}
        >
          {didYoga ? "✓ " : ""}{t("home.yoga")}
        </button>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="w-full rounded-[12px] bg-sage py-2.5 min-h-[44px] text-[13px] font-bold text-primary-foreground transition-all hover:bg-sage/80"
      >
        {saved ? t("home.activitySaved") : t("home.logActivity")}
      </button>
    </div>
  );
}

function StatBox({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex-1 text-center rounded-[10px] border border-border bg-surface2 p-3">
      <p
        className={`font-heading text-[1.5rem] font-extrabold leading-none ${color}`}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
