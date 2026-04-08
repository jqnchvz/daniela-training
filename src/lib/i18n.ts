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
  "common.cancel": { en: "Cancel", es: "Cancelar" },
  "checkin.prompt": { en: "How are you feeling today?", es: "¿Cómo te sientes hoy?" },
  "checkin.promptAction": { en: "Complete your daily check-in", es: "Completa tu registro diario" },
  "settings.back": { en: "Back", es: "Volver" },
  "settings.title": { en: "Settings", es: "Ajustes" },
  "settings.profile": { en: "Profile", es: "Perfil" },
  "settings.profileHint": { en: "Switch users from the home screen", es: "Cambia de usuario desde la pantalla principal" },
  "settings.experienceLevel": { en: "Experience Level", es: "Nivel de experiencia" },
  "settings.beginner": { en: "Beginner", es: "Principiante" },
  "settings.intermediate": { en: "Intermediate", es: "Intermedio" },
  "settings.advanced": { en: "Advanced", es: "Avanzado" },
  "settings.experienceHint": { en: "Affects starting weight suggestions", es: "Afecta las sugerencias de peso inicial" },
  "settings.language": { en: "Language", es: "Idioma" },
  "settings.theme": { en: "Theme", es: "Tema" },
  "settings.light": { en: "Light", es: "Claro" },
  "settings.dark": { en: "Dark", es: "Oscuro" },
  "settings.cycleTracking": { en: "Menstrual Cycle", es: "Ciclo menstrual" },
  "settings.cycleEnabled": { en: "Tracking enabled", es: "Seguimiento activo" },
  "settings.cycleDisabled": { en: "Enable tracking", es: "Activar seguimiento" },
  "settings.cycleHint": { en: "Adapts training suggestions to your cycle phase", es: "Adapta las sugerencias de entrenamiento a tu fase del ciclo" },
  "settings.data": { en: "Data", es: "Datos" },
  "settings.exportData": { en: "Export data", es: "Exportar datos" },
  "settings.exported": { en: "Downloaded", es: "Descargado" },
  "settings.sessions": { en: "sessions", es: "sesiones" },
  "settings.checkins": { en: "check-ins", es: "registros" },
  "common.sets": { en: "sets", es: "series" },
  "common.offline": { en: "Offline — data will sync when reconnected", es: "Sin conexión — los datos se sincronizarán al reconectar" },
  "common.notFound": { en: "Workout plan not found.", es: "Plan de entrenamiento no encontrado." },

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
  "home.startProgram": { en: "Begin Training Plan →", es: "Comenzar Plan →" },
  "home.startProgramTitle": { en: "Ready to start training?", es: "¿Lista para entrenar?" },
  "home.startProgramDesc2": {
    en: "A 16-week progressive program with 3 sessions per week, tailored for hypothyroid recovery.",
    es: "Un programa progresivo de 16 semanas con 3 sesiones por semana, adaptado para la recuperación hipotiroidea.",
  },
  "home.personalizedTo": { en: "Personalized to your level:", es: "Personalizado a tu nivel:" },
  "home.startConfirmDesc": {
    en: "This will start your 16-week training cycle with 3 sessions per week. You can adjust your plan anytime.",
    es: "Esto iniciará tu ciclo de 16 semanas con 3 sesiones por semana. Puedes ajustar tu plan en cualquier momento.",
  },
  "home.letsGo": { en: "Let's go!", es: "¡Vamos!" },
  "home.notYet": { en: "Not yet", es: "Aún no" },
  "home.phase1Short": { en: "1. Stabilization", es: "1. Estabilización" },
  "home.phase2Short": { en: "2. Hypertrophy", es: "2. Hipertrofia" },
  "home.phase3Short": { en: "3. Strength", es: "3. Fuerza" },
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
  "home.startDeload": { en: "Start deload week", es: "Iniciar semana de descarga" },
  "home.deloadActive": { en: "Deload week active — lighter weights, fewer sets, focus on recovery.", es: "Semana de descarga activa — pesos ligeros, menos series, enfoque en recuperación." },

  // Session
  "session.resumeBanner": { en: "Session in progress", es: "Sesión en curso" },
  "session.resumeBtn": { en: "Resume →", es: "Continuar →" },
  "session.discardBtn": { en: "Discard", es: "Descartar" },
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
  "session.completed": { en: "completed", es: "completados" },
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
    en: "Stretching the muscles you just worked. Cooldown normalizes cortisol levels — essential for hypothyroid recovery. Don't skip it.",
    es: "Estirando los músculos que acabas de trabajar. El enfriamiento normaliza los niveles de cortisol — esencial para la recuperación con hipotiroidismo. No lo saltes.",
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
  "session.exitConfirmTitle": { en: "End session?", es: "¿Terminar sesión?" },
  "session.exitConfirmDesc": {
    en: "Your logged sets will be saved, but the session will not be marked complete.",
    es: "Tus series registradas se guardarán, pero la sesión no se marcará como completada.",
  },
  "session.exitConfirmEnd": { en: "End Session", es: "Terminar" },
  "session.exercisesDone": { en: "exercises done", es: "ejercicios hechos" },
  "session.exerciseOf": { en: "Exercise {current} of {total}", es: "Ejercicio {current} de {total}" },
  "session.prev": { en: "‹ Prev", es: "‹ Anterior" },
  "session.skip": { en: "Skip →", es: "Saltar →" },
  "session.skipConfirmTitle": { en: "Skip exercise?", es: "¿Saltar ejercicio?" },
  "session.skipPartialTitle": { en: "Move on?", es: "¿Continuar?" },
  "session.skipConfirmDesc": { en: "No sets will be logged for this exercise.", es: "No se registrarán series para este ejercicio." },
  "session.setsCompleted": { en: "sets completed", es: "series completadas" },
  "session.skipConfirmBtn": { en: "Skip", es: "Saltar" },
  "session.suggested": { en: "Suggested", es: "Sugerido" },

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
  "progress.waistCm": { en: "Waist cm", es: "Cintura cm" },
  "progress.hipCm": { en: "Hip cm", es: "Cadera cm" },
  "progress.thighCm": { en: "Thigh cm", es: "Muslo cm" },
  "progress.waist": { en: "Waist", es: "Cintura" },
  "progress.hip": { en: "Hip", es: "Cadera" },
  "progress.thigh": { en: "Thigh", es: "Muslo" },
  "progress.weightKg": { en: "Weight kg", es: "Peso kg" },
  "progress.weight": { en: "Weight", es: "Peso" },
  "progress.weightTrend": { en: "Weight trend", es: "Tendencia de peso" },
  "progress.rollingAvg": { en: "4-week avg", es: "Promedio 4 sem" },
  "progress.started": { en: "Started", es: "Inicio" },
  "progress.needAtLeast2": { en: "Need at least 2 sessions with this exercise to show a trend.", es: "Se necesitan al menos 2 sesiones con este ejercicio para mostrar una tendencia." },
  "progress.energyRedFlag": {
    en: "Your 7-day energy average ({avg7}) is significantly lower than your 30-day average ({avg30}). Consider checking recovery, sleep, and stress levels.",
    es: "Tu promedio de energía de 7 días ({avg7}) es significativamente menor que tu promedio de 30 días ({avg30}). Considera revisar tu recuperación, sueño y niveles de estrés.",
  },
  "progress.moodRedFlag": {
    en: "Your mood has been dropping this week (7-day avg: {avg7} vs 30-day: {avg30}). Listen to your body.",
    es: "Tu ánimo ha ido bajando esta semana (promedio 7 días: {avg7} vs 30 días: {avg30}). Escucha a tu cuerpo.",
  },
  "progress.hitTarget": { en: "Hit target for {count} sessions · Ready to increase", es: "Objetivo alcanzado por {count} sesiones · Listo para aumentar" },
  "progress.completedHold": { en: "Completed · Hold this week", es: "Completado · Mantener esta semana" },
  "progress.incompleteHold": { en: "Incomplete reps · Hold", es: "Reps incompletas · Mantener" },

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
  "checkin.high": { en: "High", es: "Alto" },
  "checkin.medication": { en: "Took medication today?", es: "¿Tomaste tu medicamento hoy?" },
  "checkin.medicationDesc": { en: "Levothyroxine / thyroid medication", es: "Levotiroxina / medicamento tiroideo" },
  "checkin.medicationYes": { en: "Yes", es: "Sí" },
  "progress.medicationAdherence": { en: "Medication", es: "Medicamento" },

  // Auth
  "auth.welcome": { en: "Welcome", es: "Bienvenido" },
  "auth.selectUser": { en: "Who's training today?", es: "¿Quién entrena hoy?" },
  "auth.enterPin": { en: "Enter PIN", es: "Ingresa tu PIN" },
  "auth.wrongPin": { en: "Incorrect PIN", es: "PIN incorrecto" },
  "auth.addUser": { en: "Add user", es: "Agregar usuario" },
  "auth.newUserName": { en: "Name", es: "Nombre" },
  "auth.newUserPin": { en: "PIN (optional)", es: "PIN (opcional)" },
  "auth.newUserEmoji": { en: "Choose avatar", es: "Elige avatar" },
  "auth.create": { en: "Create", es: "Crear" },
  "auth.cancel": { en: "Cancel", es: "Cancelar" },
  "auth.switchUser": { en: "Switch user", es: "Cambiar usuario" },
  "auth.noPin": { en: "No PIN", es: "Sin PIN" },

  // Rest timer (extended)
  "rest.nextUp": { en: "Next up", es: "Siguiente" },
  "rest.thyroidRecovery": { en: "Full rest supports thyroid recovery.", es: "El descanso completo apoya la recuperación tiroidea." },

  // RPE
  "rpe.title": { en: "PERCEIVED EXERTION", es: "ESFUERZO PERCIBIDO" },
  "rpe.question": { en: "How hard was that?", es: "¿Qué tan difícil fue?" },
  "rpe.helpsAdjust": { en: "This helps adjust your training.", es: "Esto ayuda a ajustar tu entrenamiento." },
  "rpe.skip": { en: "Skip →", es: "Saltar →" },

  // Onboarding
  "onboarding.greeting": { en: "Hey {name}!", es: "¡Hola {name}!" },
  "onboarding.introDesc": {
    en: "Hypothyroidism slows metabolism and recovery. This program adapts: longer rest for the nervous system, ~45 min sessions to keep cortisol in check, mandatory warmup and cooldown, and conservative progression to prevent overtraining.",
    es: "El hipotiroidismo ralentiza el metabolismo y la recuperación. Este programa se adapta: descansos más largos para el sistema nervioso, sesiones de ~45 min para no disparar el cortisol, calentamiento y enfriamiento obligatorios, y progresión conservadora para evitar el sobreentrenamiento.",
  },
  "onboarding.featureRestTitle": { en: "Adapted rest times", es: "Descansos adaptados" },
  "onboarding.featureRestDesc": { en: "2-3 min between sets, increasing with intensity", es: "2-3 min entre series, aumentando con la intensidad" },
  "onboarding.featureOverloadTitle": { en: "Progressive overload", es: "Sobrecarga progresiva" },
  "onboarding.featureOverloadDesc": { en: "Conservative 5% increases every 2 weeks", es: "Incrementos conservadores de 5% cada 2 semanas" },
  "onboarding.featureRpeTitle": { en: "RPE per set", es: "RPE por serie" },
  "onboarding.featureRpeDesc": { en: "Track perceived effort to adjust intensity", es: "Registra el esfuerzo percibido para ajustar la intensidad" },
  "onboarding.featureWellnessTitle": { en: "Wellness monitoring", es: "Monitoreo de bienestar" },
  "onboarding.featureWellnessDesc": { en: "Daily check-ins for energy, sleep, and soreness", es: "Check-ins diarios de energía, sueño y dolor muscular" },
  "onboarding.next": { en: "Next →", es: "Siguiente →" },
  "onboarding.levelTitle": { en: "What's your level?", es: "¿Cuál es tu nivel?" },
  "onboarding.levelDesc": {
    en: "This adjusts suggested weights for your first workout.",
    es: "Esto ajusta los pesos sugeridos para tu primer entrenamiento.",
  },
  "onboarding.beginner": { en: "Beginner", es: "Principiante" },
  "onboarding.beginnerDesc": { en: "Less than 6 months of weight training", es: "Menos de 6 meses entrenando con pesas" },
  "onboarding.intermediate": { en: "Intermediate", es: "Intermedio" },
  "onboarding.intermediateDesc": { en: "6 months to 2 years of experience", es: "6 meses a 2 años de experiencia" },
  "onboarding.advanced": { en: "Advanced", es: "Avanzado" },
  "onboarding.advancedDesc": { en: "2+ years of consistent training", es: "Más de 2 años entrenando consistentemente" },
  "onboarding.allSet": { en: "All set!", es: "¡Todo listo!" },
  "onboarding.summaryDesc": {
    en: "Your 16-week program is configured. You train 3 times per week with rest periods adapted to your condition.",
    es: "Tu programa de 16 semanas está configurado. Entrenas 3 veces por semana con descansos adaptados a tu condición.",
  },
  "onboarding.yourProgram": { en: "YOUR PROGRAM", es: "TU PROGRAMA" },
  "onboarding.duration": { en: "Duration", es: "Duración" },
  "onboarding.durationValue": { en: "16 weeks (3 phases)", es: "16 semanas (3 fases)" },
  "onboarding.frequency": { en: "Frequency", es: "Frecuencia" },
  "onboarding.frequencyValue": { en: "3 sessions/week", es: "3 sesiones/semana" },
  "onboarding.level": { en: "Level", es: "Nivel" },
  "onboarding.startingWeights": { en: "Starting weights", es: "Pesos iniciales" },
  "onboarding.startingWeightsValue": { en: "Adjusted to your level", es: "Ajustados a tu nivel" },
  "onboarding.startTraining": { en: "Start training!", es: "¡Empezar a entrenar!" },
  "onboarding.skip": { en: "Skip →", es: "Saltar →" },

  // Home — phase descriptions
  "home.phaseStabilization": {
    en: "Stabilization: lighter load to prepare joints and nervous system.",
    es: "Estabilización: carga ligera para preparar articulaciones y sistema nervioso.",
  },
  "home.phaseHypertrophy": {
    en: "Hypertrophy: muscle growth with controlled volume to avoid thyroid stress.",
    es: "Hipertrofia: crecimiento muscular con volumen controlado para no estresar la tiroides.",
  },
  "home.phaseStrength": {
    en: "Strength: heavier loads with longer rest — cortisol stays in check.",
    es: "Fuerza: cargas más altas con descansos largos — el cortisol se mantiene bajo control.",
  },

  // Recovery tips
  "recovery.walkTitle": { en: "Light walk", es: "Caminata ligera" },
  "recovery.walkDesc": {
    en: "20-30 min at easy pace. Improves blood flow and speeds recovery without stressing the nervous system.",
    es: "20-30 min a ritmo suave. Mejora el flujo sanguíneo y acelera la recuperación sin estresar el sistema nervioso.",
  },
  "recovery.stretchTitle": { en: "Stretching or yoga", es: "Estiramientos o yoga" },
  "recovery.stretchDesc": {
    en: "15-20 min of gentle stretching or restorative yoga. Lowers cortisol and improves joint mobility.",
    es: "15-20 min de estiramientos suaves o yoga restaurativo. Reduce el cortisol y mejora la movilidad articular.",
  },
  "recovery.sleepTitle": { en: "Sleep 7-9 hours", es: "Dormir 7-9 horas" },
  "recovery.sleepDesc": {
    en: "Sleep is when the body repairs muscle tissue. With hypothyroidism, sleep quality is even more critical.",
    es: "El sueño es cuando el cuerpo repara el tejido muscular. Con hipotiroidismo, la calidad del sueño es aún más crítica.",
  },
  "recovery.nutritionTitle": { en: "Hydration & nutrition", es: "Hidratación y nutrición" },
  "recovery.nutritionDesc": {
    en: "Adequate protein (1.6-2g/kg) and hydration support muscle synthesis and thyroid function.",
    es: "Proteína suficiente (1.6-2g/kg) y buena hidratación apoyan la síntesis muscular y la función tiroidea.",
  },
  "recovery.stressTitle": { en: "Stress management", es: "Manejo del estrés" },
  "recovery.stressDesc": {
    en: "Chronic stress elevates cortisol and suppresses thyroid. Deep breathing, meditation, or time in nature.",
    es: "El estrés crónico eleva el cortisol y suprime la tiroides. Respiración profunda, meditación o tiempo en la naturaleza.",
  },
  "recovery.walkExpanded": {
    en: "Keep it gentle — zone 2 heart rate (you can hold a conversation). Walking outdoors gives extra benefits from sunlight, which supports vitamin D synthesis important for thyroid function. Log your walk below!",
    es: "Mantenlo suave — zona 2 de frecuencia cardíaca (puedes mantener una conversación). Caminar al aire libre da beneficios extra por la luz solar, que apoya la síntesis de vitamina D importante para la función tiroidea. ¡Registra tu caminata abajo!",
  },
  "recovery.stretchExpanded": {
    en: "Focus on hip flexors, hamstrings, and thoracic spine. Hold each stretch 30-60 seconds. Yoga flows like cat-cow and child's pose are especially good for nervous system recovery. Log it below!",
    es: "Enfócate en flexores de cadera, isquiotibiales y columna torácica. Mantén cada estiramiento 30-60 segundos. Flujos de yoga como gato-vaca y postura del niño son especialmente buenos para la recuperación del sistema nervioso. ¡Regístralo abajo!",
  },
  "recovery.sleepExpanded": {
    en: "Aim for consistent bed/wake times. Avoid screens 1 hour before bed. Keep the room cool (18-20°C). With hypothyroidism, quality sleep is when your body produces most of the T3/T4 hormones needed for recovery.",
    es: "Apunta a horarios consistentes de acostarse/levantarse. Evita pantallas 1 hora antes de dormir. Mantén la habitación fresca (18-20°C). Con hipotiroidismo, el sueño de calidad es cuando tu cuerpo produce la mayoría de las hormonas T3/T4 necesarias para la recuperación.",
  },
  "recovery.nutritionExpanded": {
    en: "Prioritize 1.6-2g protein per kg of bodyweight. Include selenium-rich foods (Brazil nuts, fish) and zinc (pumpkin seeds, eggs) to support thyroid conversion. Stay hydrated — dehydration worsens fatigue.",
    es: "Prioriza 1.6-2g de proteína por kg de peso corporal. Incluye alimentos ricos en selenio (nueces de Brasil, pescado) y zinc (semillas de calabaza, huevos) para apoyar la conversión tiroidea. Mantente hidratada — la deshidratación empeora la fatiga.",
  },
  "recovery.stressExpanded": {
    en: "Try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s. Even 5 minutes of meditation reduces cortisol measurably. Nature exposure for 20+ minutes significantly lowers stress hormones — combine it with your walk!",
    es: "Prueba la respiración cuadrada: inhala 4s, retén 4s, exhala 4s, retén 4s. Incluso 5 minutos de meditación reduce el cortisol de forma medible. La exposición a la naturaleza por 20+ minutos reduce significativamente las hormonas del estrés — ¡combínalo con tu caminata!",
  },

  // Session page (picker)
  "session.startPlan": { en: "▶ Start", es: "▶ Iniciar" },

  // Session [planId] — pre-check
  "session.lowEnergyWarning": {
    en: "Pushing through low energy can spike cortisol and further suppress thyroid function.",
    es: "Forzar con poca energía puede elevar el cortisol y suprimir más la función tiroidea.",
  },

  // Session [planId] — hypothyroid info
  "hypo.whyTheseValues": { en: "Why these values?", es: "¿Por qué estos valores?" },
  "hypo.restLabel": { en: "Rest", es: "Descanso" },
  "hypo.repsLabel": { en: "Reps", es: "Repeticiones" },
  "hypo.durationLabel": { en: "Duration", es: "Duración" },
  "hypo.restCompound": {
    en: "Longer rest on compound lifts allows full CNS recovery — rest increases across phases as load rises. Crucial with hypothyroidism since slower metabolism affects recovery capacity.",
    es: "Los descansos más largos en ejercicios compuestos permiten una recuperación completa del sistema nervioso central — el descanso aumenta entre fases a medida que sube la carga. Algo crucial con hipotiroidismo ya que el metabolismo más lento afecta la capacidad de recuperación.",
  },
  "hypo.restAccessory": {
    en: "Accessory exercises need less rest as they work smaller muscle groups with less nervous system demand.",
    es: "Los ejercicios accesorios requieren menos descanso al trabajar grupos musculares más pequeños con menor carga sobre el sistema nervioso.",
  },
  "hypo.repsHighStabilization": {
    en: "Higher reps build work capacity and muscular endurance — ideal in the stabilization phase for mastering form.",
    es: "Las repeticiones más altas construyen capacidad de trabajo y resistencia muscular — ideal en la fase de estabilización para perfeccionar la técnica.",
  },
  "hypo.repsHypertrophy": {
    en: "Standard hypertrophy range promotes muscle growth while keeping moderate thyroid stress.",
    es: "El rango de hipertrofia estándar promueve el crecimiento muscular mientras mantiene un esfuerzo moderado sobre la tiroides.",
  },
  "hypo.repsStrength": {
    en: "Lower reps with heavier weight build maximal strength — longer rest compensates for the higher system demand.",
    es: "Menos repeticiones con más peso desarrollan fuerza máxima — los descansos más largos compensan la mayor demanda al sistema.",
  },
  "hypo.duration": {
    en: "Sessions are designed for ~45 min of work to stay within the cortisol-safe window for hypothyroid training.",
    es: "Las sesiones están diseñadas para ~45 min de trabajo para mantenerse dentro de la ventana segura de cortisol en entrenamiento con hipotiroidismo.",
  },

  // Exercise demo
  "exerciseDemo.howTo": { en: "How to do this", es: "Cómo hacerlo" },
  "exerciseDemo.noDemo": { en: "No demo available for this exercise.", es: "No hay demo disponible para este ejercicio." },

  // Auth
  "auth.selectProfile": { en: "Select your profile", es: "Selecciona tu perfil" },
  "auth.createProfile": { en: "Create your profile to start training.", es: "Crea tu perfil para empezar a entrenar." },

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

  // LISS tracking
  "home.todayActivity": { en: "Today's activity", es: "Actividad de hoy" },
  "home.walkMinutes": { en: "Walk (min)", es: "Caminata (min)" },
  "home.stretching": { en: "Stretching", es: "Estiramientos" },
  "home.yoga": { en: "Yoga", es: "Yoga" },
  "home.activitySaved": { en: "Activity logged!", es: "¡Actividad registrada!" },
  "home.logActivity": { en: "Log activity", es: "Registrar actividad" },
  "progress.weeklyLiss": { en: "Weekly LISS cardio", es: "Cardio LISS semanal" },
  "progress.lissTarget": { en: "150 min target", es: "Objetivo 150 min" },
  "progress.lissMinutes": { en: "min", es: "min" },

  // Cycle phase tracking
  "cycle.day": { en: "Day", es: "Día" },
  "cycle.menstrual": { en: "Menstrual", es: "Menstrual" },
  "cycle.follicular": { en: "Follicular", es: "Folicular" },
  "cycle.ovulation": { en: "Ovulation", es: "Ovulación" },
  "cycle.luteal": { en: "Luteal", es: "Lútea" },
  "cycle.logPeriod": { en: "Log period start", es: "Registrar inicio de periodo" },
  "cycle.startTracking": { en: "🩸 Start cycle tracking", es: "🩸 Iniciar seguimiento del ciclo" },
  "cycle.lutealSuggestion": { en: "Late luteal phase — consider lite mode if energy is low", es: "Fase lútea tardía — considera el modo lite si la energía es baja" },
  "cycle.logged": { en: "Period logged!", es: "¡Periodo registrado!" },
  "cycle.explainerTitle": { en: "Why track your cycle?", es: "¿Por qué seguir tu ciclo?" },
  "cycle.explainerDesc": {
    en: "Hypothyroidism often disrupts the menstrual cycle. Tracking it helps you train smarter — the follicular phase (after your period) is best for heavier training, while the luteal phase (before your period) may need lighter intensity. Water retention also varies 1-3 kg across the cycle, which explains weight fluctuations that aren't real fat changes.",
    es: "El hipotiroidismo a menudo altera el ciclo menstrual. Rastrearlo te ayuda a entrenar mejor — la fase folicular (después del periodo) es ideal para entrenamiento más intenso, mientras que la fase lútea (antes del periodo) puede necesitar menor intensidad. La retención de agua varía 1-3 kg durante el ciclo, lo que explica fluctuaciones de peso que no son cambios reales de grasa.",
  },
  "cycle.enableAndLog": { en: "Enable & log today", es: "Activar y registrar hoy" },
};

export function t(key: string, locale?: Locale): string {
  const l = locale ?? useI18n.getState().locale;
  return translations[key]?.[l] ?? translations[key]?.en ?? key;
}

export function useT() {
  const locale = useI18n((s) => s.locale);
  return (key: string) => t(key, locale);
}
