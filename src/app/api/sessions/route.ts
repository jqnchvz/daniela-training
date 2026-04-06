import { db } from "@/lib/db";
import { sessions, sessionSets } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.query.sessions.findMany({
    with: { sets: true },
    orderBy: [desc(sessions.date)],
  });

  return Response.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { sets, ...sessionData } = body;

  // Use a transaction to ensure session + sets are saved atomically
  const result = await db.transaction(async (tx) => {
    const [session] = await tx
      .insert(sessions)
      .values({
        id: sessionData.id,
        planId: sessionData.planId,
        planName: sessionData.planName,
        date: sessionData.date,
        startedAt: sessionData.startedAt,
        completedAt: sessionData.completedAt,
        durationMinutes: sessionData.durationMinutes,
        energyPre: sessionData.energyPre,
        energyPost: sessionData.energyPost,
        sleepScore: sessionData.sleepScore,
        sorenessScore: sessionData.sorenessScore,
        sessionMode: sessionData.sessionMode ?? "full",
        notes: sessionData.notes ?? "",
      })
      .onConflictDoNothing()
      .returning();

    const sessionId = session?.id ?? sessionData.id;

    if (sets && sets.length > 0) {
      // Check if sets already exist for this session (idempotent re-sync)
      const existingSets = await tx
        .select()
        .from(sessionSets)
        .where(eq(sessionSets.sessionId, sessionId))
        .limit(1);

      if (existingSets.length === 0) {
        await tx.insert(sessionSets).values(
          sets.map((s: Record<string, unknown>) => ({
            sessionId,
            exerciseId: s.exerciseId as string,
            exerciseName: s.exerciseName as string,
            setNumber: s.setNumber as number,
            weight: s.weight as number,
            reps: s.reps as number,
            rpe: s.rpe as number | null,
          })),
        );
      }
    }

    return { id: sessionId, isNew: !!session };
  });

  return Response.json(
    { id: result.id },
    { status: result.isNew ? 201 : 200 },
  );
}
