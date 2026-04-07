"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import { useSessionStore } from "@/store/session-store";
import { useAppStore } from "@/store/app-store";
import { useHistoryStore } from "@/store/history-store";
import { useCycleStore } from "@/store/cycle-store";
import { getExerciseById, getLiteExercises, WORKOUT_PLANS } from "@/lib/exercises";
import { EnergySlider } from "@/components/session/energy-slider";
import { RestTimer } from "@/components/session/rest-timer";
import { RpePicker } from "@/components/session/rpe-picker";
import { getSessionProtocol } from "@/lib/session-protocols";
import { useI18n, useT } from "@/lib/i18n";
import { detectRedFlags, type CheckinData } from "@/lib/checkin";
import { t } from "@/lib/i18n";
import { useAuthStore } from "@/store/auth-store";
import { getDefaultWeight } from "@/lib/default-weights";

export default function ActiveSessionPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = use(params);
  const plan = WORKOUT_PLANS.find((p) => p.id === planId);
  const store = useSessionStore();
  const isOnline = useAppStore((s) => s.isOnline);
  const t = useT();

  // Initialize session in useEffect to avoid side effects during render
  useEffect(() => {
    if (!store.planId && plan) {
      store.startSession(planId);
    }
  }, [store, store.planId, plan, planId]);

  if (!plan) {
    return (
      <div className="px-5 py-6">
        <p className="text-muted-foreground">{t("common.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!isOnline && (
        <div className="mx-5 mt-3 rounded-[10px] bg-gold-bg border border-gold/30 px-3 py-2 text-xs text-gold">
          {t("common.offline")}
        </div>
      )}

      {store.phase === "pre-check" && <PreCheckPhase />}
      {store.phase === "warmup" && <WarmupPhase planId={planId} />}
      {store.phase === "working" && <WorkingPhase plan={plan} />}
      {store.phase === "cooldown" && <CooldownPhase planId={planId} />}
      {store.phase === "summary" && <SummaryPhase plan={plan} />}
    </div>
  );
}

function PreCheckPhase() {
  const t = useT();
  const locale = useI18n((s) => s.locale);
  const { energyPre, setEnergyPre, setPhase, sessionMode, setSessionMode } = useSessionStore();
  const checkins = useHistoryStore((s) => s.checkins);

  // Check soreness from latest check-in
  const redFlags = detectRedFlags(
    checkins.map((c) => ({ ...c, sleepHours: c.sleepHours ?? null })),
  );

  const showModeSelector = energyPre !== null && energyPre <= 4;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4">⚡</div>
      <h2 className="font-heading text-[1.35rem] font-bold mb-2">{t("session.preCheck")}</h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-[280px]">
        {t("session.quickCheck")}
      </p>

      {redFlags.hasSorenessFlag && (
        <div className="w-full max-w-[320px] mb-6 rounded-[12px] bg-gold-bg border border-gold/30 px-4 py-3 text-left">
          <p className="text-[13px] text-gold leading-relaxed">
            ⚠️ {t("session.sorenessWarning").replace("{score}", String(redFlags.latestSoreness))}
          </p>
        </div>
      )}

      <div className="w-full max-w-[320px]">
        <EnergySlider value={energyPre} onChange={setEnergyPre} label={t("session.energyQuestion")} />

        {showModeSelector && (
          <div className="mt-5 rounded-[12px] border border-border bg-card p-4 text-left">
            <p className="text-[13px] text-muted-foreground mb-1">
              {t("session.lowEnergyPrompt")}
            </p>
            <p className="text-[11px] text-muted-foreground/60 mb-3">
              {locale === "es"
                ? "Forzar con poca energía puede elevar el cortisol y suprimir más la función tiroidea."
                : "Pushing through low energy can spike cortisol and further suppress thyroid function."}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSessionMode("full")}
                className={`flex-1 rounded-[10px] border py-2.5 text-[13px] font-semibold transition-colors ${
                  sessionMode === "full"
                    ? "bg-sage-bg text-sage border-sage-dim"
                    : "bg-surface2 text-muted-foreground border-border"
                }`}
              >
                {t("session.fullSession")}
              </button>
              <button
                onClick={() => setSessionMode("lite")}
                className={`flex-1 rounded-[10px] border py-2.5 text-[13px] font-semibold transition-colors ${
                  sessionMode === "lite"
                    ? "bg-sage-bg text-sage border-sage-dim"
                    : "bg-surface2 text-muted-foreground border-border"
                }`}
              >
                {t("session.liteSession")}
              </button>
            </div>
            {sessionMode === "lite" && (
              <p className="text-[11px] text-sage mt-2">{t("session.liteDesc")}</p>
            )}
          </div>
        )}

        <button
          onClick={() => setPhase("warmup")}
          disabled={energyPre === null}
          className="mt-6 w-full rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-primary-foreground disabled:opacity-50 transition-all hover:bg-sage/80"
        >
          {t("session.startWarmup")}
        </button>
      </div>
    </div>
  );
}

