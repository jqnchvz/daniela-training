import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { userActionSchema } from "@/lib/validations";
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
  const parsed = userActionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  if (data.action === "create") {
    const [user] = await db
      .insert(users)
      .values({
        name: data.name,
        avatarEmoji: data.avatarEmoji ?? "💪",
        pinHash: data.pinHash ? await hashPin(data.pinHash) : null,
      })
      .returning();

    return Response.json(
      { id: user.id, name: user.name, avatarEmoji: user.avatarEmoji, hasPin: !!user.pinHash },
      { status: 201 },
    );
  }

  if (data.action === "verify-pin") {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.pinHash) {
      // No PIN set — auto-verified
      return Response.json({ verified: true });
    }

    const verified = user.pinHash === await hashPin(data.pin);
    return Response.json({ verified });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
