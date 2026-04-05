"use client";

import { useState } from "react";
import { EnergySlider } from "@/components/session/energy-slider";

export default function CheckinPage() {
  const [energy, setEnergy] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [mood, setMood] = useState(5);
  const [soreness, setSoreness] = useState(3);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a full implementation, this saves to Supabase
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto text-center">
        <div className="text-4xl mb-3">✓</div>
        <h2 className="text-xl font-bold">Check-in saved!</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Keep it up — consistency is key.
        </p>
        <button
          onClick={() => setSaved(false)}
          className="mt-4 text-sm text-primary underline"
        >
          Edit today&apos;s check-in
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">Daily Check-in</h1>
      <p className="text-sm text-muted-foreground mt-1">
        How are you feeling today? Takes 30 seconds.
      </p>

      <div className="mt-6 space-y-6">
        <EnergySlider value={energy} onChange={setEnergy} label="Energy level" />

        <div className="space-y-3">
          <label className="text-sm font-medium">Sleep quality</label>
          <input
            type="range"
            min={1}
            max={10}
            value={sleepQuality}
            onChange={(e) => setSleepQuality(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-secondary accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Poor</span>
            <span className="text-lg font-bold text-foreground">{sleepQuality}</span>
            <span>Great</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Sleep hours</label>
          <input
            type="number"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            step={0.5}
            min={0}
            max={24}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Mood</label>
          <input
            type="range"
            min={1}
            max={10}
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-secondary accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span className="text-lg font-bold text-foreground">{mood}</span>
            <span>Great</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Muscle soreness</label>
          <input
            type="range"
            min={1}
            max={10}
            value={soreness}
            onChange={(e) => setSoreness(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-secondary accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>None</span>
            <span className="text-lg font-bold text-foreground">{soreness}</span>
            <span>Very sore</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything notable today?"
            maxLength={200}
            className="w-full rounded-lg border border-border bg-card p-3 text-sm resize-none h-20"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Save Check-in ✓
        </button>
      </div>
    </div>
  );
}