function WarmupPhase({ planId }: { planId: string }) {
  const t = useT();
  const locale = useI18n((s) => s.locale);
  const { setPhase } = useSessionStore();
  const protocol = getSessionProtocol(planId);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4">🔥</div>
      <h2 className="font-heading text-[1.35rem] font-bold mb-1">{t("session.warmup")}</h2>
      <p className="text-xs text-sage font-semibold mb-4">
        {protocol.warmupMinutes} min · {protocol.focus}
      </p>
      <p className="text-sm text-muted-foreground mb-6 max-w-[280px] leading-relaxed">
        {t("session.warmupDesc")}
      </p>
      <div className="w-full max-w-[340px] rounded-[16px] border border-border bg-card p-4 text-left">
        <div className="flex flex-col gap-3">
          {protocol.warmup.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[13px]">
              <span className="flex items-center gap-2.5">
                <span>{item.icon}</span>
                <span>{locale === "es" ? item.textEs : item.text}</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
                {item.duration}
              </span>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => setPhase("working")}
        className="mt-6 w-full max-w-[340px] rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-primary-foreground transition-all hover:bg-sage/80"
      >
        {t("session.doneWarmup")}
      </button>
    </div>
  );
}

function WorkingPhase({ plan }: { plan: (typeof WORKOUT_PLANS)[number] }) {
  const t = useT();
  const locale = useI18n((s) => s.locale);
  const store = useSessionStore();
  const getLastWeight = useHistoryStore((s) => s.getLastWeightForExercise);
  const experienceLevel = useAuthStore((s) => s.experienceLevel);
  const exercises = store.sessionMode === "lite"
    ? getLiteExercises(plan.exercises)
    : plan.exercises;
  const currentExIndex = store.currentExerciseIndex;
  const currentPlanExercise = exercises[currentExIndex];
  const exercise = currentPlanExercise ? getExerciseById(currentPlanExercise.exerciseId) : null;

  const lastWeight = exercise ? getLastWeight(exercise.id) : null;

  // Animate between exercise image frames
  const [showFrame2, setShowFrame2] = useState(false);
  useEffect(() => {
    if (!exercise?.gifUrl || !exercise?.gifUrl2) return;
    const interval = setInterval(() => setShowFrame2((prev) => !prev), 1200);
    return () => clearInterval(interval);
  }, [exercise?.gifUrl, exercise?.gifUrl2]);

  const currentImageUrl = showFrame2 && exercise?.gifUrl2 ? exercise.gifUrl2 : exercise?.gifUrl;

  // RPE picker state — shown after logging a set, before rest timer
  const [showRpePicker, setShowRpePicker] = useState(false);
  const [pendingRestTimer, setPendingRestTimer] = useState<{ duration: number; nextInfo: string | null } | null>(null);

  // Track set inputs per exercise — reset when exercise index changes
  const [setInputs, setSetInputs] = useState<Array<{ weight: string; reps: string }>>([]);
  const [lastExIndex, setLastExIndex] = useState(currentExIndex);

  useEffect(() => {
    if (currentExIndex !== lastExIndex || setInputs.length === 0) {
      if (currentPlanExercise) {
        const prefillWeight = exercise ? getLastWeight(exercise.id) : null;
        const defaultWt = exercise ? getDefaultWeight(exercise.id, experienceLevel) : 0;
        const suggestedWeight = prefillWeight ?? defaultWt;
        setSetInputs(
          Array.from({ length: currentPlanExercise.sets }, () => ({
            weight: String(suggestedWeight),
            reps: String(currentPlanExercise.reps),
          })),
        );
      }
      setLastExIndex(currentExIndex);
    }
  }, [currentExIndex, lastExIndex, currentPlanExercise, setInputs.length, exercise, getLastWeight]);

  if (!currentPlanExercise || !exercise) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">💪</div>
        <h2 className="font-heading text-lg font-bold mb-3">{t("session.allComplete")}</h2>
        <button
          onClick={() => store.setPhase("cooldown")}
          className="rounded-[16px] bg-sage px-8 py-4 font-heading text-[15px] font-bold text-primary-foreground"
        >
          {t("session.startCooldown")}
        </button>
      </div>
    );
  }

  const setsForExercise = store.completedSets.filter(
    (s) => s.exerciseId === exercise.id,
  );

  const nextExIndex = currentExIndex + 1;
  const nextPlanEx = exercises[nextExIndex];
  const nextExercise = nextPlanEx ? getExerciseById(nextPlanEx.exerciseId) : null;

  const handleLogSet = (setIndex: number) => {
    // Only allow logging the next unlogged set (sequential order)
    if (setIndex !== setsForExercise.length) return;

    const input = setInputs[setIndex];
    if (!input) return;

    const weight = Math.max(0, Number(input.weight) || 0);
    const reps = Math.max(1, Number(input.reps) || 1);

    store.logSet({
      exerciseId: exercise.id,
      setNumber: setIndex + 1,
      weight,
      reps,
      rpe: null,
      completed: true,
    });

    // Prepare rest timer (will start after RPE selection)
    if (setsForExercise.length + 1 < currentPlanExercise.sets) {
      const remainingSets = currentPlanExercise.sets - (setsForExercise.length + 1);
      const nextInfo = remainingSets > 0
        ? `Set ${setsForExercise.length + 2}/${currentPlanExercise.sets} · ${locale === "es" ? (exercise?.nameEs ?? exercise?.name) : exercise?.name}`
        : nextExercise
          ? `${locale === "es" ? nextExercise.nameEs : nextExercise.name} · ${nextPlanEx.sets}×${nextPlanEx.reps}`
          : null;
      setPendingRestTimer({ duration: currentPlanExercise.restSeconds, nextInfo });
    } else {
      setPendingRestTimer(null);
    }
    setShowRpePicker(true);
  };

  const handleRpeSelect = (rpe: number) => {
    store.updateLastSetRpe(rpe);
    setShowRpePicker(false);
    if (pendingRestTimer) {
      store.setRestTimer(Date.now() + pendingRestTimer.duration * 1000, pendingRestTimer.nextInfo);
      setPendingRestTimer(null);
    }
  };

  const handleRpeSkip = () => {
    setShowRpePicker(false);
    if (pendingRestTimer) {
      store.setRestTimer(Date.now() + pendingRestTimer.duration * 1000, pendingRestTimer.nextInfo);
      setPendingRestTimer(null);
    }
  };

  const handleNextExercise = () => {
    // Trigger inter-exercise rest only when all sets are completed (not skipping)
    if (allSetsDone && nextExercise && nextPlanEx) {
      const currentCategory = exercise?.category ?? "compound";
      const nextCategory = nextExercise.category;
      // Rest duration based on exercise types being transitioned
      const interRestSeconds =
        currentCategory === "compound" && nextCategory === "compound" ? 180
        : currentCategory === "compound" || nextCategory === "compound" ? 150
        : 120;
      const nextInfo = `${locale === "es" ? nextExercise.nameEs : nextExercise.name} · ${nextPlanEx.sets}×${nextPlanEx.reps}`;
      store.setRestTimer(Date.now() + interRestSeconds * 1000, nextInfo);
    }
    store.nextExercise();
  };

  const handlePrevExercise = () => {
    if (currentExIndex > 0) {
      useSessionStore.setState((s) => ({
        currentExerciseIndex: s.currentExerciseIndex - 1,
      }));
    }
  };

  const allSetsDone = setsForExercise.length >= currentPlanExercise.sets;
  const progressPercent = Math.round(
    ((currentExIndex + (allSetsDone ? 1 : 0)) / exercises.length) * 100,
  );

  return (
    <>
      {/* Header */}
      <div className="px-5 pt-5 flex items-center justify-between">
        <button onClick={() => (window.location.href = "/")} className="text-[13px] text-muted-foreground">
          {t("session.endSession")}
        </button>
        <div className="flex items-center gap-2">
          {store.sessionMode === "lite" && (
            <span className="rounded-full bg-gold-bg text-gold border border-gold/30 px-2 py-0.5 text-[10px] font-semibold">
              {t("session.liteActive")}
            </span>
          )}
          <span className="rounded-full bg-sage-bg text-sage border border-sage-dim px-2.5 py-1 text-[11px] font-semibold">
            {plan.name.split("—")[0].trim()}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 pt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>{t("session.exerciseOf").replace("{current}", String(currentExIndex + 1)).replace("{total}", String(exercises.length))}</span>
          <span className="text-sage">{t("session.mainWork")}</span>
        </div>
        <div className="h-1 rounded-full bg-surface3">
          <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Exercise card */}
      <div className="mx-5 mt-4 rounded-[20px] border border-border bg-card overflow-hidden">
        <div className="relative h-[200px] bg-surface2 flex items-center justify-center border-b border-border">
          {currentImageUrl ? (
            <Image key={currentImageUrl} src={currentImageUrl} alt={exercise.name} fill className="object-contain transition-opacity duration-300" unoptimized />
          ) : (
            <span className="text-6xl">💪</span>
          )}
          <div className="absolute bottom-2.5 left-2.5 flex gap-1.5 flex-wrap">
            {exercise.muscleGroups.slice(0, 3).map((mg) => (
              <span key={mg} className="rounded-full bg-sage-bg text-sage border border-sage-dim px-2 py-0.5 text-[10px] font-semibold">
                {mg.replace("_", " ")}
              </span>
            ))}
          </div>
        </div>
        <div className="p-[18px]">
          <h2 className="font-heading text-[1.3rem] font-extrabold">{locale === "es" ? exercise.nameEs : exercise.name}</h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed mt-1 mb-3.5">
            {locale === "es" ? exercise.notesEs : exercise.notes}
          </p>
          <div className="flex gap-2.5">
            <TargetBox value={String(currentPlanExercise.sets)} label={t("session.sets")} highlight />
            <TargetBox value={String(currentPlanExercise.reps)} label={t("session.reps")} highlight />
            <TargetBox value={`${Math.floor(currentPlanExercise.restSeconds / 60)} min`} label={t("session.rest")} />
            <TargetBox
              value={lastWeight ? `${lastWeight} kg` : getDefaultWeight(exercise.id, experienceLevel) > 0 ? `~${getDefaultWeight(exercise.id, experienceLevel)} kg` : "—"}
              label={lastWeight ? t("session.lastWt") : t("session.suggested")}
            />
          </div>
          <HypothyroidInfo restSeconds={currentPlanExercise.restSeconds} reps={currentPlanExercise.reps} isCompound={exercise.category === "compound"} />
        </div>
      </div>

      {/* Set logger */}
      <div className="px-5 mt-4">
        <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mb-3">
          {t("session.logSets")}
        </p>
        {Array.from({ length: currentPlanExercise.sets }, (_, i) => {
          const isDone = i < setsForExercise.length;
          const isNext = i === setsForExercise.length;
          const input = setInputs[i] || { weight: "0", reps: String(currentPlanExercise.reps) };
          return (
            <div key={i} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-b-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 transition-colors ${
                isDone ? "bg-sage-dim text-sage border-sage-dim" : "bg-surface2 text-muted-foreground border-border"
              }`}>
                {i + 1}
              </div>
              <div className="relative w-full">
                <input
                  type="number"
                  step="2.5"
                  inputMode="decimal"
                  value={isDone ? setsForExercise[i].weight : input.weight}
                  disabled={isDone || !isNext}
                  onChange={(e) => {
                    const updated = [...setInputs];
                    updated[i] = { ...input, weight: e.target.value };
                    setSetInputs(updated);
                  }}
                  className="w-full rounded-lg border border-border bg-surface2 pl-2.5 pr-8 py-2 font-mono text-sm text-center disabled:opacity-40"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono pointer-events-none">
                  kg
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground shrink-0 w-5 text-center">×</span>
              <input
                type="number"
                value={isDone ? setsForExercise[i].reps : input.reps}
                disabled={isDone || !isNext}
                onChange={(e) => {
                  const updated = [...setInputs];
                  updated[i] = { ...input, reps: e.target.value };
                  setSetInputs(updated);
                }}
                className="w-16 rounded-lg border border-border bg-surface2 px-2.5 py-2 font-mono text-sm text-center disabled:opacity-40"
                placeholder="reps"
              />
              <button
                disabled={isDone || !isNext}
                onClick={() => handleLogSet(i)}
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isDone
                    ? "bg-sage border-sage text-primary-foreground"
                    : isNext
                      ? "border-sage hover:bg-sage/20 cursor-pointer"
                      : "border-border opacity-40"
                }`}
              >
                {isDone ? "✓" : ""}
              </button>
            </div>
          );
        })}
      </div>

      {/* Next exercise preview */}
      {nextExercise && (
        <div className="mx-5 mt-4 flex items-center gap-3 rounded-[16px] border border-border bg-surface2 p-3.5">
          <span className="text-[22px] w-11 text-center shrink-0">👁</span>
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground tracking-[1px] uppercase font-semibold">{t("session.nextUp")}</p>
            <p className="font-semibold text-sm mt-0.5">{locale === "es" ? nextExercise.nameEs : nextExercise.name}</p>
          </div>
          <span className="rounded-full bg-surface2 border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
            {nextPlanEx.sets}×{nextPlanEx.reps}
          </span>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex gap-2.5 px-5 mt-4 pb-28">
        {currentExIndex > 0 && (
          <button
            onClick={handlePrevExercise}
            className="flex-[0.5] rounded-[16px] border border-border bg-surface2 py-3.5 font-heading text-sm font-semibold transition-colors hover:bg-surface3"
          >
            {t("session.prev")}
          </button>
        )}
        <button
          onClick={handleNextExercise}
          className="flex-1 rounded-[16px] bg-sage py-3.5 font-heading text-[15px] font-bold text-primary-foreground transition-all hover:bg-sage/80"
        >
          {allSetsDone ? t("session.nextExercise") : t("session.skip")}
        </button>
      </div>

      {/* RPE picker overlay */}
      {showRpePicker && <RpePicker onSelect={handleRpeSelect} onSkip={handleRpeSkip} />}

      {/* Rest timer overlay */}
      <RestTimer />
    </>
  );
}

