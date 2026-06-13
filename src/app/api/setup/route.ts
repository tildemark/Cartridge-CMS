import { NextResponse } from "next/server";
import { initializeDatabase, seedRbac, seedDefaultSettings } from "@/lib/db/init";
import { db } from "@/lib/db";
import { users, roles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { setSetting } from "@/lib/db/settings";

const setupSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().optional(),
  siteUrl: z.string().url("Must be a valid URL"),
  adminName: z.string().min(1, "Name is required"),
  adminEmail: z.string().email("Must be a valid email"),
  adminPassword: z.string().min(8, "Password must be at least 8 characters"),
  activeTheme: z.string().default("clarity"),
  seedSample: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = setupSchema.parse(body);

    // Step 1: Create tables
    initializeDatabase();

    // Step 2: Seed RBAC
    await seedRbac();

    // Step 3: Seed default settings
    await seedDefaultSettings({
      site_name: data.siteName,
      site_description: data.siteDescription ?? "",
      site_url: data.siteUrl,
      active_theme: data.activeTheme,
    });

    // Step 4: Create admin user
    const superAdminRole = await db
      .select()
      .from(roles)
      .where(eq(roles.slug, "super_admin"))
      .get();

    if (!superAdminRole) {
      return NextResponse.json(
        { error: "Failed to find super_admin role" },
        { status: 500 }
      );
    }

    const passwordHash = await bcrypt.hash(data.adminPassword, 12);
    const adminUser = await db
      .insert(users)
      .values({
        name: data.adminName,
        email: data.adminEmail,
        passwordHash,
        roleId: superAdminRole.id,
        isActive: true,
      })
      .returning({ id: users.id })
      .get();

    if (data.seedSample) {
      const { seedSampleContent } = await import("@/lib/db/sample-seed");
      await seedSampleContent(adminUser.id);
    }

    // Step 5: Mark as installed
    await setSetting("installed", "true");

    const response = NextResponse.json({ success: true });
    // Set a long-lived cookie so the proxy can detect installation without a DB call
    response.cookies.set("cartridge_installed", "true", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
    });
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Setup failed. Please try again." },
      { status: 500 }
    );
  }
}
