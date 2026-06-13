import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

// DELETE /api/categories/[id] — delete category
export async function DELETE(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const perms = session.user.permissions;
  if (!perms.includes("categories:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.id, Number(id)))
      .get();

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await db.delete(categories).where(eq(categories.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete category error:", e);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