function CooldownPhase({ planId }: { planId: string }) {
  const t = useT();
  const locale = useI18n((s) => s.locale);
  const store = useSessionStore();
  const protocol = getSessionProtocol(planId);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4">🧘</div>
      <h2 className="font-heading text-[1.35rem] font-bold mb-1">{t("session.cooldown")}</h2>
      <p className="text-xs text-dt-blue font-semibold mb-4">
        {protocol.cooldownMinutes} min · {protocol.focus}
      </p>
      <p className="text-sm text-muted-foreground mb-6 max-w-[280px] leading-relaxed">
        {t("session.cooldownDesc")}
      </p>
      <div className="w-full max-w-[340px] rounded-[16px] border border-border bg-card p-4 text-left">
        <div className="flex flex-col gap-3">
          {protocol.cooldown.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[13px]">
              <span className="flex items-center gap-2.5">
                <span>{item.icon}</span>
                <span>{locale === "es" ? item.textEs : item.text}</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
                {item.duration}
              </span>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => store.setPhase("summary")}
        className="mt-6 w-full max-w-[340px] rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-primary-foreground"
      >
        {t("session.completeSession")}
      </button>
    </div>
  );
}

function SummaryPhase({ plan }: { plan: (typeof WORKOUT_PLANS)[number] }) {
  const t = useT();
  const locale = useI18n((s) => s.locale);
  const store = useSessionStore();
  const addSession = useHistoryStore((s) => s.addSession);
  const incrementSessions = useCycleStore((s) => s.incrementSessions);
  const activeUserId = useAuthStore((s) => s.activeUserId);
  const [energy, setEnergy] = useState(4);
  const [sleep, setSleep] = useState(3);
  const [soreness, setSoreness] = useState(1);

  const totalVolume = store.completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const exercisesCompleted = new Set(store.completedSets.map((s) => s.exerciseId)).size;
  const totalSets = store.completedSets.length;
  const rpeSets = store.completedSets.filter((s) => s.rpe !== null);
  const avgRpe = rpeSets.length > 0
    ? (rpeSets.reduce((sum, s) => sum + s.rpe!, 0) / rpeSets.length).toFixed(1)
    : null;

  const sessionStart = store.workingStartedAt ?? store.startedAt;
  const duration = sessionStart
    ? Math.round((Date.now() - new Date(sessionStart).getTime()) / 60000)
    : 0;

  const handleComplete = () => {
    // Save session to persistent history
    addSession({
      id: crypto.randomUUID(),
      userId: activeUserId ?? undefined,
      planId: plan.id,
      planName: plan.name,
      date: new Date().toISOString().split("T")[0],
      startedAt: store.startedAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMinutes: duration,
      energyPre: store.energyPre,
      energyPost: energy,
      sleepScore: sleep,
      sorenessScore: soreness,
      sets: store.completedSets.map((s) => ({
        exerciseId: s.exerciseId,
        exerciseName: getExerciseById(s.exerciseId)?.name ?? "Unknown",
        setNumber: s.setNumber,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe,
      })),
      notes: store.notes,
    });

    incrementSessions();
    store.reset();
    window.location.href = "/";
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="w-[100px] h-[100px] rounded-full bg-sage-bg border-2 border-sage flex items-center justify-center text-[40px] mb-6">
        ✓
      </div>
      <h1 className="font-heading text-[2rem] font-extrabold leading-tight mb-2 whitespace-pre-line">
        {t("session.sessionComplete")}
      </h1>
      <p className="text-sm text-muted-foreground mb-2">
        {plan.name}
      </p>
      <div className="flex gap-4 text-xs text-muted-foreground mb-8">
        <span>⏱ {duration} {t("common.min")}</span>
        <span>📋 {exercisesCompleted} {t("common.exercises")}</span>
        <span>💪 {totalSets} {t("common.sets")}</span>
        {totalVolume > 0 && <span>🏋️ {totalVolume.toLocaleString()} kg</span>}
        {avgRpe && <span>🎯 RPE {avgRpe}</span>}
      </div>

      {/* Wellness inputs */}
      <div className="w-full max-w-[340px] rounded-[16px] border border-border bg-card p-4 text-left mb-4">
        <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mb-3">
          {t("session.howDidItFeel")}
        </p>
        <ScoreRow label={t("home.energy")} value={energy} onChange={setEnergy} />
        <ScoreRow label={t("session.sleepLastNight")} value={sleep} onChange={setSleep} />
        <ScoreRow label={t("home.soreness")} value={soreness} onChange={setSoreness} />
      </div>

      <button
        onClick={handleComplete}
        className="w-full max-w-[340px] rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-primary-foreground"
      >
        {t("session.backToDashboard")}
      </button>
    </div>
  );
}

function ScoreRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-[13px] text-muted-foreground mb-1.5">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`flex-1 rounded-[10px] border py-2.5 font-heading text-[15px] font-bold transition-colors ${
              value === v
                ? "bg-sage-bg text-sage border-sage-dim"
                : "bg-surface2 text-muted-foreground border-border hover:border-border"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function HypothyroidInfo({
  restSeconds,
  reps,
  isCompound,
}: {
  restSeconds: number;
  reps: number;
  isCompound: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const locale = useI18n((s) => s.locale);
  const isEs = locale === "es";

  const restMin = Math.floor(restSeconds / 60);
  const restSec = restSeconds % 60;
  const restLabel = restSec > 0 ? `${restMin}:${String(restSec).padStart(2, "0")}` : `${restMin} min`;

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[11px] text-sage font-semibold"
      >
        <span>ℹ️</span>
        <span>{isEs ? "¿Por qué estos valores?" : "Why these values?"}</span>
        <span className="text-[9px]">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="mt-2 rounded-[10px] bg-surface2 border border-border p-3 text-[12px] text-muted-foreground leading-relaxed space-y-2">
          <p>
            <span className="font-semibold text-foreground">{isEs ? "Descanso" : "Rest"} ({restLabel}):</span>{" "}
            {isEs
              ? isCompound
                ? "Los descansos más largos en ejercicios compuestos permiten una recuperación completa del sistema nervioso central, algo crucial con hipotiroidismo ya que el metabolismo más lento afecta la capacidad de recuperación."
                : "Los ejercicios accesorios requieren menos descanso al trabajar grupos musculares más pequeños con menor carga sobre el sistema nervioso."
              : isCompound
                ? "Longer rest on compound lifts allows full CNS recovery — crucial with hypothyroidism since slower metabolism affects recovery capacity."
                : "Accessory exercises need less rest as they work smaller muscle groups with less nervous system demand."}
          </p>
          <p>
            <span className="font-semibold text-foreground">{isEs ? "Repeticiones" : "Reps"} ({reps}):</span>{" "}
            {isEs
              ? reps >= 12
                ? "Las repeticiones más altas construyen capacidad de trabajo y resistencia muscular — ideal en la fase de estabilización para perfeccionar la técnica."
                : reps >= 8
                  ? "El rango de hipertrofia estándar promueve el crecimiento muscular mientras mantiene un esfuerzo moderado sobre la tiroides."
                  : "Menos repeticiones con más peso desarrollan fuerza máxima — los descansos más largos compensan la mayor demanda al sistema."
              : reps >= 12
                ? "Higher reps build work capacity and muscular endurance — ideal in the stabilization phase for mastering form."
                : reps >= 8
                  ? "Standard hypertrophy range promotes muscle growth while keeping moderate thyroid stress."
                  : "Lower reps with heavier weight build maximal strength — longer rest compensates for the higher system demand."}
          </p>
          <p>
            <span className="font-semibold text-foreground">{isEs ? "Duración" : "Duration"} (~45 min):</span>{" "}
            {isEs
              ? "Las sesiones están diseñadas para ~45 min de trabajo para mantenerse dentro de la ventana segura de cortisol en entrenamiento con hipotiroidismo."
              : "Sessions are designed for ~45 min of work to stay within the cortisol-safe window for hypothyroid training."}
          </p>
        </div>
      )}
    </div>
  );
}

function TargetBox({
  value,
  label,
  highlight = false,
}: {
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex-1 rounded-[10px] bg-surface2 p-2.5 text-center">
      <p className={`font-heading text-[1.1rem] font-bold ${highlight ? "text-sage" : "text-muted-foreground text-[0.9rem]"}`}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
