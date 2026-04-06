import { db } from "@/lib/db";
import { checkins } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  const rows = await db
    .select()
    .from(checkins)
    .where(userId ? eq(checkins.userId, userId) : undefined)
    .orderBy(desc(checkins.date));

  return Response.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();

  const [row] = await db
    .insert(checkins)
    .values({
      id: body.id,
      userId: body.userId ?? null,
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
