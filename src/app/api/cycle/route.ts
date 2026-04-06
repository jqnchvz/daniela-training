import { db } from "@/lib/db";
import { cycleState } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(cycleState).limit(1);
  return Response.json(rows[0] ?? null);
}

export async function POST(request: Request) {
  const body = await request.json();

  // Single-row upsert: always update the first row or create one
  const existing = await db.select().from(cycleState).limit(1);

  let row;
  if (existing.length > 0) {
    [row] = await db
      .update(cycleState)
      .set({
        cycleStartDate: body.cycleStartDate,
        extensionWeeks: body.extensionWeeks,
        lastDeloadDate: body.lastDeloadDate,
        completedSessions: body.completedSessions,
        updatedAt: new Date(),
      })
      .where(eq(cycleState.id, existing[0].id))
      .returning();
  } else {
    [row] = await db
      .insert(cycleState)
      .values({
        cycleStartDate: body.cycleStartDate,
        extensionWeeks: body.extensionWeeks ?? 0,
        lastDeloadDate: body.lastDeloadDate,
        completedSessions: body.completedSessions ?? 0,
      })
      .returning();
  }

  return Response.json(row, { status: 201 });
}
