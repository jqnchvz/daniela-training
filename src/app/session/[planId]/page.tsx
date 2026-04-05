"use client";

import { use, useState } from "react";
import Image from "next/image";
import { useSessionStore } from "@/store/session-store";
import { useAppStore } from "@/store/app-store";
import { getExerciseById, WORKOUT_PLANS } from "@/lib/exercises";
import { EnergySlider } from "@/components/session/energy-slider";
import { RestTimer } from "@/components/session/rest-timer";

const WARMUP_ITEMS = [
  { icon: "🏃", text: "Treadmill walk — 5 min, 3% incline" },
  { icon: "🔄", text: "Arm circles + shoulder rolls — 2 min" },
  { icon: "💪", text: "Band pull-aparts — 2×15" },
  { icon: "🧱", text: "Wall slides — 2×10 slow" },
  { icon: "🐱", text: "Cat-cow + thoracic rotation — 3 min" },
];

const COOLDOWN_ITEMS = [
  { icon: "🌊", text: "Lat stretch — 60s each side" },
  { icon: "🔄", text: "Supine spinal twist — 60s each" },
  { icon: "💪", text: "Bicep/forearm stretch — 45s each" },
  { icon: "🌬", text: "Diaphragmatic breathing — 3 min" },
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

  if (!store.planId && plan) {
    store.startSession(planId);
  }

  if (!plan) {
    return (
      <div className="px-5 py-6">
        <p className="text-muted-foreground">Workout plan not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!isOnline && (
        <div className="mx-5 mt-3 rounded-[10px] bg-gold-bg border border-[#5a4a1a] px-3 py-2 text-xs text-gold">
          Offline — data will sync when reconnected
        </div>
      )}

      {store.phase === "pre-check" && <PreCheckPhase />}
      {store.phase === "warmup" && <WarmupPhase />}
      {store.phase === "working" && <WorkingPhase plan={plan} />}
      {store.phase === "cooldown" && <CooldownPhase />}
      {store.phase === "summary" && <SummaryPhase plan={plan} />}
    </div>
  );
}

function PreCheckPhase() {
  const { energyPre, setEnergyPre, setPhase } = useSessionStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4">⚡</div>
      <h2 className="font-heading text-[1.35rem] font-bold mb-2">Pre-session Check</h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-[280px]">
        Quick energy check before we start.
      </p>
      <div className="w-full max-w-[320px]">
        <EnergySlider value={energyPre} onChange={setEnergyPre} label="How's your energy?" />
        <button
          onClick={() => setPhase("warmup")}
          disabled={energyPre === null}
          className="mt-6 w-full rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-[#0f1f10] disabled:opacity-50 transition-all hover:bg-[#8dc88f]"
        >
          Start Warm-up →
        </button>
      </div>
    </div>
  );
}

function WarmupPhase() {
  const { setPhase } = useSessionStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4">🔥</div>
      <h2 className="font-heading text-[1.35rem] font-bold mb-2">Warm-up</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-[280px] leading-relaxed">
        Start with 5 min incline treadmill, then dynamic stretches. Take your time — this is non-negotiable for recovery.
      </p>
      <div className="w-full max-w-[320px] rounded-[16px] border border-border bg-card p-4 text-left">
        <div className="flex flex-col gap-2.5">
          {WARMUP_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => setPhase("working")}
        className="mt-6 w-full max-w-[320px] rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-[#0f1f10] transition-all hover:bg-[#8dc88f]"
      >
        Done with Warm-up →
      </button>
    </div>
  );
}

