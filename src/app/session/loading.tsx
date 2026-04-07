export default function SessionLoading() {
  return (
    <div className="px-5 py-5 animate-pulse">
      {/* Header bar */}
      <div className="h-7 w-40 bg-surface2 rounded-[12px]" />
      <div className="mt-2 h-4 w-56 bg-surface2 rounded-[12px]" />

      {/* 3 card skeletons */}
      <div className="mt-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-[12px] bg-surface2"
          />
        ))}
      </div>
    </div>
  );
}
