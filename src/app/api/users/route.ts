import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPin } from "@/lib/pin-hash";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(users);
  return Response.json(
    rows.map((u) => ({
      id: u.id,
      name: u.name,
      avatarEmoji: u.avatarEmoji,
      hasPin: !!u.pinHash,
    })),
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action } = body;

  if (action === "create") {
    const [user] = await db
      .insert(users)
      .values({
        name: body.name,
        avatarEmoji: body.avatarEmoji ?? "💪",
        pinHash: body.pinHash ? await hashPin(body.pinHash) : null,
      })
      .returning();

    return Response.json(
      { id: user.id, name: user.name, avatarEmoji: user.avatarEmoji, hasPin: !!user.pinHash },
      { status: 201 },
    );
  }

  if (action === "verify-pin") {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, body.userId))
      .limit(1);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.pinHash) {
      // No PIN set — auto-verified
      return Response.json({ verified: true });
    }

    const verified = user.pinHash === await hashPin(body.pin);
    return Response.json({ verified });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
