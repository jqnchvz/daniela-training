import { db } from "@/lib/db";
import { cycleState } from "@/lib/db/schema";
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

  const rowId = body.userId ?? SINGLETON_ID;

  const [row] = await db
    .insert(cycleState)
    .values({
      id: rowId,
      userId: body.userId ?? null,
      cycleStartDate: body.cycleStartDate,
      extensionWeeks: body.extensionWeeks ?? 0,
      lastDeloadDate: body.lastDeloadDate,
      completedSessions: body.completedSessions ?? 0,
    })
    .onConflictDoUpdate({
      target: cycleState.id,
      set: {
        cycleStartDate: body.cycleStartDate,
        extensionWeeks: body.extensionWeeks ?? 0,
        lastDeloadDate: body.lastDeloadDate,
        completedSessions: body.completedSessions ?? 0,
        updatedAt: new Date(),
      },
    })
    .returning();

  return Response.json(row, { status: 201 });
}
