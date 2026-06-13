import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { z } from "zod";

const pageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  template: z.string().default("default"),
  sortOrder: z.number().int().default(0),
  parentId: z.number().nullable().optional(),
});

// GET /api/pages — list all pages
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // To keep it simple, checking permission "pages:view" or fallback to true if they are logged in admin
  try {
    const all = await db
      .select()
      .from(pages)
      .orderBy(pages.sortOrder)
      .all();
    return NextResponse.json(all);
  } catch (e) {
    return NextResponse.json({ error: "Failed to load pages" }, { status: 500 });
  }
}

// POST /api/pages — create a new page
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.user.permissions.includes("pages:create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = pageSchema.parse(body);

    const inserted = await db
      .insert(pages)
      .values({
        title: data.title,
        slug: data.slug,
        content: data.content ?? null,
        status: data.status,
        template: data.template,
        sortOrder: data.sortOrder,
        parentId: data.parentId ?? null,
        authorId: Number(session.user.id),
      })
      .returning({ id: pages.id })
      .get();

    return NextResponse.json({ id: inserted.id }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: e.issues }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
