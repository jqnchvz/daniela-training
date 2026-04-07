"use client";

import { useState } from "react";
import { useHistoryStore, type CompletedSession } from "@/store/history-store";
import { useT } from "@/lib/i18n";

export default function HistoryPage() {
  const sessions = useHistoryStore((s) => s.sessions);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalPRs = 0; // TODO: compute from progression events
  const avgEnergy =
    sessions.length > 0
      ? (
          sessions.reduce((sum, s) => sum + (s.energyPost ?? 0), 0) /
          sessions.filter((s) => s.energyPost).length || 0
        ).toFixed(1)
      : "--";
  const t = useT();

  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-muted-foreground">
          {t("history.title")}
        </h1>
        <span className="rounded-full bg-sage-bg text-sage border border-sage-dim px-2.5 py-1 text-[11px] font-semibold">
          {sessions.length} {t("history.sessions")}
        </span>
      </div>

      {/* Summary stats */}
      <div className="flex gap-2.5 mb-4">
        <div className="flex-1 text-center rounded-[10px] border border-border bg-surface2 p-3">
          <p className="font-heading text-[1.5rem] font-extrabold leading-none">
            {sessions.length}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">{t("history.totalSessions")}</p>
        </div>
        <div className="flex-1 text-center rounded-[10px] border border-border bg-surface2 p-3">
          <p className="font-heading text-[1.5rem] font-extrabold leading-none text-sage">
            {totalPRs}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">{t("history.prsSet")}</p>
        </div>
        <div className="flex-1 text-center rounded-[10px] border border-border bg-surface2 p-3">
          <p className="font-heading text-[1.5rem] font-extrabold leading-none text-gold">
            {avgEnergy}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">{t("history.avgEnergy")}</p>
        </div>
      </div>

      {/* Session list */}
      {sessions.length === 0 ? (
        <div className="rounded-[16px] border border-border bg-card p-6 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm text-muted-foreground">
            {t("history.noSessions")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionEntry
              key={session.id}
              session={session}
              isExpanded={expandedId === session.id}
              onToggle={() =>
                setExpandedId(expandedId === session.id ? null : session.id)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionEntry({
  session,
  isExpanded,
  onToggle,
}: {
  session: CompletedSession;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const t = useT();
  const badge = session.planName.includes("A")
    ? "A"
    : session.planName.includes("B")
      ? "B"
      : "C";

  const formattedDate = new Date(session.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Group sets by exercise
  const exerciseGroups = new Map<string, typeof session.sets>();
  for (const set of session.sets) {
    const existing = exerciseGroups.get(set.exerciseId) ?? [];
    existing.push(set);
    exerciseGroups.set(set.exerciseId, existing);
  }

  return (
    <div className="rounded-[16px] border border-border bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3.5 text-left"
      >
        <div className="w-10 h-10 rounded-[10px] bg-sage-bg border border-sage-dim flex items-center justify-center font-heading font-extrabold text-base text-sage shrink-0">
          {badge}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-muted-foreground">{formattedDate}</p>
          <p className="font-semibold text-sm truncate">
            {session.planName} · {session.durationMinutes} min
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {isExpanded ? "▲" : "▼"}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-border px-4 pb-3.5">
          {Array.from(exerciseGroups.entries()).map(([exId, sets]) => {
            const maxWeight = Math.max(...sets.map((s) => s.weight));
            const totalReps = sets.reduce((sum, s) => sum + s.reps, 0);
            return (
              <div
                key={exId}
                className="flex items-center justify-between py-2 border-b border-border last:border-b-0 text-[13px]"
              >
                <span>{sets[0].exerciseName}</span>
                <span className="font-mono text-sage">
                  {sets.length}×{Math.round(totalReps / sets.length)} @ {maxWeight}kg ✓
                </span>
              </div>
            );
          })}
          <div className="flex gap-2 mt-2.5">
            {session.energyPost != null && (
              <span className="rounded-full bg-sage-bg text-sage border border-sage-dim px-2.5 py-0.5 text-[11px] font-semibold">
                {t("home.energy")} {session.energyPost}
              </span>
            )}
            {session.sleepScore != null && (
              <span className="rounded-full bg-dt-blue-bg text-dt-blue border border-dt-blue/30 px-2.5 py-0.5 text-[11px] font-semibold">
                {t("home.sleep")} {session.sleepScore}
              </span>
            )}
            {session.sorenessScore != null && (
              <span className="rounded-full bg-surface2 text-muted-foreground border border-border px-2.5 py-0.5 text-[11px] font-semibold">
                {t("home.soreness")} {session.sorenessScore}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
