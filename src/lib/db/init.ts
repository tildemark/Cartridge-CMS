/**
 * Database initializer — runs on first startup / setup completion.
 * Creates all tables and seeds RBAC data.
 * Called from the setup wizard API route.
 */
import { db, sqlite } from "@/lib/db";
import {
  roles,
  permissions,
  rolePermissions,
  settings,
} from "@/lib/db/schema";
import { DEFAULT_ROLES, ALL_PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/db/seed";
import fs from "fs";
import path from "path";

/**
 * Ensure the data directory exists and run all table creation SQL.
 */
export function initializeDatabase() {
  // Ensure data dir exists
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create tables in dependency order
  sqlite.exec(`
    DROP TABLE IF EXISTS menu_items;
    DROP TABLE IF EXISTS menus;
    DROP TABLE IF EXISTS pages;
    DROP TABLE IF EXISTS post_categories;
    DROP TABLE IF EXISTS posts;
    DROP TABLE IF EXISTS media;
    DROP TABLE IF EXISTS settings;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS role_permissions;
    DROP TABLE IF EXISTS permissions;
    DROP TABLE IF EXISTS roles;

    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      is_system INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      "group" TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role_id INTEGER NOT NULL REFERENCES roles(id),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      alt TEXT,
      uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      parent_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT,
      excerpt TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      featured_image_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
      published_at TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS post_categories (
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      parent_id INTEGER,
      template TEXT DEFAULT 'default',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      url TEXT,
      page_id INTEGER REFERENCES pages(id) ON DELETE SET NULL,
      parent_id INTEGER,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);
}

/**
 * Seed default roles and permissions into the database.
 * Safe to call multiple times (uses INSERT OR IGNORE).
 */
export async function seedRbac() {
  // Insert roles
  for (const role of DEFAULT_ROLES) {
    await db.insert(roles).values(role).onConflictDoNothing();
  }

  // Insert permissions
  for (const perm of ALL_PERMISSIONS) {
    await db.insert(permissions).values(perm).onConflictDoNothing();
  }

  // Get all roles and permissions from DB (with their IDs)
  const allRoles = await db.select().from(roles).all();
  const allPerms = await db.select().from(permissions).all();

  const permMap = new Map(allPerms.map((p) => [p.name, p.id]));

  // Assign permissions to roles
  for (const role of allRoles) {
    const permNames = ROLE_PERMISSIONS[role.slug] ?? [];
    for (const permName of permNames) {
      const permId = permMap.get(permName);
      if (!permId) continue;
      await db
        .insert(rolePermissions)
        .values({ roleId: role.id, permissionId: permId })
        .onConflictDoNothing();
    }
  }
}

/**
 * Set default site settings.
 */
export async function seedDefaultSettings(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    site_name: "My Website",
    site_description: "Powered by Cartridge CMS",
    site_url: "http://localhost:3000",
    active_theme: "clarity",
    posts_per_page: "10",
    installed: "false",
    ...overrides,
  };

  for (const [key, value] of Object.entries(defaults)) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoNothing();
  }
}
