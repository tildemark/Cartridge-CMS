import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  content: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  template: z.string().optional(),
  sortOrder: z.number().int().optional(),
  parentId: z.number().nullable().optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/pages/[id]
export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const page = await db.select().from(pages).where(eq(pages.id, Number(id))).get();
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

// PUT /api/pages/[id]
export async function PUT(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = session.user.permissions;
  if (!perms.includes("pages:edit_own") && !perms.includes("pages:edit_others")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const existing = await db.select().from(pages).where(eq(pages.id, Number(id))).get();
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Check own-only permission
    if (!perms.includes("pages:edit_others") && existing.authorId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Forbidden: not your page" }, { status: 403 });
    }

    const updateData: any = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (data.parentId === undefined) {
      delete updateData.parentId;
    }

    await db.update(pages).set(updateData).where(eq(pages.id, Number(id)));

    return NextResponse.json({ id: Number(id) });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

// DELETE /api/pages/[id]
export async function DELETE(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = session.user.permissions;
  const { id } = await params;

  const existing = await db.select().from(pages).where(eq(pages.id, Number(id))).get();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwn = existing.authorId === Number(session.user.id);
  const canDelete = (isOwn && perms.includes("pages:delete_own")) || perms.includes("pages:delete_others");

  if (!canDelete) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.delete(pages).where(eq(pages.id, Number(id)));
  return NextResponse.json({ success: true });
}
