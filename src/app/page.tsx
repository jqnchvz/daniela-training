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

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {mounted ? greeting : "Good morning"}, Daniela
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Let&apos;s get to work.
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Today's Workout Card */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        {todaysWorkout ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Today&apos;s workout
            </p>
            <p className="text-lg font-semibold mt-1.5">
              {todaysWorkout.name} &mdash; {todaysWorkout.label}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {todaysWorkout.exercises} exercises &middot;{" "}
              {todaysWorkout.duration}
            </p>
            <Link
              href="/session"
              className="mt-4 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start Session &rarr;
            </Link>
          </>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Rest day
            </p>
            <p className="text-base font-medium mt-1.5">
              Recovery is where progress happens
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Next: {getDayName(nextWorkout.dayOfWeek)} &mdash;{" "}
              {nextWorkout.name} ({nextWorkout.label})
            </p>
          </>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatCard label="Streak" value="--" unit="days" />
        <StatCard label="This week" value="0/3" unit="sessions" />
        <StatCard label="Energy" value="--" unit="avg" />
      </div>

      {/* Check-in Prompt */}
      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Daily Check-in</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              How are you feeling today?
            </p>
          </div>
          <Link
            href="/checkin"
            className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Check in
          </Link>
        </div>
      </div>

      {/* Recent Session */}
      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Last session
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          No sessions logged yet. Start your first workout!
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
      <p className="text-[10px] text-muted-foreground">{unit}</p>
    </div>
  );
}
