"use client";

import { useState } from "react";
import Image from "next/image";
import { EXERCISES, type ExerciseTag } from "@/lib/exercises";

const FILTER_TAGS: { label: string; value: ExerciseTag | null; color: string }[] = [
  { label: "All", value: null, color: "bg-surface2 text-muted-foreground border-border" },
  { label: "Lower", value: "Lower", color: "bg-sage-bg text-sage border-sage-dim" },
  { label: "Push", value: "Push", color: "bg-terra-bg text-terra border-terra-dim" },
  { label: "Pull", value: "Pull", color: "bg-dt-blue-bg text-dt-blue border-[#1A2240]" },
  { label: "Core", value: "Core", color: "bg-gold-bg text-gold border-[#3A3018]" },
];

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<ExerciseTag | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = EXERCISES.filter((ex) => {
    const matchesSearch =
      !search || ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !activeTag || ex.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-muted-foreground">
          Exercise Library
        </h1>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2.5 rounded-[10px] border border-border bg-card px-3.5 py-2.5 mb-4">
        <span className="text-[#8A847E]">🔍</span>
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-[#8A847E] focus:outline-none"
        />
      </div>

      {/* Filter tags */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_TAGS.map((tag) => (
          <button
            key={tag.label}
            onClick={() => setActiveTag(tag.value)}
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.5px] transition-colors ${
              activeTag === tag.value
                ? tag.color
                : "bg-surface2 text-muted-foreground border-border"
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="space-y-2">
        {filtered.map((ex) => (
          <div key={ex.id}>
            <button
              onClick={() =>
                setExpandedId(expandedId === ex.id ? null : ex.id)
              }
              className="flex w-full items-center gap-3.5 rounded-[16px] border border-border bg-card p-3.5 text-left transition-colors hover:border-[#3A3530]"
            >
              <div className="w-14 h-14 rounded-[10px] bg-surface2 flex items-center justify-center shrink-0 overflow-hidden">
                {ex.gifUrl ? (
                  <Image
                    src={ex.gifUrl}
                    alt={ex.name}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <span className="text-2xl">💪</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{ex.name}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {ex.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        tag === "Lower"
                          ? "bg-sage-bg text-sage border-sage-dim"
                          : tag === "Push"
                            ? "bg-terra-bg text-terra border-terra-dim"
                            : tag === "Pull"
                              ? "bg-dt-blue-bg text-dt-blue border-[#1A2240]"
                              : "bg-gold-bg text-gold border-[#3A3018]"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                  {ex.muscleGroups.slice(0, 2).map((mg) => (
                    <span
                      key={mg}
                      className="rounded-full bg-surface2 border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {mg.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            </button>

            {/* Expanded detail */}
            {expandedId === ex.id && (
              <div className="mt-1 rounded-[16px] border border-border bg-card p-4">
                {ex.gifUrl && (
                  <div className="rounded-[10px] overflow-hidden bg-surface2 mb-3">
                    <Image
                      src={ex.gifUrl}
                      alt={ex.name}
                      width={400}
                      height={200}
                      className="object-contain w-full h-auto max-h-[200px]"
                      unoptimized
                    />
                  </div>
                )}
                {ex.instructions.length > 0 && (
                  <ol className="space-y-1.5 pl-5 text-[13px] text-muted-foreground list-decimal leading-relaxed">
                    {ex.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ol>
                )}
                <p className="text-xs text-[#8A847E] mt-3 italic">{ex.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
