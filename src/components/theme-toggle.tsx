"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-[48px] w-[48px]" />;

  return (
    <div className="flex gap-2">
      <LanguageToggle />
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-surface2 border border-border text-base transition-colors hover:bg-surface3"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
    </div>
  );
}

function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "es" : "en")}
      aria-label={locale === "en" ? "Switch to Spanish" : "Switch to English"}
      className="flex h-[48px] px-3.5 items-center justify-center rounded-full bg-surface2 border border-border text-[11px] font-bold uppercase tracking-wider transition-colors hover:bg-surface3"
    >
      {locale === "en" ? "ES" : "EN"}
    </button>
  );
}
