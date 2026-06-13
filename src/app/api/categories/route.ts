import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq } from "drizzle-orm";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
});

// GET /api/categories — list all categories
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const all = await db.select().from(categories).all();
    return NextResponse.json(all);
  } catch (e) {
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}

// POST /api/categories — create a new category
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const perms = session.user.permissions;
  if (!perms.includes("categories:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = categorySchema.parse(body);

    const inserted = await db
      .insert(categories)
      .values({
        name: data.name,
        slug: data.slug.toLowerCase().trim().replace(/[\s_]+/g, "-"),
        description: data.description ?? null,
      })
      .returning({ id: categories.id })
      .get();

    return NextResponse.json({ id: inserted.id }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: e.issues }, { status: 400 });
    }
    console.error("Create category error:", e);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
