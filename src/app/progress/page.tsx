"use client";

export default function ProgressPage() {
  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-muted-foreground">
          Progress
        </h1>
        <button className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-surface2 border border-border text-base transition-colors hover:bg-surface3">
          📤
        </button>
      </div>

      {/* Red flag banner */}
      <div className="rounded-[16px] bg-dt-red-bg border border-[#5a1a1a] p-3.5 flex gap-2.5 items-start mb-3">
        <span className="text-lg shrink-0">⚠️</span>
        <p className="text-[13px] text-[#e08888] leading-relaxed">
          Energy scores have been <strong>3 or below</strong> for 2 sessions. Consider
          checking recovery, sleep, and stress levels before increasing intensity.
        </p>
      </div>

      {/* 2-Week Rule Status */}
      <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mb-2.5">
        2-Week Rule Status
      </p>
      <div className="rounded-[16px] border border-border bg-card p-3.5 mb-3">
        <RuleItem status="⬆️" name="Lat Pulldown" detail="Hit 2×12 for 2 sessions · Ready to increase" weight="25 kg" />
        <RuleItem status="✅" name="DB Bent-Over Row" detail="Hit 3×10 · Hold this week" weight="12 kg" />
        <RuleItem status="✅" name="DB Bench Press" detail="Hit 3×10 · Hold this week" weight="14 kg" />
        <RuleItem status="⏸️" name="Goblet Squat" detail="Incomplete reps last session · Hold" weight="16 kg" />
        <RuleItem status="⬆️" name="Romanian Deadlift" detail="Hit 3×10 for 2 sessions · Ready" weight="18 kg" last />
      </div>

      {/* Strength trend */}
      <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-4 mb-2.5">
        Strength trend — Lat Pulldown
      </p>
      <div className="rounded-[16px] border border-border bg-card p-[18px] mb-3">
        <svg className="w-full h-20" viewBox="0 0 300 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7aad7c" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#7aad7c" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 0,70 L 40,65 L 80,60 L 120,55 L 160,48 L 200,42 L 240,35 L 300,28 L 300,80 L 0,80 Z"
            fill="url(#chartGrad)"
          />
          <polyline
            points="0,70 40,65 80,60 120,55 160,48 200,42 240,35 300,28"
            stroke="#7aad7c"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {[
            [0, 70], [40, 65], [80, 60], [120, 55], [160, 48], [200, 42], [240, 35],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3" fill="#7aad7c" />
          ))}
          <circle cx="300" cy="28" r="5" fill="#7aad7c" stroke="#0f1f10" strokeWidth="2" />
          <text x="0" y="78" fill="#5a5550" fontSize="9" fontFamily="JetBrains Mono">
            W1
          </text>
          <text x="265" y="78" fill="#5a5550" fontSize="9" fontFamily="JetBrains Mono">
            Today
          </text>
          <text x="262" y="24" fill="#7aad7c" fontSize="9" fontFamily="JetBrains Mono" fontWeight="500">
            25kg
          </text>
        </svg>
        <div className="flex justify-between mt-2 text-xs text-[#5a5550]">
          <span>
            Started: <span className="text-muted-foreground">15 kg</span>
          </span>
          <span>+10 kg in 3 weeks 📈</span>
        </div>
      </div>

      {/* Wellness trend */}
      <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-4 mb-2.5">
        Wellness trend
      </p>
      <div className="rounded-[16px] border border-border bg-card p-[18px] mb-3">
        <svg className="w-full h-20" viewBox="0 0 300 80" preserveAspectRatio="none">
          <polyline
            points="0,30 40,25 80,35 120,20 160,30 200,45 240,40 300,35"
            stroke="#7aad7c"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="0,40 40,35 80,45 120,30 160,40 200,35 240,50 300,45"
            stroke="#5a9fd4"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 2"
          />
          <text x="0" y="78" fill="#5a5550" fontSize="9" fontFamily="JetBrains Mono">
            W1
          </text>
          <text x="265" y="78" fill="#5a5550" fontSize="9" fontFamily="JetBrains Mono">
            Today
          </text>
          <line x1="10" y1="10" x2="25" y2="10" stroke="#7aad7c" strokeWidth="2" />
          <text x="28" y="14" fill="#7aad7c" fontSize="9">
            Energy
          </text>
          <line x1="80" y1="10" x2="95" y2="10" stroke="#5a9fd4" strokeWidth="2" strokeDasharray="4 2" />
          <text x="98" y="14" fill="#5a9fd4" fontSize="9">
            Sleep
          </text>
        </svg>
      </div>

      {/* Body metrics */}
      <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mt-4 mb-2.5">
        Body metrics
      </p>
      <div className="rounded-[16px] border border-border bg-card p-3.5">
        <div className="flex gap-2.5">
          <MetricBox value="—" label="Waist cm" />
          <MetricBox value="—" label="Hip cm" />
          <MetricBox value="—" label="Thigh cm" />
        </div>
        <button className="w-full mt-3 rounded-[16px] border border-[#3a3a3a] bg-surface2 py-2.5 text-[13px] font-semibold transition-colors hover:bg-surface3">
          + Log measurements
        </button>
      </div>
    </div>
  );
}

function RuleItem({
  status,
  name,
  detail,
  weight,
  last = false,
}: {
  status: string;
  name: string;
  detail: string;
  weight: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 py-3 ${last ? "" : "border-b border-border"}`}
    >
      <span className="text-xl shrink-0">{status}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
      </div>
      <span className="font-mono text-[13px] text-sage shrink-0">{weight}</span>
    </div>
  );
}

function MetricBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 text-center rounded-[10px] bg-surface2 p-3">
      <p className="font-heading text-[1.2rem] font-extrabold">{value}</p>
      <p className="text-[10px] text-[#5a5550] mt-1">{label}</p>
    </div>
  );
}
