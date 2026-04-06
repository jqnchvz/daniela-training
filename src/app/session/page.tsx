"use client";

import Link from "next/link";
import { useState } from "react";
import { WORKOUT_PLANS, getExerciseById } from "@/lib/exercises";
import { getSessionProtocol } from "@/lib/session-protocols";
import { useI18n, useT } from "@/lib/i18n";
import { useSessionStore } from "@/store/session-store";

export default function SessionPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const locale = useI18n((s) => s.locale);
  const t = useT();
  const isEs = locale === "es";

  const activePlanId = useSessionStore((s) => s.planId);
  const activePhase = useSessionStore((s) => s.phase);
  const resetSession = useSessionStore((s) => s.reset);
  const hasActiveSession = activePlanId && activePhase !== "pre-check";
  const activePlan = hasActiveSession
    ? WORKOUT_PLANS.find((p) => p.id === activePlanId)
    : null;

  return (
    <div className="px-5 py-5">
      {/* Resume banner */}
      {activePlan && (
        <div className="mb-4 rounded-[16px] border border-sage-dim bg-sage-bg p-4">
          <p className="text-[13px] font-semibold text-sage mb-1">
            {t("session.resumeBanner")}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {isEs ? getSessionProtocol(activePlan.id).nameEs : activePlan.name}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/session/${activePlan.id}`}
              className="flex-1 rounded-[12px] bg-sage py-2.5 text-center font-heading text-[13px] font-bold text-primary-foreground transition-all hover:bg-sage/80"
            >
              {t("session.resumeBtn")}
            </Link>
            <button
              onClick={resetSession}
              className="rounded-[12px] border border-border bg-surface2 px-4 py-2.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-surface3"
            >
              {t("session.discardBtn")}
            </button>
          </div>
        </div>
      )}

      <h1 className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-muted-foreground mb-4">
        {t("session.workoutSessions")}
      </h1>

      <div className="space-y-3">
        {WORKOUT_PLANS.map((plan) => {
          const protocol = getSessionProtocol(plan.id);
          const isExpanded = expandedId === plan.id;
          const totalMinutes =
            protocol.warmupMinutes +
            plan.exercises.length * 5 +
            protocol.cooldownMinutes;

          const planName = isEs ? protocol.nameEs : plan.name;

          return (
            <div
              key={plan.id}
              className="rounded-[20px] border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : plan.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-heading text-lg font-bold">{planName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isEs ? protocol.muscleGroupsEs : protocol.muscleGroups}
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
                    📋 {plan.exercises.length} {t("common.exercises")}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    🔥 {protocol.warmupMinutes} min {isEs ? "calentamiento" : "warmup"}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border">
                  {/* Warmup */}
                  <div className="px-4 pt-3 pb-2">
                    <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-sage font-mono mb-2">
                      {t("session.warmup")} · {protocol.warmupMinutes} min
                    </p>
                    <div className="space-y-1.5">
                      {protocol.warmup.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-[12px]">
                          <span>{item.icon} {isEs ? item.textEs : item.text}</span>
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
                      {t("session.mainWork")} · {plan.exercises.length} {t("common.exercises")}
                    </p>
                    <div className="space-y-1.5">
                      {plan.exercises.map((pe, i) => {
                        const ex = getExerciseById(pe.exerciseId);
                        if (!ex) return null;
                        return (
                          <div key={i} className="flex items-center justify-between text-[12px]">
                            <span className="truncate">
                              {i + 1}. {isEs ? ex.nameEs : ex.name}
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
                      {t("session.cooldown")} · {protocol.cooldownMinutes} min
                    </p>
                    <div className="space-y-1.5">
                      {protocol.cooldown.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-[12px]">
                          <span>{item.icon} {isEs ? item.textEs : item.text}</span>
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
                      ▶ {isEs ? "Iniciar" : "Start"} {planName.split("—")[0].trim()}
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
