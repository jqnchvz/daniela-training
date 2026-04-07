import { db } from "@/lib/db";
import { checkins } from "@/lib/db/schema";
import { checkinSchema } from "@/lib/validations";
import { desc, eq, and, sql } from "drizzle-orm";

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
  const parsed = checkinSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // Manual upsert: check if a checkin exists for this user+date, then insert or update
  const existing = await db
    .select()
    .from(checkins)
    .where(
      and(
        eq(checkins.date, data.date),
        data.userId ? eq(checkins.userId, data.userId) : sql`${checkins.userId} IS NULL`,
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    const [row] = await db
      .update(checkins)
      .set({
        energy: data.energy,
        sleepQuality: data.sleepQuality,
        sleepHours: data.sleepHours,
        mood: data.mood,
        soreness: data.soreness,
        notes: data.notes ?? "",
      })
      .where(eq(checkins.id, existing[0].id))
      .returning();

    return Response.json(row, { status: 200 });
  }

  const [row] = await db
    .insert(checkins)
    .values({
      id: data.id,
      userId: data.userId ?? null,
      date: data.date,
      energy: data.energy,
      sleepQuality: data.sleepQuality,
      sleepHours: data.sleepHours,
      mood: data.mood,
      soreness: data.soreness,
      notes: data.notes ?? "",
    })
    .returning();

  return Response.json(row, { status: 201 });
}
