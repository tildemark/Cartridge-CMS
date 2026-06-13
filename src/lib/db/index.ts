import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import * as schema from "./schema";

const DB_PATH =
  process.env.DATABASE_URL ?? path.join(process.cwd(), "data", "cartridge.db");

// Singleton for dev (avoid multiple connections with HMR)
const globalForDb = globalThis as unknown as {
  __cartridge_db: ReturnType<typeof drizzle> | undefined;
  __cartridge_sqlite: Database.Database | undefined;
};

import fs from "fs";

function createDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const sqlite = new Database(DB_PATH);
  // Enable WAL mode for better concurrent read performance
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return { sqlite, db: drizzle(sqlite, { schema }) };
}

if (!globalForDb.__cartridge_db) {
  const { sqlite, db } = createDb();
  globalForDb.__cartridge_sqlite = sqlite;
  globalForDb.__cartridge_db = db;
}

export const db = globalForDb.__cartridge_db!;
export const sqlite = globalForDb.__cartridge_sqlite!;

export type DB = typeof db;
