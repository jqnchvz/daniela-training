export default function LibraryLoading() {
  return (
    <div className="px-5 py-5 animate-pulse">
      {/* Search bar */}
      <div className="h-11 rounded-[12px] bg-surface2" />

      {/* Grid of 6 exercise cards */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-[12px] bg-surface2"
          />
        ))}
      </div>
    </div>
  );
}
