"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/session", label: "Session", icon: "▶️" },
  { href: "/progress", label: "Progress", icon: "📈" },
  { href: "/checkin", label: "Check-in", icon: "💚" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[420px] border-t border-border bg-[rgba(18,18,18,0.92)] backdrop-blur-[20px] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center py-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-1"
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span
                className={`text-[10px] font-semibold tracking-[0.5px] transition-colors ${
                  isActive ? "text-sage" : "text-[#5a5550]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
