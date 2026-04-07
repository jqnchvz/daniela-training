export default function HistoryLoading() {
  return (
    <div className="px-5 py-5 animate-pulse">
      {/* Header */}
      <div className="h-7 w-32 bg-surface2 rounded-[12px]" />
      <div className="mt-2 h-4 w-48 bg-surface2 rounded-[12px]" />

      {/* 3 stat boxes */}
      <div className="mt-6 flex gap-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-16 rounded-[10px] bg-surface2"
          />
        ))}
      </div>

      {/* 4 list item bars */}
      <div className="mt-5 space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-[12px] bg-surface2"
          />
        ))}
      </div>
    </div>
  );
}
