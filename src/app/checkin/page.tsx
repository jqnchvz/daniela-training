"use client";

import { useState, useEffect } from "react";
import { EnergySlider } from "@/components/session/energy-slider";
import { useHistoryStore } from "@/store/history-store";

export default function CheckinPage() {
  const addCheckin = useHistoryStore((s) => s.addCheckin);
  const getCheckinForDate = useHistoryStore((s) => s.getCheckinForDate);

  const today = new Date().toISOString().split("T")[0];
  const existing = getCheckinForDate(today);

  const [energy, setEnergy] = useState(existing?.energy ?? 5);
  const [sleepQuality, setSleepQuality] = useState(existing?.sleepQuality ?? 5);
  const [sleepHours, setSleepHours] = useState(existing?.sleepHours ?? 7.5);
  const [mood, setMood] = useState(existing?.mood ?? 5);
  const [soreness, setSoreness] = useState(existing?.soreness ?? 3);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [saved, setSaved] = useState(!!existing);
  const [editing, setEditing] = useState(false);

  // Sync state if existing checkin loads after hydration
  useEffect(() => {
    if (existing && !editing) {
      setEnergy(existing.energy);
      setSleepQuality(existing.sleepQuality);
      setSleepHours(existing.sleepHours);
      setMood(existing.mood);
      setSoreness(existing.soreness);
      setNotes(existing.notes);
      setSaved(true);
    }
  }, [existing, editing]);

  const handleSave = () => {
    addCheckin({
      id: crypto.randomUUID(),
      date: today,
      energy,
      sleepQuality,
      sleepHours,
      mood,
      soreness,
      notes,
    });
    setSaved(true);
    setEditing(false);
  };

  if (saved && !editing) {
    return (
      <div className="px-5 py-6 max-w-[420px] mx-auto text-center">
        <div className="text-4xl mb-3">✓</div>
        <h2 className="font-heading text-xl font-bold">Check-in saved!</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Keep it up — consistency is key.
        </p>

        <div className="mt-6 rounded-[16px] border border-border bg-card p-4 text-left">
          <div className="grid grid-cols-2 gap-3">
            <ScoreDisplay label="Energy" value={energy} color="text-sage" />
            <ScoreDisplay label="Sleep" value={sleepQuality} color="text-dt-blue" />
            <ScoreDisplay label="Mood" value={mood} color="text-gold" />
            <ScoreDisplay label="Soreness" value={soreness} color="text-terra" />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Sleep: {sleepHours}h {notes && `· ${notes}`}
          </p>
        </div>

        <button
          onClick={() => setEditing(true)}
          className="mt-4 text-sm text-sage underline"
        >
          Edit today&apos;s check-in
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 max-w-[420px] mx-auto">
      <h1 className="font-heading text-[1.35rem] font-bold">Daily Check-in</h1>
      <p className="text-sm text-muted-foreground mt-1">
        How are you feeling today? Takes 30 seconds.
      </p>

      <div className="mt-6 space-y-6">
        <EnergySlider value={energy} onChange={setEnergy} label="Energy level" />

        <SliderRow label="Sleep quality" value={sleepQuality} onChange={setSleepQuality} low="Poor" high="Great" />

        <div className="space-y-2">
          <label className="text-sm font-medium">Sleep hours</label>
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

        <SliderRow label="Mood" value={mood} onChange={setMood} low="Low" high="Great" />
        <SliderRow label="Muscle soreness" value={soreness} onChange={setSoreness} low="None" high="Very sore" />

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything notable today?"
            maxLength={200}
            className="w-full rounded-[10px] border border-border bg-surface2 p-3 text-sm resize-none h-20"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full rounded-[16px] bg-sage px-4 py-4 font-heading text-[15px] font-bold text-[#0f1f10] transition-all hover:bg-[#8dc88f]"
        >
          Save Check-in ✓
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
      <p className="text-[10px] text-[#5a5550]">{label}</p>
    </div>
  );
}
