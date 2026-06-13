import { getSetting } from "@/lib/db/settings";
import { db } from "@/lib/db";
import { menus, menuItems, settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ThemeContext, ThemeMeta } from "./types";
import fs from "fs";
import path from "path";

/**
 * Get the currently active theme ID from settings.
 */
export async function getActiveTheme(): Promise<string> {
  try {
    return (await getSetting("active_theme")) ?? "clarity";
  } catch {
    return "clarity";
  }
}

/**
 * Load theme metadata from theme.json.
 */
export function getThemeMeta(themeId: string): ThemeMeta | null {
  try {
    const metaPath = path.join(process.cwd(), "src", "themes", themeId, "theme.json");
    const raw = fs.readFileSync(metaPath, "utf-8");
    return JSON.parse(raw) as ThemeMeta;
  } catch {
    return null;
  }
}

/**
 * List all available themes (directories with a valid theme.json).
 */
export function listThemes(): ThemeMeta[] {
  try {
    const themesDir = path.join(process.cwd(), "src", "themes");
    const entries = fs.readdirSync(themesDir, { withFileTypes: true });
    const themes: ThemeMeta[] = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const meta = getThemeMeta(entry.name);
        if (meta) themes.push(meta);
      }
    }
    return themes;
  } catch {
    return [];
  }
}

/**
 * Build the ThemeContext from the database (menus, settings).
 */
export async function buildThemeContext(): Promise<ThemeContext> {
  let siteName = "My Site";
  let siteDescription = "";
  let primaryMenuItems: ThemeContext["primaryMenu"] = [];
  let footerMenuItems: ThemeContext["footerMenu"] = [];

  try {
    const allSettings = await db.select().from(settings).all();
    const settingsMap = new Map(allSettings.map((s) => [s.key, s.value]));
    siteName = settingsMap.get("site_name") ?? siteName;
    siteDescription = settingsMap.get("site_description") ?? siteDescription;

    // Load primary menu
    const primaryMenu = await db
      .select()
      .from(menus)
      .where(eq(menus.location, "primary"))
      .get();

    if (primaryMenu) {
      const items = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.menuId, primaryMenu.id))
        .all();

      primaryMenuItems = items
        .filter((i) => !i.parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((i) => ({
          id: i.id,
          label: i.label,
          url: i.url ?? "#",
        }));
    }

    // Load footer menu
    const footerMenu = await db
      .select()
      .from(menus)
      .where(eq(menus.location, "footer"))
      .get();

    if (footerMenu) {
      const items = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.menuId, footerMenu.id))
        .all();

      footerMenuItems = items
        .filter((i) => !i.parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((i) => ({
          id: i.id,
          label: i.label,
          url: i.url ?? "#",
        }));
    }
  } catch {
    // DB not ready
  }

  return {
    siteName,
    siteDescription,
    primaryMenu: primaryMenuItems,
    footerMenu: footerMenuItems,
  };
}
