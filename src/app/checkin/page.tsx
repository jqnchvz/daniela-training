"use client";

import { useState, useEffect } from "react";
import { EnergySlider } from "@/components/session/energy-slider";
import { useHistoryStore } from "@/store/history-store";
import { useAuthStore } from "@/store/auth-store";
import { useT } from "@/lib/i18n";

export default function CheckinPage() {
  const addCheckin = useHistoryStore((s) => s.addCheckin);
  const getCheckinForDate = useHistoryStore((s) => s.getCheckinForDate);
  const activeUserId = useAuthStore((s) => s.activeUserId);

  const today = new Date().toISOString().split("T")[0];
  const existing = getCheckinForDate(today, activeUserId ?? undefined);

  const [energy, setEnergy] = useState(existing?.energy ?? 5);
  const [sleepQuality, setSleepQuality] = useState(existing?.sleepQuality ?? 5);
  const [sleepHours, setSleepHours] = useState(existing?.sleepHours ?? 7.5);
  const [mood, setMood] = useState(existing?.mood ?? 5);
  const [soreness, setSoreness] = useState(existing?.soreness ?? 3);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [walkMinutes, setWalkMinutes] = useState(existing?.walkMinutes ?? 0);
  const [didStretching, setDidStretching] = useState(existing?.didStretching ?? false);
  const [didYoga, setDidYoga] = useState(existing?.didYoga ?? false);
  const [tookMedication, setTookMedication] = useState(existing?.tookMedication ?? false);
  const [saved, setSaved] = useState(!!existing);
  const [editing, setEditing] = useState(false);
  const t = useT();

  // Sync state if existing checkin loads after hydration
  useEffect(() => {
    if (existing && !editing) {
      setEnergy(existing.energy);
      setSleepQuality(existing.sleepQuality);
      setSleepHours(existing.sleepHours);
      setMood(existing.mood);
      setSoreness(existing.soreness);
      setNotes(existing.notes);
      setWalkMinutes(existing.walkMinutes ?? 0);
      setDidStretching(existing.didStretching ?? false);
      setDidYoga(existing.didYoga ?? false);
      setTookMedication(existing.tookMedication ?? false);
      setSaved(true);
    }
  }, [existing, editing]);

  const handleSave = () => {
    addCheckin({
      id: crypto.randomUUID(),
      userId: activeUserId ?? undefined,
      date: today,
      energy,
      sleepQuality,
      sleepHours,
      mood,
      soreness,
      notes,
      walkMinutes: walkMinutes || null,
      didStretching: didStretching || null,
      didYoga: didYoga || null,
      tookMedication,
    });
    setSaved(true);
    setEditing(false);
  };

  if (saved && !editing) {
    return (
      <div className="px-5 py-6 max-w-[420px] mx-auto text-center">
        <div className="text-4xl mb-3">✓</div>
        <h2 className="font-heading text-xl font-bold">{t("checkin.saved")}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {t("checkin.keepItUp")}
        </p>

        <div className="mt-6 rounded-[16px] border border-border bg-card p-4 text-left">
          <div className="grid grid-cols-2 gap-3">
            <ScoreDisplay label={t("home.energy")} value={energy} color="text-sage" />
            <ScoreDisplay label={t("home.sleep")} value={sleepQuality} color="text-dt-blue" />
            <ScoreDisplay label={t("checkin.mood")} value={mood} color="text-gold" />
            <ScoreDisplay label={t("home.soreness")} value={soreness} color="text-terra" />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <p className="text-xs text-muted-foreground">
              Sleep: {sleepHours}h {notes && `· ${notes}`}
            </p>
            {existing?.tookMedication && (
              <span className="rounded-full bg-sage-bg text-sage border border-sage-dim px-2.5 py-0.5 text-[11px] font-semibold">
                💊 ✓
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setEditing(true)}
          className="mt-4 text-sm text-sage underline"
        >
          {t("checkin.editToday")}
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 max-w-[420px] mx-auto">
      <h1 className="font-heading text-[1.35rem] font-bold">{t("checkin.title")}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {t("checkin.subtitle")}
      </p>

      <div className="mt-6 space-y-6">
        {/* Medication toggle — first thing in the morning */}
        <div className="flex items-center justify-between rounded-[12px] border border-border bg-surface2 p-3.5">
          <div>
            <p className="font-semibold text-sm">{t("checkin.medication")}</p>
            <p className="text-[11px] text-muted-foreground">{t("checkin.medicationDesc")}</p>
          </div>
          <button
            onClick={() => setTookMedication(!tookMedication)}
            className={`w-12 h-7 rounded-full transition-colors ${
              tookMedication ? "bg-sage" : "bg-surface3"
            } relative`}
          >
            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
              tookMedication ? "translate-x-5" : "translate-x-0.5"
            }`} />
          </button>
        </div>

        <EnergySlider value={energy} onChange={setEnergy} label={t("checkin.energyLevel")} />

        <SliderRow label={t("checkin.sleepQuality")} value={sleepQuality} onChange={setSleepQuality} low={t("checkin.poor")} high={t("checkin.great")} />

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("checkin.sleepHours")}</label>
          <input
            type="number"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            step={0.5}
            min={0}
            max={24}
            className="w-full rounded-[10px] border border-border bg-surface2 px-3 py-2 text-sm font-mono"
          />
        </div>

        <SliderRow label={t("checkin.mood")} value={mood} onChange={setMood} low={t("checkin.low")} high={t("checkin.great")} />
        <SliderRow label={t("checkin.soreness")} value={soreness} onChange={setSoreness} low={t("checkin.none")} high={t("checkin.verySore")} />

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("checkin.notes")}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("checkin.notesPlaceholder")}
            maxLength={200}
            className="w-full rounded-[10px] border border-border bg-surface2 p-3 text-sm resize-none h-20"
          />
        </div>

        {/* LISS activity fields */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("home.walkMinutes")}</label>
          <input
            type="number"
            inputMode="numeric"
            value={walkMinutes}
            onChange={(e) => setWalkMinutes(Math.max(0, Math.min(300, Number(e.target.value) || 0)))}
            step={5}
            min={0}
            max={300}
            className="w-full rounded-[10px] border border-border bg-surface2 px-3 py-2 text-sm font-mono"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDidStretching(!didStretching)}
            className={`flex-1 rounded-[10px] border py-2.5 text-[13px] font-semibold transition-colors ${
              didStretching
                ? "border-sage bg-sage-bg text-sage"
                : "border-border bg-surface2 text-muted-foreground"
            }`}
          >
            {didStretching ? "✓ " : ""}{t("home.stretching")}
          </button>
          <button
            type="button"
            onClick={() => setDidYoga(!didYoga)}
            className={`flex-1 rounded-[10px] border py-2.5 text-[13px] font-semibold transition-colors ${
              didYoga
                ? "border-sage bg-sage-bg text-sage"
                : "border-border bg-surface2 text-muted-foreground"
            }`}
          >
            {didYoga ? "✓ " : ""}{t("home.yoga")}
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-primary-foreground transition-all hover:bg-sage/80"
        >
          {t("checkin.saveCheckin")}
        </button>
      </div>
    </div>
  );
}

function SliderRow({ label, value, onChange, low, high }: {
  label: string; value: number; onChange: (v: number) => void; low: string; high: string;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{label}</label>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-surface3 accent-sage"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{low}</span>
        <span className="text-lg font-bold text-foreground">{value}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function ScoreDisplay({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center rounded-[10px] bg-surface2 p-2.5">
      <p className={`font-heading text-xl font-extrabold ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