function WorkingPhase({ plan }: { plan: (typeof WORKOUT_PLANS)[number] }) {
  const store = useSessionStore();
  const currentPlanExercise = plan.exercises[store.currentExerciseIndex];
  const exercise = currentPlanExercise ? getExerciseById(currentPlanExercise.exerciseId) : null;
  const [setInputs, setSetInputs] = useState<Array<{ weight: string; reps: string }>>([]);

  // Initialize inputs when exercise changes
  const setsForExercise = store.completedSets.filter(
    (s) => s.exerciseId === exercise?.id,
  );

  if (!currentPlanExercise || !exercise) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">💪</div>
        <h2 className="font-heading text-lg font-bold mb-3">All exercises complete!</h2>
        <button
          onClick={() => store.setPhase("cooldown")}
          className="rounded-[16px] bg-sage px-8 py-4 font-heading text-[15px] font-bold text-[#0f1f10]"
        >
          Start Cool-down →
        </button>
      </div>
    );
  }

  const nextExIndex = store.currentExerciseIndex + 1;
  const nextPlanEx = plan.exercises[nextExIndex];
  const nextExercise = nextPlanEx ? getExerciseById(nextPlanEx.exerciseId) : null;

  // Initialize set inputs if needed
  if (setInputs.length === 0 && currentPlanExercise) {
    const initial = Array.from({ length: currentPlanExercise.sets }, () => ({
      weight: "0",
      reps: String(currentPlanExercise.reps),
    }));
    setSetInputs(initial);
  }

  const handleLogSet = (setIndex: number) => {
    const input = setInputs[setIndex];
    if (!input) return;

    store.logSet({
      exerciseId: exercise.id,
      setNumber: setIndex + 1,
      weight: Number(input.weight),
      reps: Number(input.reps),
      rpe: null,
      completed: true,
    });

    // Start rest timer if not last set
    if (setsForExercise.length + 1 < currentPlanExercise.sets) {
      store.setRestTimer(Date.now() + currentPlanExercise.restSeconds * 1000);
    }
  };

  const handleNextExercise = () => {
    store.nextExercise();
    setSetInputs([]);
  };

  const allSetsDone = setsForExercise.length >= currentPlanExercise.sets;
  const progressPercent = Math.round(
    ((store.currentExerciseIndex + (allSetsDone ? 1 : 0)) / plan.exercises.length) * 100,
  );

  return (
    <>
      {/* Header */}
      <div className="px-5 pt-5 flex items-center justify-between">
        <button onClick={() => (window.location.href = "/")} className="text-[13px] text-muted-foreground">
          ← End
        </button>
        <span className="rounded-full bg-sage-bg text-sage border border-sage-dim px-2.5 py-1 text-[11px] font-semibold">
          {plan.name.split("—")[0].trim()}
        </span>
      </div>

      {/* Progress */}
      <div className="px-5 pt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Exercise {store.currentExerciseIndex + 1} of {plan.exercises.length}</span>
          <span className="text-sage">Main Work</span>
        </div>
        <div className="h-1 rounded-full bg-surface3">
          <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Exercise card */}
      <div className="mx-5 mt-4 rounded-[20px] border border-border bg-card overflow-hidden">
        {/* Image area */}
        <div className="relative h-[200px] bg-surface2 flex items-center justify-center border-b border-border">
          {exercise.gifUrl ? (
            <Image src={exercise.gifUrl} alt={exercise.name} fill className="object-contain" unoptimized />
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
        {/* Info */}
        <div className="p-[18px]">
          <h2 className="font-heading text-[1.3rem] font-extrabold">{exercise.name}</h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed mt-1 mb-3.5">
            {exercise.notes}
          </p>
          <div className="flex gap-2.5">
            <TargetBox value={String(currentPlanExercise.sets)} label="Sets" highlight />
            <TargetBox value={String(currentPlanExercise.reps)} label="Reps" highlight />
            <TargetBox value={`${Math.floor(currentPlanExercise.restSeconds / 60)} min`} label="Rest" />
            <TargetBox value="—" label="Last wt." />
          </div>
        </div>
      </div>

      {/* Set logger */}
      <div className="px-5 mt-4">
        <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mb-3">
          Log your sets
        </p>
        {Array.from({ length: currentPlanExercise.sets }, (_, i) => {
          const isDone = i < setsForExercise.length;
          const input = setInputs[i] || { weight: "0", reps: String(currentPlanExercise.reps) };
          return (
            <div key={i} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-b-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 transition-colors ${
                isDone ? "bg-sage-dim text-sage border-sage-dim" : "bg-surface2 text-muted-foreground border-border"
              }`}>
                {i + 1}
              </div>
              <input
                type="number"
                value={isDone ? setsForExercise[i].weight : input.weight}
                disabled={isDone}
                onChange={(e) => {
                  const updated = [...setInputs];
                  updated[i] = { ...input, weight: e.target.value };
                  setSetInputs(updated);
                }}
                className="w-full rounded-lg border border-border bg-surface2 px-2.5 py-2 font-mono text-sm text-center disabled:opacity-50"
                placeholder="kg"
              />
              <span className="text-[11px] text-[#5a5550] shrink-0 w-5 text-center">×</span>
              <input
                type="number"
                value={isDone ? setsForExercise[i].reps : input.reps}
                disabled={isDone}
                onChange={(e) => {
                  const updated = [...setInputs];
                  updated[i] = { ...input, reps: e.target.value };
                  setSetInputs(updated);
                }}
                className="w-16 rounded-lg border border-border bg-surface2 px-2.5 py-2 font-mono text-sm text-center disabled:opacity-50"
                placeholder="reps"
              />
              <button
                disabled={isDone}
                onClick={() => handleLogSet(i)}
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isDone
                    ? "bg-sage border-sage text-[#0f1f10]"
                    : "border-[#3a3a3a] hover:border-sage"
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
            <p className="text-[10px] text-[#5a5550] tracking-[1px] uppercase font-semibold">Next up</p>
            <p className="font-semibold text-sm mt-0.5">{nextExercise.name}</p>
          </div>
          <span className="rounded-full bg-surface2 border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
            {nextPlanEx.sets}×{nextPlanEx.reps}
          </span>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex gap-2.5 px-5 mt-4 pb-28">
        {store.currentExerciseIndex > 0 && (
          <button
            onClick={() => {
              useSessionStore.setState((s) => ({
                currentExerciseIndex: Math.max(0, s.currentExerciseIndex - 1),
              }));
              setSetInputs([]);
            }}
            className="flex-[0.5] rounded-[16px] border border-[#3a3a3a] bg-surface2 py-3.5 font-heading text-sm font-semibold transition-colors hover:bg-surface3"
          >
            ‹ Prev
          </button>
        )}
        <button
          onClick={handleNextExercise}
          className="flex-1 rounded-[16px] bg-sage py-3.5 font-heading text-[15px] font-bold text-[#0f1f10] transition-all hover:bg-[#8dc88f]"
        >
          {allSetsDone ? "Next Exercise →" : "Skip →"}
        </button>
      </div>

      {/* Rest timer overlay */}
      <RestTimer />
    </>
  );
}

function CooldownPhase() {
  const store = useSessionStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4">🧘</div>
      <h2 className="font-heading text-[1.35rem] font-bold mb-2">Cool-down</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-[280px] leading-relaxed">
        10 minutes of stretching. This is when recovery begins — don&apos;t skip it.
      </p>
      <div className="w-full max-w-[320px] rounded-[16px] border border-border bg-card p-4 text-left">
        <div className="flex flex-col gap-2.5">
          {COOLDOWN_ITEMS.map((item, i) => (
            <div key={i} className="text-sm">
              {item.icon} {item.text}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => store.setPhase("summary")}
        className="mt-6 w-full max-w-[320px] rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-[#0f1f10]"
      >
        Complete Session ✓
      </button>
    </div>
  );
}

function SummaryPhase({ plan }: { plan: (typeof WORKOUT_PLANS)[number] }) {
  const store = useSessionStore();
  const [energy, setEnergy] = useState(4);
  const [sleep, setSleep] = useState(3);
  const [soreness, setSoreness] = useState(1);

  const totalVolume = store.completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const exercisesCompleted = new Set(store.completedSets.map((s) => s.exerciseId)).size;

  const handleComplete = () => {
    store.reset();
    window.location.href = "/";
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="w-[100px] h-[100px] rounded-full bg-sage-bg border-2 border-sage flex items-center justify-center text-[40px] mb-6">
        ✓
      </div>
      <h1 className="font-heading text-[2rem] font-extrabold leading-tight mb-2">
        Session<br />Complete!
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        {plan.name} · {exercisesCompleted} exercises · {totalVolume.toLocaleString()}kg volume
      </p>

      {/* Wellness inputs */}
      <div className="w-full max-w-[340px] rounded-[16px] border border-border bg-card p-4 text-left mb-4">
        <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mb-3">
          How did it feel?
        </p>
        <ScoreRow label="Energy" value={energy} onChange={setEnergy} />
        <ScoreRow label="Sleep last night" value={sleep} onChange={setSleep} />
        <ScoreRow label="Soreness" value={soreness} onChange={setSoreness} />
      </div>

      <button
        onClick={handleComplete}
        className="w-full max-w-[340px] rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-[#0f1f10]"
      >
        Back to Dashboard
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
                : "bg-surface2 text-muted-foreground border-border hover:border-[#3a3a3a]"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
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
      <p className="text-[10px] text-[#5a5550] mt-0.5">{label}</p>
    </div>
  );
}
