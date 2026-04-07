export default function ProgressLoading() {
  return (
    <div className="px-5 py-5 animate-pulse">
      {/* Header */}
      <div className="h-7 w-36 bg-surface2 rounded-[12px]" />
      <div className="mt-2 h-4 w-52 bg-surface2 rounded-[12px]" />

      {/* 3 chart placeholder boxes */}
      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-[12px] bg-surface2"
          />
        ))}
      </div>
    </div>
  );
}
