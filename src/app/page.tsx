export default function HomePage() {
  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold">Good morning, Daniela</h1>
      <p className="text-muted-foreground mt-1">Let&apos;s get to work.</p>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Today&apos;s workout</p>
        <p className="text-lg font-semibold mt-1">Day A &mdash; Push Focus</p>
        <p className="text-sm text-muted-foreground mt-1">
          6 exercises &middot; ~50 min
        </p>
        <button className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
          Start Session &rarr;
        </button>
      </div>
    </div>
  );
}
