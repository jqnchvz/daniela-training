"use client";

import { useState } from "react";
import Image from "next/image";

interface ExerciseDemoProps {
  gifUrl: string | null;
  exerciseName: string;
  instructions: string[];
  muscleGroups: string[];
}

export function ExerciseDemo({
  gifUrl,
  exerciseName,
  instructions,
  muscleGroups,
}: ExerciseDemoProps) {
  const [expanded, setExpanded] = useState(false);
  const [showTips, setShowTips] = useState(false);

  return (
    <>
      {/* Compact preview */}
      {gifUrl && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full rounded-xl border border-border bg-card overflow-hidden"
        >
          <div className="relative h-40 w-full">
            <Image
              src={gifUrl}
              alt={`${exerciseName} demonstration`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </button>
      )}

      {/* Form tips toggle */}
      {instructions.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className={`h-3 w-3 transition-transform ${showTips ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
            How to do this
          </button>
          {showTips && (
            <ol className="mt-2 space-y-1.5 pl-5 text-xs text-muted-foreground list-decimal">
              {instructions.map((instruction, i) => (
                <li key={i}>{instruction}</li>
              ))}
            </ol>
          )}
          {showTips && muscleGroups.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {muscleGroups.map((mg) => (
                <span
                  key={mg}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground"
                >
                  {mg.replace("_", " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No image fallback */}
      {!gifUrl && instructions.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          No demo available for this exercise.
        </p>
      )}

      {/* Full-screen overlay */}
      {expanded && gifUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setExpanded(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl z-50"
            onClick={() => setExpanded(false)}
            aria-label="Close"
          >
            &times;
          </button>
          <div className="relative w-full h-full max-w-lg max-h-[80vh]">
            <Image
              src={gifUrl}
              alt={`${exerciseName} demonstration`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}
