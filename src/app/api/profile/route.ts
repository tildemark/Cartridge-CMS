import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().optional().nullable(),
  newPassword: z.string().optional().nullable(),
});

// PUT /api/profile — update the current user's profile
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  try {
    const body = await req.json();
    const data = profileSchema.parse(body);

    // Fetch current user data from DB
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if new email is taken by another user
    if (data.email !== currentUser.email) {
      const emailExists = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .get();
      if (emailExists) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
      }
    }

    const updateData: any = {
      name: data.name,
      email: data.email,
      updatedAt: new Date().toISOString(),
    };

    // Process password update if requested
    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(data.currentPassword, currentUser.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      }

      if (data.newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters long" },
          { status: 400 }
        );
      }

      updateData.passwordHash = await bcrypt.hash(data.newPassword, 12);
    }

    await db.update(users).set(updateData).where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: e.issues }, { status: 400 });
    }
    console.error("Update profile error:", e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
