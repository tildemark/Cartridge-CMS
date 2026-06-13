import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, roles } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.number().int("Role ID must be an integer"),
});

// GET /api/users — list all users
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const perms = session.user.permissions;
  if (!perms.includes("users:view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const all = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        roleName: roles.name,
        roleSlug: roles.slug,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .all();

    return NextResponse.json(all);
  } catch (e) {
    console.error("List users error:", e);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}

// POST /api/users — create a new user
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const perms = session.user.permissions;
  if (!perms.includes("users:create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = createUserSchema.parse(body);

    // Check if email already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .get();

    if (existing) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const inserted = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        passwordHash,
        roleId: data.roleId,
        isActive: true,
      })
      .returning({ id: users.id })
      .get();

    return NextResponse.json({ id: inserted.id }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: e.issues }, { status: 400 });
    }
    console.error("Create user error:", e);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
