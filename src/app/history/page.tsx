"use client";

import { useState } from "react";

// Placeholder data — will be replaced with Supabase queries
const DEMO_SESSIONS = [
  {
    id: "1",
    badge: "B",
    date: "Wednesday, Apr 2",
    name: "Pull Focus",
    duration: "52 min",
    exercises: [
      { name: "Romanian Deadlift", weight: "18kg", reps: "3×10", status: "done" as const },
      { name: "Lat Pulldown", weight: "22.5kg", reps: "3×10", status: "pr" as const },
      { name: "DB Overhead Press", weight: "10kg", reps: "3×10", status: "done" as const },
      { name: "Cable Face Pulls", weight: "8kg", reps: "2×12", status: "done" as const },
    ],
    energy: 4,
    sleep: 4,
    soreness: 2,
  },
  {
    id: "2",
    badge: "A",
    date: "Monday, Mar 31",
    name: "Push Focus",
    duration: "54 min",
    exercises: [
      { name: "Goblet Squat", weight: "16kg", reps: "3×10", status: "incomplete" as const },
      { name: "DB Bench Press", weight: "14kg", reps: "3×10", status: "done" as const },
      { name: "DB Bent-Over Row", weight: "12kg", reps: "3×10", status: "done" as const },
    ],
    energy: 3,
    sleep: 3,
    soreness: 3,
  },
  {
    id: "3",
    badge: "C",
    date: "Friday, Mar 28",
    name: "Legs / Full Body",
    duration: "57 min",
    exercises: [
      { name: "Leg Press", weight: "40kg", reps: "3×10", status: "pr" as const },
      { name: "Hip Thrust", weight: "20kg", reps: "3×10", status: "done" as const },
      { name: "DB Lunges", weight: "10kg", reps: "2×10", status: "done" as const },
      { name: "Cable Woodchops", weight: "10kg", reps: "2×12", status: "done" as const },
    ],
    energy: 4,
    sleep: 5,
    soreness: 2,
  },
];

export default function HistoryPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-muted-foreground">
          History
        </h1>
        <span className="rounded-full bg-sage-bg text-sage border border-sage-dim px-2.5 py-1 text-[11px] font-semibold">
          Week 3
        </span>
      </div>

      {/* Summary stats */}
      <div className="flex gap-2.5 mb-4">
        <div className="flex-1 text-center rounded-[10px] border border-border bg-surface2 p-3">
          <p className="font-heading text-[1.5rem] font-extrabold leading-none">3</p>
          <p className="text-[10px] text-[#5a5550] mt-1">Total sessions</p>
        </div>
        <div className="flex-1 text-center rounded-[10px] border border-border bg-surface2 p-3">
          <p className="font-heading text-[1.5rem] font-extrabold leading-none text-sage">2</p>
          <p className="text-[10px] text-[#5a5550] mt-1">PRs set</p>
        </div>
        <div className="flex-1 text-center rounded-[10px] border border-border bg-surface2 p-3">
          <p className="font-heading text-[1.5rem] font-extrabold leading-none text-gold">3.7</p>
          <p className="text-[10px] text-[#5a5550] mt-1">Avg energy</p>
        </div>
      </div>

      {/* Session list */}
      <div className="space-y-2">
        {DEMO_SESSIONS.map((session) => {
          const isExpanded = expandedId === session.id;
          return (
            <div
              key={session.id}
              className="rounded-[16px] border border-border bg-card overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() =>
                  setExpandedId(isExpanded ? null : session.id)
                }
                className="flex w-full items-center gap-3 p-3.5 text-left"
              >
                <div className="w-10 h-10 rounded-[10px] bg-sage-bg border border-sage-dim flex items-center justify-center font-heading font-extrabold text-base text-sage shrink-0">
                  {session.badge}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-muted-foreground">
                    {session.date}
                  </p>
                  <p className="font-semibold text-sm truncate">
                    {session.name} · {session.duration}
                  </p>
                </div>
                <span className="text-xs text-[#5a5550]">
                  {isExpanded ? "▲" : "▼"}
                </span>
              </button>

              {/* Body */}
              {isExpanded && (
                <div className="border-t border-border px-4 pb-3.5">
                  {session.exercises.map((ex, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-border last:border-b-0 text-[13px]"
                    >
                      <span>{ex.name}</span>
                      <span className="font-mono text-sage">
                        {ex.reps} @ {ex.weight}{" "}
                        {ex.status === "done"
                          ? "✓"
                          : ex.status === "pr"
                            ? "⬆️"
                            : "⏸"}
                      </span>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2.5">
                    <span className="rounded-full bg-sage-bg text-sage border border-sage-dim px-2.5 py-0.5 text-[11px] font-semibold">
                      Energy {session.energy}
                    </span>
                    <span className="rounded-full bg-dt-blue-bg text-dt-blue border border-[#1a3a5a] px-2.5 py-0.5 text-[11px] font-semibold">
                      Sleep {session.sleep}
                    </span>
                    <span className="rounded-full bg-surface2 text-muted-foreground border border-border px-2.5 py-0.5 text-[11px] font-semibold">
                      Soreness {session.soreness}
                    </span>
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
