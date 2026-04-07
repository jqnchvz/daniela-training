"use client";

import { useState } from "react";
import { useAuthStore, type ExperienceLevel } from "@/store/auth-store";
import { useI18n } from "@/lib/i18n";

const STEPS = 3;

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<ExperienceLevel>("intermediate");
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const userName = useAuthStore((s) => s.activeUserName);
  const locale = useI18n((s) => s.locale);
  const isEs = locale === "es";

  const handleFinish = () => {
    completeOnboarding(level);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: STEPS }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i <= step ? "bg-sage" : "bg-surface3"
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <>
          <div className="text-6xl mb-4">👋</div>
          <h1 className="font-heading text-2xl font-extrabold mb-2">
            {isEs ? `¡Hola ${userName}!` : `Hey ${userName}!`}
          </h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-[300px] leading-relaxed">
            {isEs
              ? "El hipotiroidismo ralentiza el metabolismo y la recuperación. Este programa se adapta: descansos más largos para el sistema nervioso, sesiones de ~45 min para no disparar el cortisol, calentamiento y enfriamiento obligatorios, y progresión conservadora para evitar el sobreentrenamiento."
              : "Hypothyroidism slows metabolism and recovery. This program adapts: longer rest for the nervous system, ~45 min sessions to keep cortisol in check, mandatory warmup and cooldown, and conservative progression to prevent overtraining."}
          </p>
          <div className="w-full max-w-[320px] rounded-[16px] border border-border bg-card p-4 text-left space-y-3">
            <Feature icon="⏱" title={isEs ? "Descansos adaptados" : "Adapted rest times"} desc={isEs ? "2-3 min entre series para recuperación del sistema nervioso" : "2-3 min between sets for nervous system recovery"} />
            <Feature icon="📈" title={isEs ? "Sobrecarga progresiva" : "Progressive overload"} desc={isEs ? "Incrementos conservadores de 5% cada 2 semanas" : "Conservative 5% increases every 2 weeks"} />
            <Feature icon="🎯" title={isEs ? "RPE por serie" : "RPE per set"} desc={isEs ? "Registra el esfuerzo percibido para ajustar la intensidad" : "Track perceived effort to adjust intensity"} />
            <Feature icon="❤️" title={isEs ? "Monitoreo de bienestar" : "Wellness monitoring"} desc={isEs ? "Check-ins diarios de energía, sueño y dolor muscular" : "Daily check-ins for energy, sleep, and soreness"} />
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-6 w-full max-w-[320px] rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-primary-foreground"
          >
            {isEs ? "Siguiente →" : "Next →"}
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <div className="text-6xl mb-4">🏋️</div>
          <h2 className="font-heading text-xl font-bold mb-2">
            {isEs ? "¿Cuál es tu nivel?" : "What's your level?"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
            {isEs
              ? "Esto ajusta los pesos sugeridos para tu primer entrenamiento."
              : "This adjusts suggested weights for your first workout."}
          </p>

          <div className="w-full max-w-[320px] space-y-3">
            <LevelOption
              value="beginner"
              selected={level}
              onSelect={setLevel}
              emoji="🌱"
              title={isEs ? "Principiante" : "Beginner"}
              desc={isEs ? "Menos de 6 meses entrenando con pesas" : "Less than 6 months of weight training"}
            />
            <LevelOption
              value="intermediate"
              selected={level}
              onSelect={setLevel}
              emoji="💪"
              title={isEs ? "Intermedio" : "Intermediate"}
              desc={isEs ? "6 meses a 2 años de experiencia" : "6 months to 2 years of experience"}
            />
            <LevelOption
              value="advanced"
              selected={level}
              onSelect={setLevel}
              emoji="🔥"
              title={isEs ? "Avanzado" : "Advanced"}
              desc={isEs ? "Más de 2 años entrenando consistentemente" : "2+ years of consistent training"}
            />
          </div>

          <button
            onClick={() => setStep(2)}
            className="mt-6 w-full max-w-[320px] rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-primary-foreground"
          >
            {isEs ? "Siguiente →" : "Next →"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="text-6xl mb-4">✅</div>
          <h2 className="font-heading text-xl font-bold mb-2">
            {isEs ? "¡Todo listo!" : "All set!"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-[300px] leading-relaxed">
            {isEs
              ? "Tu programa de 16 semanas está configurado. Entrenas 3 veces por semana con descansos adaptados a tu condición."
              : "Your 16-week program is configured. You train 3 times per week with rest periods adapted to your condition."}
          </p>

          <div className="w-full max-w-[320px] rounded-[16px] border border-border bg-card p-4 text-left space-y-2 mb-6">
            <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mb-1">
              {isEs ? "TU PROGRAMA" : "YOUR PROGRAM"}
            </p>
            <InfoRow label={isEs ? "Duración" : "Duration"} value={isEs ? "16 semanas (3 fases)" : "16 weeks (3 phases)"} />
            <InfoRow label={isEs ? "Frecuencia" : "Frequency"} value={isEs ? "3 sesiones/semana" : "3 sessions/week"} />
            <InfoRow label={isEs ? "Nivel" : "Level"} value={level === "beginner" ? (isEs ? "Principiante" : "Beginner") : level === "intermediate" ? (isEs ? "Intermedio" : "Intermediate") : (isEs ? "Avanzado" : "Advanced")} />
            <InfoRow label={isEs ? "Pesos iniciales" : "Starting weights"} value={isEs ? "Ajustados a tu nivel" : "Adjusted to your level"} />
          </div>

          <button
            onClick={handleFinish}
            className="w-full max-w-[320px] rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-primary-foreground"
          >
            {isEs ? "¡Empezar a entrenar!" : "Start training!"}
          </button>
        </>
      )}

      {/* Skip button on first two steps */}
      {step < 2 && (
        <button
          onClick={handleFinish}
          className="mt-3 text-sm text-muted-foreground"
        >
          {isEs ? "Saltar →" : "Skip →"}
        </button>
      )}
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function LevelOption({
  value,
  selected,
  onSelect,
  emoji,
  title,
  desc,
}: {
  value: ExperienceLevel;
  selected: ExperienceLevel;
  onSelect: (v: ExperienceLevel) => void;
  emoji: string;
  title: string;
  desc: string;
}) {
  const isSelected = value === selected;
  return (
    <button
      onClick={() => onSelect(value)}
      className={`w-full flex items-center gap-3 rounded-[16px] border p-4 text-left transition-colors ${
        isSelected
          ? "bg-sage-bg border-sage-dim"
          : "bg-card border-border hover:bg-surface2"
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="font-heading font-bold text-[15px]">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
