"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/store/session-store";

export function RestTimer() {
  const restTimerEnd = useSessionStore((s) => s.restTimerEnd);
  const setRestTimer = useSessionStore((s) => s.setRestTimer);
  const [remaining, setRemaining] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  useEffect(() => {
    if (!restTimerEnd) {
      setRemaining(0);
      return;
    }

    const total = Math.ceil((restTimerEnd - Date.now()) / 1000);
    setTotalSeconds(total);

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
  const circumference = 2 * Math.PI * 45;
  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/85 backdrop-blur-[10px]">
      {/* Circular ring */}
      <div className="relative w-[180px] h-[180px] mb-6">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="6"
            className="stroke-surface2"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            className="stroke-sage transition-[stroke-dashoffset] duration-1000 linear"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-5xl font-extrabold">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
          <span className="text-xs tracking-[2px] uppercase text-muted-foreground">
            REST
          </span>
        </div>
      </div>

      <p className="text-[15px] text-muted-foreground mb-8 text-center">
        Great set! Rest and<br />prepare for the next one.
      </p>

      <button
        onClick={() => setRestTimer(null)}
        className="rounded-full bg-surface2 border border-[#3A3530] px-8 py-3 text-sm font-semibold transition-colors hover:bg-surface3"
      >
        Skip rest →
      </button>
    </div>
  );
}
