import { db } from "@/lib/db";
import { exerciseCache } from "@/lib/db/schema";

export async function GET() {
  const rows = await db.select().from(exerciseCache);
  const map: Record<string, { gifUrl: string | null; instructions: string[] | null }> = {};
  for (const row of rows) {
    map[row.exerciseId] = {
      gifUrl: row.gifUrl,
      instructions: row.instructions,
    };
  }
  return Response.json(map);
}
