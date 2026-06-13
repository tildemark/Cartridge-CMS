import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { setSettings, getSettings } from "@/lib/db/settings";
import { z } from "zod";

const settingsSchema = z.object({
  site_name: z.string().optional(),
  site_description: z.string().optional(),
  site_url: z.string().optional(),
  posts_per_page: z.string().optional(),
  active_theme: z.string().optional(),
});

// GET /api/settings
export async function GET() {
  try {
    const data = await getSettings([
      "site_name", "site_description", "site_url",
      "posts_per_page", "active_theme",
    ]);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

// PUT /api/settings
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.permissions.includes("settings:edit")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = settingsSchema.parse(body);

    const toSave: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) toSave[key] = value;
    }

    await setSettings(toSave);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
