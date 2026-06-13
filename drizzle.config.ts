import { defineConfig } from "drizzle-kit";
import path from "path";

const DB_PATH = process.env.DATABASE_URL ?? path.join(process.cwd(), "data", "cartridge.db");

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: DB_PATH,
  },
});
