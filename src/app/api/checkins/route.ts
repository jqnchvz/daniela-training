import { db } from "@/lib/db";
import { checkins } from "@/lib/db/schema";
import { checkinSchema } from "@/lib/validations";
import { count, desc, eq, and, sql } from "drizzle-orm";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  const limit = Math.min(
    Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT),
    MAX_LIMIT,
  );
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

  const whereClause = userId ? eq(checkins.userId, userId) : undefined;

  const [[{ total }], data] = await Promise.all([
    db.select({ total: count() }).from(checkins).where(whereClause),
    db
      .select()
      .from(checkins)
      .where(whereClause)
      .orderBy(desc(checkins.date))
      .limit(limit)
      .offset(offset),
  ]);

  return Response.json({ data, total, limit, offset });
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
        walkMinutes: data.walkMinutes ?? null,
        didStretching: data.didStretching ?? null,
        didYoga: data.didYoga ?? null,
        tookMedication: data.tookMedication ?? null,
      })
      .where(eq(checkins.id, existing[0].id))
      .returning();

    return Response.json(row, { status: 200 });
  }

  const [row] = await db
    .insert(checkins)
    .values({
      id: data.id ?? crypto.randomUUID(),
      userId: data.userId ?? null,
      date: data.date,
      energy: data.energy,
      sleepQuality: data.sleepQuality,
      sleepHours: data.sleepHours,
      mood: data.mood,
      soreness: data.soreness,
      notes: data.notes ?? "",
      walkMinutes: data.walkMinutes ?? null,
      didStretching: data.didStretching ?? null,
      didYoga: data.didYoga ?? null,
      tookMedication: data.tookMedication ?? null,
    })
    .returning();

  return Response.json(row, { status: 201 });
}
