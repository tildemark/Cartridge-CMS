import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";

// GET /api/roles — list available user roles
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db.select().from(roles).all();
    return NextResponse.json(list);
  } catch (e) {
    console.error("List roles error:", e);
    return NextResponse.json({ error: "Failed to load roles" }, { status: 500 });
  }
}
