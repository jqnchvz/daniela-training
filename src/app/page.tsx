"use client";

import { useEffect, useState } from "react";
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
import { useT, useI18n } from "@/lib/i18n";
import { useAuthStore, type User } from "@/store/auth-store";
import { fetchUsers } from "@/lib/db/sync";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [earlyDeloadDismissed, setEarlyDeloadDismissed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
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
                    setAllUsers(data.map((u) => ({
                      id: u.id as string,
                      name: u.name as string,
                      avatarEmoji: u.avatarEmoji as string,
                      hasPin: u.hasPin as boolean,
                    })));
                  }
                } catch { /* offline */ }
              }
              setShowUserMenu(!showUserMenu);
            }}
            className="w-10 h-10 rounded-full bg-surface2 border border-border flex items-center justify-center text-xl"
            title={t("auth.switchUser")}
          >
            {activeUserEmoji ?? "💪"}
          </button>
          <div>
            <p className="text-[13px] text-muted-foreground">
              {mounted ? t(greetingKey) : t("home.goodMorning")} ☀️
            </p>
            <h1 className="font-heading text-[1.35rem] font-bold">{activeUserName ?? "Daniela"}</h1>
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
        <ThemeToggle />
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
              ? (isEs ? "Estabilización: carga ligera para preparar articulaciones y sistema nervioso." : "Stabilization: lighter load to prepare joints and nervous system.")
              : phaseStatus.phase.phase === 2
                ? (isEs ? "Hipertrofia: crecimiento muscular con volumen controlado para no estresar la tiroides." : "Hypertrophy: muscle growth with controlled volume to avoid thyroid stress.")
                : (isEs ? "Fuerza: cargas más altas con descansos largos — el cortisol se mantiene bajo control." : "Strength: heavier loads with longer rest — cortisol stays in check.")}
          </p>
        </div>
      ) : (
        <button
          onClick={cycle.startCycle}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-sage-bg border border-sage-dim px-3.5 py-1.5 text-xs font-semibold text-sage transition-colors hover:bg-sage/20"
        >
          <span className="h-2 w-2 rounded-full bg-sage" />
          {t("home.startProgram")}
        </button>
      )}

      {/* Early deload suggestion */}
      {deloadStatus?.earlyDeloadSuggested && !earlyDeloadDismissed && (
        <div className="mt-3 rounded-[12px] bg-gold-bg border border-gold/30 px-4 py-3 flex items-start gap-3">
          <p className="text-[13px] text-gold leading-relaxed flex-1">
            ⚠️ {t("home.earlyDeload")}
          </p>
          <button
            onClick={() => setEarlyDeloadDismissed(true)}
            className="text-[11px] text-gold/70 font-semibold shrink-0 mt-0.5"
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
              {t("home.recoveryDay")}
            </h2>
            <p className="text-[13px] text-muted-foreground mt-1.5">
              {t("home.nextSession")}: {t(`dayFull.${nextWorkout.dayOfWeek}`)} — {isEs ? nextWorkout.labelEs : nextWorkout.label}
            </p>
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
