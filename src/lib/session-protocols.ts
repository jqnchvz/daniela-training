/**
 * Per-session warmup and cooldown protocols tailored to each training day.
 */

export interface ProtocolItem {
  icon: string;
  text: string;
  duration: string;
}

export interface SessionProtocol {
  warmup: ProtocolItem[];
  cooldown: ProtocolItem[];
  warmupMinutes: number;
  cooldownMinutes: number;
  focus: string;
  muscleGroups: string;
}

// Day A — Push Focus: chest, shoulders, triceps + quads/glutes from squats
const DAY_A_PROTOCOL: SessionProtocol = {
  focus: "Push Focus",
  muscleGroups: "Quads · Chest · Back · Shoulders",
  warmupMinutes: 12,
  warmup: [
    { icon: "🏃", text: "Brisk walk or light cycling", duration: "5 min" },
    { icon: "🔄", text: "Arm circles + shoulder dislocates", duration: "2 min" },
    { icon: "💪", text: "Band pull-aparts — 2×15", duration: "2 min" },
    { icon: "🏋️", text: "Goblet squat with light weight — 1×10", duration: "1 min" },
    { icon: "🧱", text: "Push-up walkouts — 5 reps slow", duration: "2 min" },
  ],
  cooldownMinutes: 10,
  cooldown: [
    { icon: "🚶", text: "Light walking", duration: "3 min" },
    { icon: "🙆", text: "Chest doorway stretch — 45s each side", duration: "2 min" },
    { icon: "💪", text: "Tricep + shoulder stretch — 30s each", duration: "2 min" },
    { icon: "🦵", text: "Standing quad stretch — 30s each leg", duration: "1 min" },
    { icon: "🌬", text: "Diaphragmatic breathing (4-7-8)", duration: "2 min" },
  ],
};

// Day B — Pull Focus: back, biceps, rear delts
const DAY_B_PROTOCOL: SessionProtocol = {
  focus: "Pull Focus",
  muscleGroups: "Hamstrings · Back · Biceps · Rear Delts",
  warmupMinutes: 12,
  warmup: [
    { icon: "🏃", text: "Incline treadmill walk, 3% grade", duration: "5 min" },
    { icon: "🐱", text: "Cat-cow + thoracic rotation", duration: "2 min" },
    { icon: "🔄", text: "Band pull-aparts + face pulls — 2×12", duration: "2 min" },
    { icon: "🏋️", text: "Light Romanian deadlift — 1×10", duration: "1 min" },
    { icon: "🧱", text: "Scapular pull-ups or hangs — 30s", duration: "2 min" },
  ],
  cooldownMinutes: 10,
  cooldown: [
    { icon: "🚶", text: "Light walking", duration: "3 min" },
    { icon: "🌊", text: "Lat stretch — 60s each side", duration: "2 min" },
    { icon: "🔄", text: "Supine spinal twist — 45s each", duration: "2 min" },
    { icon: "💪", text: "Bicep + forearm stretch — 30s each", duration: "1 min" },
    { icon: "🌬", text: "Diaphragmatic breathing (4-7-8)", duration: "2 min" },
  ],
};

// Day C — Legs / Full Body: quads, glutes, hamstrings, core
const DAY_C_PROTOCOL: SessionProtocol = {
  focus: "Legs / Full Body",
  muscleGroups: "Quads · Glutes · Hamstrings · Core",
  warmupMinutes: 14,
  warmup: [
    { icon: "🏃", text: "Cycling or elliptical — easy pace", duration: "5 min" },
    { icon: "🦵", text: "Leg swings (front/back + lateral) — 10 each", duration: "2 min" },
    { icon: "🍑", text: "Glute bridges — 2×12", duration: "2 min" },
    { icon: "🏋️", text: "Bodyweight squats — 1×15", duration: "1 min" },
    { icon: "🐱", text: "90/90 hip stretch + world's greatest stretch", duration: "3 min" },
    { icon: "🧘", text: "Dead bug — 1×8 slow", duration: "1 min" },
  ],
  cooldownMinutes: 12,
  cooldown: [
    { icon: "🚶", text: "Light walking", duration: "3 min" },
    { icon: "🦵", text: "Standing quad stretch — 60s each", duration: "2 min" },
    { icon: "🍑", text: "Pigeon pose — 60s each side", duration: "2 min" },
    { icon: "🔄", text: "Seated hamstring stretch — 60s each", duration: "2 min" },
    { icon: "🧘", text: "Child's pose + deep breathing", duration: "3 min" },
  ],
};

const PROTOCOL_MAP: Record<string, SessionProtocol> = {
  "b0000000-0000-4000-8000-000000000001": DAY_A_PROTOCOL,
  "b0000000-0000-4000-8000-000000000002": DAY_B_PROTOCOL,
  "b0000000-0000-4000-8000-000000000003": DAY_C_PROTOCOL,
};

export function getSessionProtocol(planId: string): SessionProtocol {
  return PROTOCOL_MAP[planId] ?? DAY_A_PROTOCOL;
}
