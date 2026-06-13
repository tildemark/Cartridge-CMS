import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { listThemes } from "@/lib/themes/engine";
import { setSetting } from "@/lib/db/settings";

// GET /api/themes — list installed themes
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(listThemes());
}

// POST /api/themes — change the active theme
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // themes:switch and settings:edit are checked for theme activation edits
  const perms = session.user.permissions;
  if (!perms.includes("themes:switch") && !perms.includes("settings:edit")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { themeId } = await req.json();
    if (!themeId) {
      return NextResponse.json({ error: "themeId is required" }, { status: 400 });
    }

    const available = listThemes();
    if (!available.some((t) => t.id === themeId)) {
      return NextResponse.json({ error: "Theme does not exist" }, { status: 404 });
    }

    await setSetting("active_theme", themeId);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Switch theme error:", e);
    return NextResponse.json({ error: "Failed to update active theme" }, { status: 500 });
  }
}
