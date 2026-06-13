import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

interface Params {
  params: Promise<{ id: string }>;
}

// DELETE /api/media/[id] — delete a media file
export async function DELETE(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const perms = session.user.permissions;
  if (!perms.includes("media:delete")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const existing = await db
      .select()
      .from(media)
      .where(eq(media.id, Number(id)))
      .get();

    if (!existing) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Attempt to delete physical file
    const filePath = path.join(process.cwd(), "public", existing.path);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (err) {
      console.warn("Failed to delete physical file:", filePath, err);
    }

    // Delete database entry
    await db.delete(media).where(eq(media.id, Number(id)));

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete media error:", e);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
