"use client";

import Link from "next/link";
import { useState } from "react";
import { WORKOUT_PLANS, getExerciseById } from "@/lib/exercises";
import { getSessionProtocol } from "@/lib/session-protocols";

export default function SessionPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="px-5 py-5">
      <h1 className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-muted-foreground mb-4">
        Workout Sessions
      </h1>

      <div className="space-y-3">
        {WORKOUT_PLANS.map((plan) => {
          const protocol = getSessionProtocol(plan.id);
          const isExpanded = expandedId === plan.id;
          const totalMinutes =
            protocol.warmupMinutes +
            plan.exercises.length * 5 +
            protocol.cooldownMinutes;

          return (
            <div
              key={plan.id}
              className="rounded-[20px] border border-border bg-card overflow-hidden"
            >
              {/* Header — always visible */}
              <button
                onClick={() =>
                  setExpandedId(isExpanded ? null : plan.id)
                }
                className="w-full p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-heading text-lg font-bold">
                      {plan.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {protocol.muscleGroups}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
                <div className="flex gap-3 mt-2">
                  <span className="text-[11px] text-muted-foreground">
                    ⏱ ~{totalMinutes} min
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    📋 {plan.exercises.length} exercises
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    🔥 {protocol.warmupMinutes} min warmup
                  </span>
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-border">
                  {/* Warmup */}
                  <div className="px-4 pt-3 pb-2">
                    <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-sage font-mono mb-2">
                      Warm-up · {protocol.warmupMinutes} min
                    </p>
                    <div className="space-y-1.5">
                      {protocol.warmup.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-[12px]"
                        >
                          <span>
                            {item.icon} {item.text}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
                            {item.duration}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exercises */}
                  <div className="px-4 pt-2 pb-2 border-t border-border">
                    <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-terra font-mono mb-2">
                      Main work · {plan.exercises.length} exercises
                    </p>
                    <div className="space-y-1.5">
                      {plan.exercises.map((pe, i) => {
                        const ex = getExerciseById(pe.exerciseId);
                        if (!ex) return null;
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between text-[12px]"
                          >
                            <span className="truncate">
                              {i + 1}. {ex.name}
                            </span>
                            <span className="text-[11px] font-mono text-sage shrink-0 ml-2">
                              {pe.sets}×{pe.reps}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cooldown */}
                  <div className="px-4 pt-2 pb-3 border-t border-border">
                    <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-dt-blue font-mono mb-2">
                      Cool-down · {protocol.cooldownMinutes} min
                    </p>
                    <div className="space-y-1.5">
                      {protocol.cooldown.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-[12px]"
                        >
                          <span>
                            {item.icon} {item.text}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
                            {item.duration}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Start button */}
                  <div className="px-4 pb-4">
                    <Link
                      href={`/session/${plan.id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-sage px-4 py-3.5 font-heading text-[15px] font-bold text-primary-foreground transition-all hover:bg-sage/80"
                    >
                      ▶ Start {plan.name.split("—")[0].trim()}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
