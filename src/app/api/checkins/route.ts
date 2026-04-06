import { db } from "@/lib/db";
import { checkins } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(checkins)
    .orderBy(desc(checkins.date));

  return Response.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();

  // Upsert: replace if same date exists
  const [row] = await db
    .insert(checkins)
    .values({
      id: body.id,
      date: body.date,
      energy: body.energy,
      sleepQuality: body.sleepQuality,
      sleepHours: body.sleepHours,
      mood: body.mood,
      soreness: body.soreness,
      notes: body.notes ?? "",
    })
    .onConflictDoUpdate({
      target: checkins.date,
      set: {
        energy: body.energy,
        sleepQuality: body.sleepQuality,
        sleepHours: body.sleepHours,
        mood: body.mood,
        soreness: body.soreness,
        notes: body.notes ?? "",
      },
    })
    .returning();

  return Response.json(row, { status: 201 });
}
