import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/posts/[id]
export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const post = await db.select().from(posts).where(eq(posts.id, Number(id))).get();
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

// PUT /api/posts/[id]
export async function PUT(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = session.user.permissions;
  if (!perms.includes("posts:edit_own") && !perms.includes("posts:edit_others")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const existing = await db.select().from(posts).where(eq(posts.id, Number(id))).get();
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Check own-only permission
    if (!perms.includes("posts:edit_others") && existing.authorId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Forbidden: not your post" }, { status: 403 });
    }

    const updateData: any = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (data.status === "published" && existing.status !== "published") {
      updateData.publishedAt = new Date().toISOString();
    }

    await db.update(posts).set(updateData).where(eq(posts.id, Number(id)));

    return NextResponse.json({ id: Number(id) });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE /api/posts/[id]
export async function DELETE(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = session.user.permissions;
  const { id } = await params;

  const existing = await db.select().from(posts).where(eq(posts.id, Number(id))).get();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwn = existing.authorId === Number(session.user.id);
  const canDelete = (isOwn && perms.includes("posts:delete_own")) || perms.includes("posts:delete_others");

  if (!canDelete) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.delete(posts).where(eq(posts.id, Number(id)));
  return NextResponse.json({ success: true });
}
