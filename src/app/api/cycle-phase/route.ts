import { db } from "@/lib/db";
import { menstrualCyclePhase } from "@/lib/db/schema";
import { cyclePhaseSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

const SINGLETON_ID = "00000000-0000-4000-8000-000000000002";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (userId) {
    const rows = await db
      .select()
      .from(menstrualCyclePhase)
      .where(eq(menstrualCyclePhase.userId, userId))
      .limit(1);
    return Response.json(rows[0] ?? null);
  }

  const rows = await db.select().from(menstrualCyclePhase).limit(1);
  return Response.json(rows[0] ?? null);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = cyclePhaseSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const rowId = data.userId ?? SINGLETON_ID;

  const [row] = await db
    .insert(menstrualCyclePhase)
    .values({
      id: rowId,
      userId: data.userId ?? null,
      enabled: data.enabled,
      periodStartDates: data.periodStartDates ?? [],
    })
    .onConflictDoUpdate({
      target: menstrualCyclePhase.id,
      set: {
        userId: data.userId ?? null,
        enabled: data.enabled,
        periodStartDates: data.periodStartDates ?? [],
        updatedAt: new Date(),
      },
    })
    .returning();

  return Response.json(row, { status: 201 });
}
