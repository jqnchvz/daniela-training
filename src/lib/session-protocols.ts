/**
 * Per-session warmup and cooldown protocols tailored to each training day.
 */

export interface ProtocolItem {
  icon: string;
  text: string;
  textEs: string;
  duration: string;
}

export interface SessionProtocol {
  warmup: ProtocolItem[];
  cooldown: ProtocolItem[];
  warmupMinutes: number;
  cooldownMinutes: number;
  focus: string;
  focusEs: string;
  muscleGroups: string;
  muscleGroupsEs: string;
  nameEs: string;
}

// Day A — Push Focus
const DAY_A_PROTOCOL: SessionProtocol = {
  focus: "Push Focus",
  focusEs: "Enfoque Empuje",
  muscleGroups: "Quads · Chest · Back · Shoulders",
  muscleGroupsEs: "Cuádriceps · Pecho · Espalda · Hombros",
  nameEs: "Día A — Enfoque Empuje",
  warmupMinutes: 12,
  warmup: [
    { icon: "🏃", text: "Brisk walk or light cycling", textEs: "Caminata rápida o ciclismo ligero", duration: "5 min" },
    { icon: "🔄", text: "Arm circles + shoulder dislocates", textEs: "Círculos de brazos + dislocaciones de hombro", duration: "2 min" },
    { icon: "💪", text: "Band pull-aparts — 2×15", textEs: "Aperturas con banda — 2×15", duration: "2 min" },
    { icon: "🏋️", text: "Goblet squat with light weight — 1×10", textEs: "Sentadilla goblet con peso ligero — 1×10", duration: "1 min" },
    { icon: "🧱", text: "Push-up walkouts — 5 reps slow", textEs: "Caminata a lagartija — 5 reps lento", duration: "2 min" },
  ],
  cooldownMinutes: 10,
  cooldown: [
    { icon: "🚶", text: "Light walking", textEs: "Caminata ligera", duration: "3 min" },
    { icon: "🙆", text: "Chest doorway stretch — 45s each side", textEs: "Estiramiento de pecho en puerta — 45s cada lado", duration: "2 min" },
    { icon: "💪", text: "Tricep + shoulder stretch — 30s each", textEs: "Estiramiento de tríceps + hombro — 30s cada uno", duration: "2 min" },
    { icon: "🦵", text: "Standing quad stretch — 30s each leg", textEs: "Estiramiento de cuádriceps de pie — 30s cada pierna", duration: "1 min" },
    { icon: "🌬", text: "Diaphragmatic breathing (4-7-8)", textEs: "Respiración diafragmática (4-7-8)", duration: "2 min" },
  ],
};

// Day B — Pull Focus
const DAY_B_PROTOCOL: SessionProtocol = {
  focus: "Pull Focus",
  focusEs: "Enfoque Tirón",
  muscleGroups: "Hamstrings · Back · Biceps · Rear Delts",
  muscleGroupsEs: "Isquiotibiales · Espalda · Bíceps · Deltoides Posterior",
  nameEs: "Día B — Enfoque Tirón",
  warmupMinutes: 12,
  warmup: [
    { icon: "🏃", text: "Incline treadmill walk, 3% grade", textEs: "Caminata en cinta inclinada, 3% pendiente", duration: "5 min" },
    { icon: "🐱", text: "Cat-cow + thoracic rotation", textEs: "Gato-vaca + rotación torácica", duration: "2 min" },
    { icon: "🔄", text: "Band pull-aparts + face pulls — 2×12", textEs: "Aperturas con banda + tirón facial — 2×12", duration: "2 min" },
    { icon: "🏋️", text: "Light Romanian deadlift — 1×10", textEs: "Peso muerto rumano ligero — 1×10", duration: "1 min" },
    { icon: "🧱", text: "Scapular pull-ups or hangs — 30s", textEs: "Dominadas escapulares o colgarse — 30s", duration: "2 min" },
  ],
  cooldownMinutes: 10,
  cooldown: [
    { icon: "🚶", text: "Light walking", textEs: "Caminata ligera", duration: "3 min" },
    { icon: "🌊", text: "Lat stretch — 60s each side", textEs: "Estiramiento de dorsales — 60s cada lado", duration: "2 min" },
    { icon: "🔄", text: "Supine spinal twist — 45s each", textEs: "Torsión espinal supina — 45s cada lado", duration: "2 min" },
    { icon: "💪", text: "Bicep + forearm stretch — 30s each", textEs: "Estiramiento de bíceps + antebrazo — 30s cada uno", duration: "1 min" },
    { icon: "🌬", text: "Diaphragmatic breathing (4-7-8)", textEs: "Respiración diafragmática (4-7-8)", duration: "2 min" },
  ],
};

// Day C — Legs / Full Body
const DAY_C_PROTOCOL: SessionProtocol = {
  focus: "Legs / Full Body",
  focusEs: "Piernas / Cuerpo Completo",
  muscleGroups: "Quads · Glutes · Hamstrings · Core",
  muscleGroupsEs: "Cuádriceps · Glúteos · Isquiotibiales · Core",
  nameEs: "Día C — Piernas / Cuerpo Completo",
  warmupMinutes: 14,
  warmup: [
    { icon: "🏃", text: "Cycling or elliptical — easy pace", textEs: "Bicicleta o elíptica — ritmo suave", duration: "5 min" },
    { icon: "🦵", text: "Leg swings (front/back + lateral) — 10 each", textEs: "Balanceo de piernas (frente/atrás + lateral) — 10 cada una", duration: "2 min" },
    { icon: "🍑", text: "Glute bridges — 2×12", textEs: "Puentes de glúteos — 2×12", duration: "2 min" },
    { icon: "🏋️", text: "Bodyweight squats — 1×15", textEs: "Sentadillas con peso corporal — 1×15", duration: "1 min" },
    { icon: "🐱", text: "90/90 hip stretch + world's greatest stretch", textEs: "Estiramiento de cadera 90/90 + el mejor estiramiento del mundo", duration: "3 min" },
    { icon: "🧘", text: "Dead bug — 1×8 slow", textEs: "Bicho muerto — 1×8 lento", duration: "1 min" },
  ],
  cooldownMinutes: 12,
  cooldown: [
    { icon: "🚶", text: "Light walking", textEs: "Caminata ligera", duration: "3 min" },
    { icon: "🦵", text: "Standing quad stretch — 60s each", textEs: "Estiramiento de cuádriceps de pie — 60s cada uno", duration: "2 min" },
    { icon: "🍑", text: "Pigeon pose — 60s each side", textEs: "Postura de paloma — 60s cada lado", duration: "2 min" },
    { icon: "🔄", text: "Seated hamstring stretch — 60s each", textEs: "Estiramiento de isquiotibiales sentada — 60s cada uno", duration: "2 min" },
    { icon: "🧘", text: "Child's pose + deep breathing", textEs: "Postura del niño + respiración profunda", duration: "3 min" },
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
