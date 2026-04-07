"use client";

export default function OfflinePage() {
  return (
    <div className="px-5 py-16 flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-full bg-surface2 border border-border flex items-center justify-center text-4xl mb-6">
        📡
      </div>
      <h1 className="font-heading text-2xl font-bold">You're offline</h1>
      <p className="text-muted-foreground text-sm mt-2 max-w-[280px]">
        It looks like you've lost your internet connection. Reconnect and try
        again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 rounded-[16px] bg-sage px-8 py-3.5 font-heading text-[15px] font-bold text-primary-foreground transition-all hover:bg-sage/80 active:translate-y-0.5"
      >
        Retry
      </button>
    </div>
  );
}
