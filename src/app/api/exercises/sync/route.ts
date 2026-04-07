import { db } from "@/lib/db";
import { exerciseCache } from "@/lib/db/schema";
import { EXERCISES } from "@/lib/exercises";

/**
 * Search terms to match our exercises to ExerciseDB results.
 * Keys are our exercise IDs, values are search queries for ExerciseDB.
 */
const SEARCH_MAP: Record<string, string> = {
  "a0000000-0000-4000-8000-000000000001": "goblet squat",
  "a0000000-0000-4000-8000-000000000002": "dumbbell romanian deadlift",
  "a0000000-0000-4000-8000-000000000003": "dumbbell bench press",
  "a0000000-0000-4000-8000-000000000004": "overhead press",
  "a0000000-0000-4000-8000-000000000005": "dumbbell bent over row",
  "a0000000-0000-4000-8000-000000000006": "dumbbell lunge",
  "a0000000-0000-4000-8000-000000000007": "hip thrust",
  "a0000000-0000-4000-8000-000000000008": "lat pulldown",
  "a0000000-0000-4000-8000-000000000009": "leg press",
  "a0000000-0000-4000-8000-00000000000a": "cable rear delt fly",
  "a0000000-0000-4000-8000-00000000000b": "dumbbell bicep curl",
  "a0000000-0000-4000-8000-00000000000c": "triceps pushdown",
  "a0000000-0000-4000-8000-00000000000d": "dumbbell lateral raise",
  "a0000000-0000-4000-8000-00000000000e": "standing calf raise",
  "a0000000-0000-4000-8000-00000000000f": "front plank",
  "a0000000-0000-4000-8000-000000000010": "dead bug",
  "a0000000-0000-4000-8000-000000000011": "cable twist",
};

const EXERCISEDB_HOST = "exercisedb.p.rapidapi.com";
const EXERCISEDB_BASE = `https://${EXERCISEDB_HOST}/exercises`;

async function searchExerciseDB(query: string): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `${EXERCISEDB_BASE}/name/${encodeURIComponent(query)}?offset=0&limit=3`,
      {
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": EXERCISEDB_HOST,
        },
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const exercises = Array.isArray(data) ? data : data.data;
    if (!exercises || exercises.length === 0) return null;
    // Prefer dumbbell variant if available
    const dbVariant = exercises.find(
      (e: Record<string, unknown>) => String(e.equipment ?? "").includes("dumbbell"),
    );
    return dbVariant ?? exercises[0];
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return Response.json({ error: "RAPIDAPI_KEY not configured" }, { status: 500 });
  }

  const results: Array<{ id: string; name: string; status: string }> = [];

  for (const exercise of EXERCISES) {
    const searchTerm = SEARCH_MAP[exercise.id];
    if (!searchTerm) {
      results.push({ id: exercise.id, name: exercise.name, status: "no_mapping" });
      continue;
    }

    const match = await searchExerciseDB(searchTerm);
    if (!match) {
      results.push({ id: exercise.id, name: exercise.name, status: "not_found" });
      continue;
    }

    const toArr = (v: unknown): string[] =>
      Array.isArray(v) ? v.map(String) : v ? [String(v)] : [];

    const row = {
      exerciseId: exercise.id,
      exercisedbId: String(match.id ?? ""),
      name: exercise.name,
      gifUrl: match.gifUrl ? String(match.gifUrl) : null,
      description: match.description ? String(match.description) : null,
      instructions: toArr(match.instructions),
      targetMuscles: toArr(match.target ?? match.targetMuscles),
      bodyParts: toArr(match.bodyPart ?? match.bodyParts),
      equipments: toArr(match.equipment ?? match.equipments),
      secondaryMuscles: toArr(match.secondaryMuscles),
      syncedAt: new Date(),
    };

    await db
      .insert(exerciseCache)
      .values(row)
      .onConflictDoUpdate({
        target: exerciseCache.exerciseId,
        set: row,
      });

    results.push({ id: exercise.id, name: exercise.name, status: "synced" });

    // Rate limit: small delay between requests
    await new Promise((r) => setTimeout(r, 200));
  }

  return Response.json({ results });
}

export async function GET() {
  const rows = await db.select().from(exerciseCache);
  return Response.json(rows);
}
