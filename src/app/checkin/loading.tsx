export default function CheckinLoading() {
  return (
    <div className="px-5 py-5 animate-pulse">
      {/* Header */}
      <div className="h-7 w-36 bg-surface2 rounded-[12px]" />
      <div className="mt-2 h-4 w-56 bg-surface2 rounded-[12px]" />

      {/* 4 slider rows */}
      <div className="mt-6 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-surface2 rounded-[12px]" />
            <div className="h-8 rounded-[12px] bg-surface2" />
          </div>
        ))}
      </div>

      {/* Button */}
      <div className="mt-8 h-12 rounded-[16px] bg-surface2" />
    </div>
  );
}
