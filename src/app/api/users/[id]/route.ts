import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

// DELETE /api/users/[id] — delete user (not allowed on self)
export async function DELETE(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const perms = session.user.permissions;
  if (!perms.includes("users:delete")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (Number(id) === Number(session.user.id)) {
    return NextResponse.json({ error: "Self-deletion is not allowed" }, { status: 400 });
  }

  try {
    await db.delete(users).where(eq(users.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete user error:", e);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
