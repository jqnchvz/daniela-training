import { db } from "@/lib/db";
import { exerciseCache } from "@/lib/db/schema";

export async function GET() {
  const rows = await db.select().from(exerciseCache);
  const map: Record<string, {
    gifUrl: string | null;
    instructions: string[] | null;
    targetMuscles: string[] | null;
    secondaryMuscles: string[] | null;
    bodyParts: string[] | null;
    equipments: string[] | null;
  }> = {};
  for (const row of rows) {
    map[row.exerciseId] = {
      gifUrl: row.gifUrl,
      instructions: row.instructions,
      targetMuscles: row.targetMuscles,
      secondaryMuscles: row.secondaryMuscles,
      bodyParts: row.bodyParts,
      equipments: row.equipments,
    };
  }
  return Response.json(map);
}
