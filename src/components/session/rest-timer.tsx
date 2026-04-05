"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/store/session-store";

export function RestTimer() {
  const restTimerEnd = useSessionStore((s) => s.restTimerEnd);
  const setRestTimer = useSessionStore((s) => s.setRestTimer);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!restTimerEnd) {
      setRemaining(0);
      return;
    }

    const tick = () => {
      const diff = Math.max(0, Math.ceil((restTimerEnd - Date.now()) / 1000));
      setRemaining(diff);
      if (diff <= 0) {
        setRestTimer(null);
        try {
          navigator.vibrate?.(500);
        } catch {
          // vibration not supported
        }
      }
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [restTimerEnd, setRestTimer]);

  if (!restTimerEnd && remaining <= 0) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
        {remaining > 0 ? "Rest" : "Ready!"}
      </p>
      <p className="text-5xl font-mono font-bold tabular-nums">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </p>
      {remaining > 0 && (
        <button
          onClick={() => setRestTimer(null)}
          className="mt-3 text-xs text-muted-foreground underline"
        >
          Skip rest
        </button>
      )}
    </div>
  );
}
