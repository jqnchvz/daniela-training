export default function HomeLoading() {
  return (
    <div className="px-5 py-5 animate-pulse">
      {/* Header: avatar + greeting */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface2" />
          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-surface2 rounded-[12px]" />
            <div className="h-5 w-32 bg-surface2 rounded-[12px]" />
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-surface2" />
      </div>

      {/* Phase badge */}
      <div className="mt-3 h-7 w-44 bg-surface2 rounded-full" />

      {/* Week strip: 7 boxes */}
      <div className="flex gap-1.5 mt-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-14 rounded-[10px] bg-surface2"
          />
        ))}
      </div>

      {/* Workout card */}
      <div className="mt-4 rounded-[20px] bg-surface2 h-52" />

      {/* Wellness row label */}
      <div className="mt-5 mb-2 h-3 w-28 bg-surface2 rounded-[12px]" />
      {/* Wellness row: 3 boxes */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-16 rounded-[10px] bg-surface2"
          />
        ))}
      </div>

      {/* Stats row label */}
      <div className="mt-4 mb-2 h-3 w-20 bg-surface2 rounded-[12px]" />
      {/* Stats row: 3 boxes */}
      <div className="flex gap-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-16 rounded-[10px] bg-surface2"
          />
        ))}
      </div>
    </div>
  );
}
