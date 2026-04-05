"use client";

import Link from "next/link";
import { WORKOUT_PLANS, getExerciseById } from "@/lib/exercises";

export default function SessionPage() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">Workout Session</h1>
      <p className="text-muted-foreground text-sm mt-1">
        Select a workout to start.
      </p>

      <div className="mt-6 space-y-3">
        {WORKOUT_PLANS.map((plan) => (
          <Link
            key={plan.id}
            href={`/session/${plan.id}`}
            className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
          >
            <p className="font-semibold">{plan.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {plan.exercises.length} exercises &middot;{" "}
              {plan.exercises
                .slice(0, 3)
                .map((e) => getExerciseById(e.exerciseId)?.name.split(" ")[0])
                .join(", ")}
              ...
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
