import { db } from "@/lib/db";
import { sessions, sessionSets } from "@/lib/db/schema";
import { sessionSchema } from "@/lib/validations";
import { count, desc, eq } from "drizzle-orm";

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

  const whereClause = userId ? eq(sessions.userId, userId) : undefined;

  const [[{ total }], data] = await Promise.all([
    db.select({ total: count() }).from(sessions).where(whereClause),
    db.query.sessions.findMany({
      with: { sets: true },
      orderBy: [desc(sessions.date)],
      ...(whereClause ? { where: whereClause } : {}),
      limit,
      offset,
    }),
  ]);

  return Response.json({ data, total, limit, offset });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = sessionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { sets, ...sessionData } = parsed.data;

  const result = await db.transaction(async (tx) => {
    const [session] = await tx
      .insert(sessions)
      .values({
        id: sessionData.id,
        userId: sessionData.userId ?? null,
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
      const existingSets = await tx
        .select()
        .from(sessionSets)
        .where(eq(sessionSets.sessionId, sessionId))
        .limit(1);

      if (existingSets.length === 0) {
        await tx.insert(sessionSets).values(
          sets.map((s) => ({
            sessionId,
            exerciseId: s.exerciseId,
            exerciseName: s.exerciseName,
            setNumber: s.setNumber,
            weight: s.weight,
            reps: s.reps,
            rpe: s.rpe ?? null,
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
