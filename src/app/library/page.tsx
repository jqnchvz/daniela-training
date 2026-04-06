"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { EXERCISES, type ExerciseTag } from "@/lib/exercises";
import { useI18n } from "@/lib/i18n";
import { useT } from "@/lib/i18n";

const FILTER_TAGS: { labelKey: string; value: ExerciseTag | null; color: string }[] = [
  { labelKey: "library.all", value: null, color: "bg-surface2 text-muted-foreground border-border" },
  { labelKey: "Lower", value: "Lower", color: "bg-sage-bg text-sage border-sage-dim" },
  { labelKey: "Push", value: "Push", color: "bg-terra-bg text-terra border-terra-dim" },
  { labelKey: "Pull", value: "Pull", color: "bg-dt-blue-bg text-dt-blue border-dt-blue/30" },
  { labelKey: "Core", value: "Core", color: "bg-gold-bg text-gold border-gold/30" },
];

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<ExerciseTag | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const locale = useI18n((s) => s.locale);
  const t = useT();

  const filtered = EXERCISES.filter((ex) => {
    const name = locale === "es" ? ex.nameEs : ex.name;
    const matchesSearch = !search || name.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !activeTag || ex.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-muted-foreground">
          {t("library.title")}
        </h1>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2.5 rounded-[10px] border border-border bg-card px-3.5 py-2.5 mb-4">
        <span className="text-muted-foreground">🔍</span>
        <input
          type="text"
          placeholder={t("library.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Filter tags */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_TAGS.map((tag) => (
          <button
            key={tag.labelKey}
            onClick={() => setActiveTag(tag.value)}
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.5px] transition-colors ${
              activeTag === tag.value
                ? tag.color
                : "bg-surface2 text-muted-foreground border-border"
            }`}
          >
            {tag.value === null ? t("library.all") : tag.value}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="space-y-2">
        {filtered.map((ex) => (
          <ExerciseItem
            key={ex.id}
            exercise={ex}
            locale={locale}
            isExpanded={expandedId === ex.id}
            onToggle={() => setExpandedId(expandedId === ex.id ? null : ex.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ExerciseItem({
  exercise: ex,
  locale,
  isExpanded,
  onToggle,
}: {
  exercise: (typeof EXERCISES)[number];
  locale: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const name = locale === "es" ? ex.nameEs : ex.name;
  const notes = locale === "es" ? ex.notesEs : ex.notes;
  const instructions =
    locale === "es" && ex.instructionsEs.length > 0
      ? ex.instructionsEs
      : ex.instructions;

  // Animate between two frames
  const [showFrame2, setShowFrame2] = useState(false);
  useEffect(() => {
    if (!isExpanded || !ex.gifUrl || !ex.gifUrl2) return;
    const interval = setInterval(() => setShowFrame2((p) => !p), 1200);
    return () => clearInterval(interval);
  }, [isExpanded, ex.gifUrl, ex.gifUrl2]);

  const currentUrl = isExpanded && showFrame2 && ex.gifUrl2 ? ex.gifUrl2 : ex.gifUrl;

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3.5 rounded-[16px] border border-border bg-card p-3.5 text-left transition-colors hover:border-sage/30"
      >
        <div className="w-14 h-14 rounded-[10px] bg-surface2 flex items-center justify-center shrink-0 overflow-hidden">
          {ex.gifUrl ? (
            <Image
              src={ex.gifUrl}
              alt={name}
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
          <p className="font-semibold text-sm truncate">{name}</p>
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
                        ? "bg-dt-blue-bg text-dt-blue border-dt-blue/30"
                        : "bg-gold-bg text-gold border-gold/30"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="mt-1 rounded-[16px] border border-border bg-card p-4">
          {currentUrl && (
            <div className="rounded-[10px] overflow-hidden bg-surface2 mb-3">
              <Image
                src={currentUrl}
                alt={name}
                width={400}
                height={200}
                className="object-contain w-full h-auto max-h-[200px] transition-opacity duration-300"
                unoptimized
              />
            </div>
          )}
          {instructions.length > 0 && (
            <ol className="space-y-1.5 pl-5 text-[13px] text-muted-foreground list-decimal leading-relaxed">
              {instructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ol>
          )}
          <p className="text-xs text-muted-foreground mt-3 italic">{notes}</p>
        </div>
      )}
    </div>
  );
}
