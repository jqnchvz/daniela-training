"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/store/session-store";
import { useT } from "@/lib/i18n";

export function RestTimer() {
  const restTimerEnd = useSessionStore((s) => s.restTimerEnd);
  const restTimerNextInfo = useSessionStore((s) => s.restTimerNextInfo);
  const setRestTimer = useSessionStore((s) => s.setRestTimer);
  const t = useT();
  const [remaining, setRemaining] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [skipDelay, setSkipDelay] = useState(30);

  useEffect(() => {
    if (!restTimerEnd) {
      setRemaining(0);
      setSkipDelay(30);
      return;
    }

    setSkipDelay(30);
    const delayInterval = setInterval(() => {
      setSkipDelay((prev) => {
        if (prev <= 1) {
          clearInterval(delayInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

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
    return () => {
      clearInterval(interval);
      clearInterval(delayInterval);
    };
  }, [restTimerEnd, setRestTimer]);

  if (!restTimerEnd && remaining <= 0) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const circumference = 2 * Math.PI * 45;
  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/95 backdrop-blur-[10px]">
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
            {t("rest.rest")}
          </span>
        </div>
      </div>

      <p className="text-[15px] text-muted-foreground mb-1 text-center">
        {t("rest.greatSet")}
      </p>
      <p className="text-[11px] text-muted-foreground/60 mb-4 text-center">
        {t("rest.thyroidRecovery")}
      </p>

      {/* Next exercise info */}
      {restTimerNextInfo && (
        <div className="rounded-[12px] border border-border bg-surface2/50 px-4 py-2.5 mb-6 text-center">
          <p className="text-[10px] text-muted-foreground tracking-[1px] uppercase font-semibold">
            {t("rest.nextUp")}
          </p>
          <p className="text-[14px] font-semibold mt-0.5">{restTimerNextInfo}</p>
        </div>
      )}

      {skipDelay > 0 ? (
        <p className="text-sm text-muted-foreground/60">
          {t("session.skipAvailableIn").replace("{n}", String(skipDelay))}
        </p>
      ) : (
        <button
          onClick={() => setRestTimer(null)}
          className="rounded-full bg-surface2 border border-border px-8 py-3 text-sm font-semibold transition-colors hover:bg-surface3"
        >
          {t("rest.skipRest")}
        </button>
      )}
    </div>
  );
}
