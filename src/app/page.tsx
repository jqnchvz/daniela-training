"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  getGreeting,
  getTodaysWorkout,
  getNextWorkout,
  getDayName,
} from "@/lib/workout-schedule";

export default function HomePage() {
  const [greeting, setGreeting] = useState("Good morning");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGreeting(getGreeting());
  }, []);

  const todaysWorkout = getTodaysWorkout();
  const nextWorkout = getNextWorkout();
  const today = new Date().getDay();

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
        <div>
          <p className="text-[13px] text-muted-foreground">
            {mounted ? greeting : "Good morning"} ☀️
          </p>
          <h1 className="font-heading text-[1.35rem] font-bold">Daniela</h1>
        </div>
        <ThemeToggle />
      </div>

      {/* Phase badge */}
      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-sage" />
        Phase 1 · Week 3 of 4
      </div>

      {/* Week strip */}
      <div className="flex gap-1.5 mt-4">
        {weekDays.map((day) => {
          const isToday = day.dow === today;
          const isPast = day.dow < today && day.dow !== 0;
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
              <p className="text-[9px] font-semibold tracking-[1px] uppercase text-[#5a5550]">
                {day.name}
              </p>
              <p className="text-sm leading-none mt-1">
                {isPast && day.isWorkout
                  ? "✓"
                  : day.isWorkout
                    ? "💪"
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
      <div className="mt-4 rounded-[20px] border border-sage-dim bg-gradient-to-br from-sage-bg via-[#1f3520] to-[#182818] p-[22px] relative overflow-hidden">
        <div className="absolute -top-[30px] -right-[30px] w-[120px] h-[120px] rounded-full bg-sage opacity-[0.06]" />
        {todaysWorkout ? (
          <>
            <p className="text-[11px] font-semibold tracking-[2px] uppercase text-sage">
              Today · {todaysWorkout.name}
            </p>
            <h2 className="font-heading text-[1.6rem] font-extrabold leading-tight mt-2">
              {todaysWorkout.label}
            </h2>
            <p className="text-[13px] text-muted-foreground mt-1.5">
              Push · Chest · Shoulders · Triceps
            </p>
            <div className="flex gap-4 mt-4 mb-5">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                ⏱ {todaysWorkout.duration}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                📋 {todaysWorkout.exercises} exercises
              </span>
            </div>
            <Link
              href="/session"
              className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-[#0f1f10] transition-all hover:bg-[#8dc88f] hover:-translate-y-0.5 active:translate-y-0"
            >
              ▶ Start Session
            </Link>
          </>
        ) : (
          <>
            <p className="text-[11px] font-semibold tracking-[2px] uppercase text-sage">
              Rest day
            </p>
            <h2 className="font-heading text-[1.4rem] font-bold mt-2">
              Recovery day
            </h2>
            <p className="text-[13px] text-muted-foreground mt-1.5">
              Next: {getDayName(nextWorkout.dayOfWeek)} — {nextWorkout.name}
            </p>
          </>
        )}
      </div>

      {/* Wellness row */}
      <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-5 mb-2">
        Last session wellness
      </p>
      <div className="flex gap-2">
        <WellnessCard label="Energy" value="--" color="text-sage" />
        <WellnessCard label="Sleep" value="--" color="text-dt-blue" />
        <WellnessCard label="Soreness" value="--" color="text-gold" />
      </div>

      {/* Stats row */}
      <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-4 mb-2">
        This week
      </p>
      <div className="flex gap-2.5">
        <StatBox value="0" label="Sessions done" color="text-sage" />
        <StatBox value="--" label="Day streak" color="text-gold" />
        <StatBox value="--" label="PRs this week" color="text-dt-blue" />
      </div>

      {/* Phase progress */}
      <div className="mt-3 rounded-[16px] border border-border bg-card p-4">
        <p className="text-xs font-semibold tracking-[1px] uppercase text-muted-foreground font-mono mb-1.5">
          Phase progress
        </p>
        <p className="text-[13px] text-muted-foreground mb-2.5">
          Week 3 of 4 · Deload in 7 days
        </p>
        <div className="h-1 rounded-full bg-surface3">
          <div className="h-full rounded-full bg-sage transition-all" style={{ width: "75%" }} />
        </div>
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
      <p className={`font-heading text-[1.4rem] font-extrabold ${color}`}>{value}</p>
      <p className="text-[10px] text-[#5a5550] mt-0.5">{label}</p>
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
      <p className={`font-heading text-[1.5rem] font-extrabold leading-none ${color}`}>
        {value}
      </p>
      <p className="text-[10px] text-[#5a5550] mt-1">{label}</p>
    </div>
  );
}
