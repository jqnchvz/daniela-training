import { db } from "@/lib/db";
import { cycleState } from "@/lib/db/schema";
import { cycleSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

const SINGLETON_ID = "00000000-0000-4000-8000-000000000001";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (userId) {
    const rows = await db
      .select()
      .from(cycleState)
      .where(eq(cycleState.userId, userId))
      .limit(1);
    return Response.json(rows[0] ?? null);
  }

  const rows = await db.select().from(cycleState).limit(1);
  return Response.json(rows[0] ?? null);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = cycleSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const rowId = data.userId ?? SINGLETON_ID;

  const [row] = await db
    .insert(cycleState)
    .values({
      id: rowId,
      userId: data.userId ?? null,
      cycleStartDate: data.cycleStartDate,
      extensionWeeks: data.extensionWeeks ?? 0,
      lastDeloadDate: data.lastDeloadDate,
      completedSessions: data.completedSessions ?? 0,
    })
    .onConflictDoUpdate({
      target: cycleState.id,
      set: {
        cycleStartDate: data.cycleStartDate,
        extensionWeeks: data.extensionWeeks ?? 0,
        lastDeloadDate: data.lastDeloadDate,
        completedSessions: data.completedSessions ?? 0,
        updatedAt: new Date(),
      },
    })
    .returning();

  return Response.json(row, { status: 201 });
}
