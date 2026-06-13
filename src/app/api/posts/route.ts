import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

// GET /api/posts — list all posts
export async function GET() {
  try {
    const all = await db.select().from(posts).all();
    return NextResponse.json(all);
  } catch (e) {
    return NextResponse.json({ error: "Failed to load posts" }, { status: 500 });
  }
}

// POST /api/posts — create a new post
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.user.permissions.includes("posts:create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = postSchema.parse(body);

    const [inserted] = await db
      .insert(posts)
      .values({
        ...data,
        authorId: Number(session.user.id),
        publishedAt: data.status === "published" ? new Date().toISOString() : null,
      })
      .returning({ id: posts.id });

    return NextResponse.json({ id: inserted.id }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: e.issues }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
