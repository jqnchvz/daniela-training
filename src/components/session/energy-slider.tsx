"use client";

import { useT } from "@/lib/i18n";

const ENERGY_EMOJIS = ["", "😴", "😴", "😪", "😐", "🙂", "😊", "💪", "⚡", "🔥", "🚀"];

export function EnergySlider({
  value,
  onChange,
  label,
}: {
  value: number | null;
  onChange: (v: number) => void;
  label: string;
}) {
  const current = value ?? 5;
  const t = useT();

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-4">
        <span className="text-3xl w-10 text-center">{ENERGY_EMOJIS[current]}</span>
        <div className="flex-1">
          <input
            type="range"
            min={1}
            max={10}
            value={current}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-secondary accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{t("checkin.low")}</span>
            <span className="text-lg font-bold text-foreground">{current}</span>
            <span>{t("checkin.high")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
