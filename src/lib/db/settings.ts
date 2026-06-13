import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get a single setting value by key.
 */
export async function getSetting(key: string): Promise<string | null> {
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .get();
  return row?.value ?? null;
}

/**
 * Get multiple settings at once.
 */
export async function getSettings(
  keys: string[]
): Promise<Record<string, string | null>> {
  const rows = await db.select().from(settings).all();
  const map: Record<string, string | null> = {};
  for (const key of keys) {
    map[key] = rows.find((r) => r.key === key)?.value ?? null;
  }
  return map;
}

/**
 * Set a single setting value.
 */
export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

/**
 * Set multiple settings at once.
 */
export async function setSettings(
  entries: Record<string, string>
): Promise<void> {
  for (const [key, value] of Object.entries(entries)) {
    await setSetting(key, value);
  }
}

/**
 * Returns true if the CMS has been installed (setup wizard completed).
 */
export async function isInstalled(): Promise<boolean> {
  try {
    const value = await getSetting("installed");
    return value === "true";
  } catch {
    // DB might not be set up yet
    return false;
  }
}
