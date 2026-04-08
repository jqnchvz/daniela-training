"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";
import { useSessionStore } from "@/store/session-store";

const navItems = [
  { href: "/", labelKey: "nav.home", icon: "🏠" },
  { href: "/session", labelKey: "nav.session", icon: "▶️" },
  { href: "/progress", labelKey: "nav.progress", icon: "📈" },
  { href: "/library", labelKey: "nav.library", icon: "📚" },
  { href: "/history", labelKey: "nav.history", icon: "📋" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const t = useT();
  const activePlanId = useSessionStore((s) => s.planId);

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[420px] border-t border-border bg-background/92 backdrop-blur-[20px] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center py-3">
        {navItems.map((item) => {
          // If there's an active session, link directly to it
          const href =
            item.href === "/session" && activePlanId
              ? `/session/${activePlanId}`
              : item.href;

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2 min-h-[48px] justify-center"
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span
                className={`text-[10px] font-semibold tracking-[0.5px] transition-colors ${
                  isActive ? "text-sage" : "text-muted-foreground"
                }`}
              >
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
