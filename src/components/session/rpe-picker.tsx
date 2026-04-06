"use client";

import { useI18n } from "@/lib/i18n";

const RPE_OPTIONS = [
  { value: 6, emoji: "😊", en: "Easy — could do 4+ more", es: "Fácil — podrías hacer 4+ más" },
  { value: 7, emoji: "🙂", en: "Moderate — 3 reps left", es: "Moderado — te quedan 3 reps" },
  { value: 8, emoji: "😤", en: "Hard — 2 reps left", es: "Difícil — te quedan 2 reps" },
  { value: 9, emoji: "🥵", en: "Very hard — 1 rep left", es: "Muy difícil — te queda 1 rep" },
  { value: 10, emoji: "💀", en: "Max effort — nothing left", es: "Máximo esfuerzo — no queda nada" },
];

interface RpePickerProps {
  onSelect: (rpe: number) => void;
  onSkip: () => void;
}

export function RpePicker({ onSelect, onSkip }: RpePickerProps) {
  const locale = useI18n((s) => s.locale);
  const isEs = locale === "es";

  return (
    <div className="fixed inset-0 z-[190] flex flex-col items-center justify-center bg-black/85 backdrop-blur-[10px] px-6">
      <p className="text-xs tracking-[2px] uppercase text-muted-foreground font-mono mb-2">
        {isEs ? "ESFUERZO PERCIBIDO" : "PERCEIVED EXERTION"}
      </p>
      <h2 className="font-heading text-xl font-bold mb-1 text-center">
        {isEs ? "¿Qué tan difícil fue?" : "How hard was that?"}
      </h2>
      <p className="text-xs text-muted-foreground mb-5 text-center max-w-[260px]">
        {isEs
          ? "Esto ayuda a ajustar tu entrenamiento."
          : "This helps adjust your training."}
      </p>

      <div className="w-full max-w-[340px] space-y-2">
        {RPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className="w-full flex items-center gap-3 rounded-[14px] border border-border bg-card/80 p-3.5 transition-colors hover:bg-surface2 active:bg-sage/20"
          >
            <span className="text-2xl w-9 text-center">{opt.emoji}</span>
            <div className="flex-1 text-left">
              <span className="font-heading font-bold text-[15px]">{opt.value}</span>
              <span className="text-[12px] text-muted-foreground ml-2">
                {isEs ? opt.es : opt.en}
              </span>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onSkip}
        className="mt-4 text-sm text-muted-foreground"
      >
        {isEs ? "Saltar →" : "Skip →"}
      </button>
    </div>
  );
}
