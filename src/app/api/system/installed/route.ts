import { NextResponse } from "next/server";
import { isInstalled } from "@/lib/db/settings";

/**
 * GET /api/system/installed
 * Lightweight endpoint called by middleware to check installation status.
 * Returns { installed: boolean }
 */
export async function GET(req: Request) {
  // Only allow calls from our own middleware
  const middlewareHeader = req.headers.get("x-middleware-check");
  if (!middlewareHeader) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const installed = await isInstalled();
    return NextResponse.json({ installed });
  } catch {
    // DB not initialized yet → not installed
    return NextResponse.json({ installed: false });
  }
}
