import { db } from "@/lib/db";
import { sessions, sessionSets } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

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

  const [session] = await db
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

  if (!session) {
    // Already exists — idempotent success
    return Response.json({ id: sessionData.id }, { status: 200 });
  }

  if (sets && sets.length > 0) {
    await db.insert(sessionSets).values(
      sets.map((s: Record<string, unknown>) => ({
        sessionId: session.id,
        exerciseId: s.exerciseId as string,
        exerciseName: s.exerciseName as string,
        setNumber: s.setNumber as number,
        weight: s.weight as number,
        reps: s.reps as number,
        rpe: s.rpe as number | null,
      })),
    );
  }

  return Response.json(session, { status: 201 });
}
