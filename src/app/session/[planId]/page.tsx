"use client";

import { use } from "react";
import { useSessionStore } from "@/store/session-store";
import { useAppStore } from "@/store/app-store";
import { getExerciseById, WORKOUT_PLANS } from "@/lib/exercises";
import { EnergySlider } from "@/components/session/energy-slider";
import { RestTimer } from "@/components/session/rest-timer";
import { Checklist } from "@/components/session/checklist";
import { useState } from "react";

const WARMUP_ITEMS = [
  "5 min light cardio (walking/cycling)",
  "5 min dynamic stretches",
  "2-3 min movement prep (light weight)",
];

const COOLDOWN_ITEMS = [
  "5 min light walking",
  "5 min static stretches",
  "2 min breathing (4-7-8 pattern)",
];

export default function ActiveSessionPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = use(params);
  const plan = WORKOUT_PLANS.find((p) => p.id === planId);
  const store = useSessionStore();
  const isOnline = useAppStore((s) => s.isOnline);

  // Initialize session if not started
  if (!store.planId && plan) {
    store.startSession(planId);
  }

  if (!plan) {
    return (
      <div className="px-4 py-6">
        <p className="text-muted-foreground">Workout plan not found.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {!isOnline && (
        <div className="mb-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 text-xs text-yellow-600 dark:text-yellow-400">
          Offline — data will sync when reconnected
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">{plan.name}</h1>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {store.phase.replace("-", " ")}
        </span>
      </div>

      {store.phase === "pre-check" && <PreCheckPhase />}
      {store.phase === "warmup" && <WarmupPhase />}
      {store.phase === "working" && <WorkingPhase plan={plan} />}
      {store.phase === "cooldown" && <CooldownPhase plan={plan} />}
      {store.phase === "summary" && <SummaryPhase plan={plan} />}
    </div>
  );
}

function PreCheckPhase() {
  const { energyPre, setEnergyPre, setPhase } = useSessionStore();

  return (
    <div className="space-y-6">
      <EnergySlider
        value={energyPre}
        onChange={setEnergyPre}
        label="How's your energy right now?"
      />
      <button
        onClick={() => setPhase("warmup")}
        disabled={energyPre === null}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        Start Warm-up
      </button>
    </div>
  );
}

function WarmupPhase() {
  const { warmupChecklist, toggleWarmup, setPhase } = useSessionStore();
  const allChecked = warmupChecklist.every(Boolean);

  return (
    <div className="space-y-6">
      <Checklist
        items={WARMUP_ITEMS}
        checked={warmupChecklist}
        onToggle={toggleWarmup}
      />
      <button
        onClick={() => setPhase("working")}
        disabled={!allChecked}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        Start Workout
      </button>
    </div>
  );
}

function WorkingPhase({
  plan,
}: {
  plan: (typeof WORKOUT_PLANS)[number];
}) {
  const store = useSessionStore();
  const currentPlanExercise = plan.exercises[store.currentExerciseIndex];
  const exercise = currentPlanExercise
    ? getExerciseById(currentPlanExercise.exerciseId)
    : null;

  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(currentPlanExercise?.reps ?? 10);
  const [rpe, setRpe] = useState<number | null>(null);

  if (!currentPlanExercise || !exercise) {
    // All exercises done
    return (
      <div className="space-y-6 text-center">
        <p className="text-lg font-medium">All exercises complete!</p>
        <button
          onClick={() => store.setPhase("cooldown")}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
        >
          Start Cool-down
        </button>
      </div>
    );
  }

  const setsForExercise = store.completedSets.filter(
    (s) => s.exerciseId === exercise.id,
  );
  const setsRemaining = currentPlanExercise.sets - setsForExercise.length;
  const allSetsDone = setsRemaining <= 0;

  const handleLogSet = () => {
    store.logSet({
      exerciseId: exercise.id,
      setNumber: setsForExercise.length + 1,
      weight,
      reps,
      rpe,
      completed: true,
    });

    // Start rest timer if more sets remaining
    if (setsForExercise.length + 1 < currentPlanExercise.sets) {
      store.setRestTimer(Date.now() + currentPlanExercise.restSeconds * 1000);
    }
  };

  const handleNextExercise = () => {
    store.nextExercise();
    setWeight(0);
    setReps(plan.exercises[store.currentExerciseIndex + 1]?.reps ?? 10);
    setRpe(null);
  };

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Exercise {store.currentExerciseIndex + 1}/{plan.exercises.length}
        </span>
        <span>
          Set {Math.min(setsForExercise.length + 1, currentPlanExercise.sets)}/
          {currentPlanExercise.sets}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{
            width: `${(store.currentExerciseIndex / plan.exercises.length) * 100}%`,
          }}
        />
      </div>

      {/* Exercise name */}
      <div className="pt-2">
        <h2 className="text-2xl font-bold">{exercise.name}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Target: {currentPlanExercise.sets} x {currentPlanExercise.reps} reps
        </p>
        {exercise.notes && (
          <p className="text-xs text-muted-foreground mt-1 italic">
            {exercise.notes}
          </p>
        )}
      </div>

      {/* Completed sets */}
      {setsForExercise.length > 0 && (
        <div className="space-y-1">
          {setsForExercise.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-2 text-sm"
            >
              <span className="text-primary">✓</span>
              <span>
                Set {s.setNumber}: {s.weight}kg x {s.reps}
              </span>
              {s.rpe && (
                <span className="text-xs text-muted-foreground ml-auto">
                  RPE {s.rpe}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rest timer */}
      <RestTimer />

      {/* Input controls */}
      {!allSetsDone && !store.restTimerEnd && (
        <div className="space-y-4 pt-2">
          {/* Weight input */}
          <div>
            <label className="text-xs text-muted-foreground">Weight (kg)</label>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setWeight(Math.max(0, weight - 2.5))}
                className="flex h-12 w-14 items-center justify-center rounded-lg border border-border bg-card text-lg font-medium"
              >
                -2.5
              </button>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                step={0.5}
                min={0}
                className="h-12 flex-1 rounded-lg border border-border bg-card px-3 text-center text-xl font-bold"
              />
              <button
                onClick={() => setWeight(weight + 2.5)}
                className="flex h-12 w-14 items-center justify-center rounded-lg border border-border bg-card text-lg font-medium"
              >
                +2.5
              </button>
            </div>
          </div>

          {/* Reps input */}
          <div>
            <label className="text-xs text-muted-foreground">Reps</label>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setReps(Math.max(1, reps - 1))}
                className="flex h-12 w-14 items-center justify-center rounded-lg border border-border bg-card text-lg font-medium"
              >
                -1
              </button>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                min={1}
                className="h-12 flex-1 rounded-lg border border-border bg-card px-3 text-center text-xl font-bold"
              />
              <button
                onClick={() => setReps(reps + 1)}
                className="flex h-12 w-14 items-center justify-center rounded-lg border border-border bg-card text-lg font-medium"
              >
                +1
              </button>
            </div>
          </div>

          {/* RPE (compact) */}
          <div>
            <label className="text-xs text-muted-foreground">
              RPE (optional)
            </label>
            <div className="flex gap-1 mt-1">
              {[6, 7, 8, 9, 10].map((v) => (
                <button
                  key={v}
                  onClick={() => setRpe(rpe === v ? null : v)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    rpe === v
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Log set button */}
          <button
            onClick={handleLogSet}
            className="w-full rounded-lg bg-primary px-4 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Log Set ✓
          </button>
        </div>
      )}

      {/* Next exercise / Skip */}
      {allSetsDone && (
        <button
          onClick={handleNextExercise}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
        >
          Next Exercise →
        </button>
      )}

      {!allSetsDone && (
        <button
          onClick={handleNextExercise}
          className="w-full text-xs text-muted-foreground underline py-2"
        >
          Skip exercise
        </button>
      )}
    </div>
  );
}

function CooldownPhase({
  plan,
}: {
  plan: (typeof WORKOUT_PLANS)[number];
}) {
  const store = useSessionStore();
  const allChecked = store.cooldownChecklist.every(Boolean);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Great work! Time to cool down.
      </p>
      <Checklist
        items={COOLDOWN_ITEMS}
        checked={store.cooldownChecklist}
        onToggle={store.toggleCooldown}
      />
      <EnergySlider
        value={store.energyPost}
        onChange={store.setEnergyPost}
        label="How's your energy now?"
      />
      <button
        onClick={() => store.setPhase("summary")}
        disabled={!allChecked}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        View Summary
      </button>
    </div>
  );
}

function SummaryPhase({
  plan,
}: {
  plan: (typeof WORKOUT_PLANS)[number];
}) {
  const store = useSessionStore();
  const [notes, setNotes] = useState(store.notes);

  const totalVolume = store.completedSets.reduce(
    (sum, s) => sum + s.weight * s.reps,
    0,
  );

  const exercisesCompleted = new Set(
    store.completedSets.map((s) => s.exerciseId),
  ).size;

  const duration = store.startedAt
    ? Math.round((Date.now() - new Date(store.startedAt).getTime()) / 60000)
    : 0;

  const handleComplete = () => {
    store.setNotes(notes);
    // In a full implementation, this would save to Supabase
    // For now, just reset the session
    store.reset();
    window.location.href = "/";
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-bold mb-3">Session Complete!</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Duration</p>
            <p className="font-medium">{duration} min</p>
          </div>
          <div>
            <p className="text-muted-foreground">Exercises</p>
            <p className="font-medium">
              {exercisesCompleted}/{plan.exercises.length}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Total volume</p>
            <p className="font-medium">{totalVolume.toLocaleString()} kg</p>
          </div>
          <div>
            <p className="text-muted-foreground">Energy</p>
            <p className="font-medium">
              {store.energyPre ?? "-"} → {store.energyPost ?? "-"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did the session feel?"
          maxLength={200}
          className="mt-1 w-full rounded-lg border border-border bg-card p-3 text-sm resize-none h-20"
        />
      </div>

      <button
        onClick={handleComplete}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
      >
        Complete Session
      </button>
    </div>
  );
}
