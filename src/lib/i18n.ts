import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "es";

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      locale: "es",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "i18n-store" },
  ),
);

const translations: Record<string, Record<Locale, string>> = {
  // Common
  "common.start": { en: "Start", es: "Iniciar" },
  "common.save": { en: "Save", es: "Guardar" },
  "common.edit": { en: "Edit", es: "Editar" },
  "common.back": { en: "Back", es: "Volver" },
  "common.end": { en: "End", es: "Terminar" },
  "common.skip": { en: "Skip", es: "Saltar" },
  "common.next": { en: "Next", es: "Siguiente" },
  "common.prev": { en: "Previous", es: "Anterior" },
  "common.min": { en: "min", es: "min" },
  "common.exercises": { en: "exercises", es: "ejercicios" },

  // Nav
  "nav.home": { en: "Home", es: "Inicio" },
  "nav.session": { en: "Session", es: "Sesión" },
  "nav.progress": { en: "Progress", es: "Progreso" },
  "nav.library": { en: "Library", es: "Ejercicios" },
  "nav.history": { en: "History", es: "Historial" },

  // Home
  "home.goodMorning": { en: "Good morning", es: "Buenos días" },
  "home.goodAfternoon": { en: "Good afternoon", es: "Buenas tardes" },
  "home.goodEvening": { en: "Good evening", es: "Buenas noches" },
  "home.startProgram": { en: "Start your 16-week program →", es: "Inicia tu programa de 16 semanas →" },
  "home.startProgramDesc": {
    en: "Start your 16-week training cycle to track phase progress, deload reminders, and progressive overload.",
    es: "Inicia tu ciclo de entrenamiento de 16 semanas para seguir el progreso de fases, descargas y sobrecarga progresiva.",
  },
  "home.phase": { en: "Phase", es: "Fase" },
  "home.week": { en: "Week", es: "Semana" },
  "home.of": { en: "of", es: "de" },
  "home.today": { en: "Today", es: "Hoy" },
  "home.restDay": { en: "Rest day", es: "Día de descanso" },
  "home.recoveryDay": { en: "Recovery day", es: "Día de recuperación" },
  "home.nextSession": { en: "Next", es: "Siguiente" },
  "home.startSession": { en: "▶ Start Session", es: "▶ Iniciar Sesión" },
  "home.lastWellness": { en: "Last session wellness", es: "Bienestar última sesión" },
  "home.energy": { en: "Energy", es: "Energía" },
  "home.sleep": { en: "Sleep", es: "Sueño" },
  "home.soreness": { en: "Soreness", es: "Dolor muscular" },
  "home.thisWeek": { en: "This week", es: "Esta semana" },
  "home.totalSessions": { en: "Total sessions", es: "Sesiones totales" },
  "home.checkins": { en: "Check-ins", es: "Registros" },
  "home.phaseProgress": { en: "Phase progress", es: "Progreso de fase" },
  "home.earlyDeload": {
    en: "Your recent check-ins show declining energy or mood. Consider taking a deload week early.",
    es: "Tus registros recientes muestran energía o ánimo en descenso. Considera tomar una semana de descarga antes.",
  },
  "home.dismiss": { en: "Dismiss", es: "Descartar" },

  // Session
  "session.workoutSessions": { en: "Workout Sessions", es: "Sesiones de Entrenamiento" },
  "session.warmup": { en: "Warm-up", es: "Calentamiento" },
  "session.mainWork": { en: "Main work", es: "Trabajo principal" },
  "session.cooldown": { en: "Cool-down", es: "Enfriamiento" },
  "session.preCheck": { en: "Pre-session Check", es: "Chequeo Pre-sesión" },
  "session.energyQuestion": { en: "How's your energy?", es: "¿Cómo está tu energía?" },
  "session.quickCheck": { en: "Quick energy check before we start.", es: "Revisión rápida de energía antes de empezar." },
  "session.sorenessWarning": {
    en: "Your last check-in showed high soreness ({score}/10). Consider a rest day or lighter session if your body needs it.",
    es: "Tu último registro mostró dolor muscular alto ({score}/10). Considera un día de descanso o sesión más ligera si tu cuerpo lo necesita.",
  },
  "session.lowEnergyPrompt": {
    en: "Low energy? A shorter session still counts.",
    es: "¿Poca energía? Una sesión más corta también cuenta.",
  },
  "session.fullSession": { en: "Full session", es: "Sesión completa" },
  "session.liteSession": { en: "Lite session", es: "Sesión ligera" },
  "session.liteDesc": {
    en: "Compounds only, fewer sets",
    es: "Solo compuestos, menos series",
  },
  "session.liteActive": { en: "Lite mode", es: "Modo ligero" },
  "session.startWarmup": { en: "Start Warm-up →", es: "Iniciar Calentamiento →" },
  "session.doneWarmup": { en: "Done with Warm-up →", es: "Calentamiento Listo →" },
  "session.warmupDesc": {
    en: "Prepare your body for today's session. Take your time — this is non-negotiable for hypothyroid recovery.",
    es: "Prepara tu cuerpo para la sesión de hoy. Tómate tu tiempo — esto no es negociable para la recuperación con hipotiroidismo.",
  },
  "session.exercise": { en: "Exercise", es: "Ejercicio" },
  "session.logSets": { en: "Log your sets", es: "Registra tus series" },
  "session.nextUp": { en: "Next up", es: "Siguiente" },
  "session.nextExercise": { en: "Next Exercise →", es: "Siguiente Ejercicio →" },
  "session.allComplete": { en: "All exercises complete!", es: "¡Todos los ejercicios completos!" },
  "session.startCooldown": { en: "Start Cool-down →", es: "Iniciar Enfriamiento →" },
  "session.cooldownDesc": {
    en: "Stretching the muscles you just worked. This is when recovery begins — don't skip it.",
    es: "Estirando los músculos que acabas de trabajar. Aquí comienza la recuperación — no lo saltes.",
  },
  "session.completeSession": { en: "Complete Session ✓", es: "Completar Sesión ✓" },
  "session.sessionComplete": { en: "Session\nComplete!", es: "¡Sesión\nCompletada!" },
  "session.howDidItFeel": { en: "How did it feel?", es: "¿Cómo te sentiste?" },
  "session.sleepLastNight": { en: "Sleep last night", es: "Sueño anoche" },
  "session.backToDashboard": { en: "Back to Dashboard", es: "Volver al Inicio" },
  "session.sets": { en: "Sets", es: "Series" },
  "session.reps": { en: "Reps", es: "Reps" },
  "session.rest": { en: "Rest", es: "Descanso" },
  "session.lastWt": { en: "Last wt.", es: "Último peso" },
  "session.endSession": { en: "← End", es: "← Fin" },

  // Rest timer
  "rest.rest": { en: "REST", es: "DESCANSO" },
  "rest.greatSet": { en: "Great set! Rest and\nprepare for the next one.", es: "¡Gran serie! Descansa y\nprepárate para la siguiente." },
  "rest.skipRest": { en: "Skip rest →", es: "Saltar descanso →" },

  // Progress
  "progress.title": { en: "Progress", es: "Progreso" },
  "progress.noData": { en: "No data yet", es: "Sin datos aún" },
  "progress.noDataDesc": {
    en: "Complete sessions and daily check-ins to see your progress trends here.",
    es: "Completa sesiones y registros diarios para ver tus tendencias de progreso aquí.",
  },
  "progress.ruleStatus": { en: "2-Week Rule Status", es: "Estado Regla 2 Semanas" },
  "progress.strengthTrend": { en: "Strength trend", es: "Tendencia de fuerza" },
  "progress.weeklyVolume": { en: "Weekly volume", es: "Volumen semanal" },
  "progress.wellnessTrend": { en: "Wellness trend", es: "Tendencia de bienestar" },
  "progress.bodyMetrics": { en: "Body metrics", es: "Medidas corporales" },
  "progress.logMeasurements": { en: "+ Log measurements", es: "+ Registrar medidas" },
  "progress.readyIncrease": { en: "Ready to increase", es: "Listo para aumentar" },
  "progress.hold": { en: "Hold this week", es: "Mantener esta semana" },
  "progress.incomplete": { en: "Incomplete reps · Hold", es: "Reps incompletas · Mantener" },

  // Library
  "library.title": { en: "Exercise Library", es: "Biblioteca de Ejercicios" },
  "library.search": { en: "Search exercises...", es: "Buscar ejercicios..." },
  "library.all": { en: "All", es: "Todos" },

  // History
  "history.title": { en: "History", es: "Historial" },
  "history.totalSessions": { en: "Total sessions", es: "Sesiones totales" },
  "history.prsSet": { en: "PRs set", es: "PRs logrados" },
  "history.avgEnergy": { en: "Avg energy", es: "Energía promedio" },
  "history.noSessions": { en: "No sessions yet. Complete your first workout to see it here.", es: "Sin sesiones aún. Completa tu primer entrenamiento para verlo aquí." },
  "history.sessions": { en: "sessions", es: "sesiones" },

  // Checkin
  "checkin.title": { en: "Daily Check-in", es: "Registro Diario" },
  "checkin.subtitle": { en: "How are you feeling today? Takes 30 seconds.", es: "¿Cómo te sientes hoy? Toma 30 segundos." },
  "checkin.energyLevel": { en: "Energy level", es: "Nivel de energía" },
  "checkin.sleepQuality": { en: "Sleep quality", es: "Calidad de sueño" },
  "checkin.sleepHours": { en: "Sleep hours", es: "Horas de sueño" },
  "checkin.mood": { en: "Mood", es: "Estado de ánimo" },
  "checkin.soreness": { en: "Muscle soreness", es: "Dolor muscular" },
  "checkin.notes": { en: "Notes (optional)", es: "Notas (opcional)" },
  "checkin.notesPlaceholder": { en: "Anything notable today?", es: "¿Algo notable hoy?" },
  "checkin.saveCheckin": { en: "Save Check-in ✓", es: "Guardar Registro ✓" },
  "checkin.saved": { en: "Check-in saved!", es: "¡Registro guardado!" },
  "checkin.keepItUp": { en: "Keep it up — consistency is key.", es: "Sigue así — la consistencia es clave." },
  "checkin.editToday": { en: "Edit today's check-in", es: "Editar registro de hoy" },
  "checkin.poor": { en: "Poor", es: "Mal" },
  "checkin.great": { en: "Great", es: "Bien" },
  "checkin.low": { en: "Low", es: "Bajo" },
  "checkin.none": { en: "None", es: "Ninguno" },
  "checkin.verySore": { en: "Very sore", es: "Muy adolorido" },

  // Days
  "day.mon": { en: "MON", es: "LUN" },
  "day.tue": { en: "TUE", es: "MAR" },
  "day.wed": { en: "WED", es: "MIÉ" },
  "day.thu": { en: "THU", es: "JUE" },
  "day.fri": { en: "FRI", es: "VIE" },
  "day.sat": { en: "SAT", es: "SÁB" },
  "day.sun": { en: "SUN", es: "DOM" },

  // Day names (full)
  "dayFull.0": { en: "Sunday", es: "Domingo" },
  "dayFull.1": { en: "Monday", es: "Lunes" },
  "dayFull.2": { en: "Tuesday", es: "Martes" },
  "dayFull.3": { en: "Wednesday", es: "Miércoles" },
  "dayFull.4": { en: "Thursday", es: "Jueves" },
  "dayFull.5": { en: "Friday", es: "Viernes" },
  "dayFull.6": { en: "Saturday", es: "Sábado" },
};

export function t(key: string, locale?: Locale): string {
  const l = locale ?? useI18n.getState().locale;
  return translations[key]?.[l] ?? translations[key]?.en ?? key;
}

export function useT() {
  const locale = useI18n((s) => s.locale);
  return (key: string) => t(key, locale);
}
