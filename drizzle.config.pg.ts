import { defineConfig } from "drizzle-kit";

/**
 * Drizzle config for the Supabase Postgres schema (Phase 1).
 * Migrations use the DIRECT (non-pooled) connection. Supports our own
 * DIRECT_URL/DATABASE_URL and Vercel's Supabase integration variable names.
 */
const url =
  process.env.DIRECT_URL ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  "";

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./drizzle/pg",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
