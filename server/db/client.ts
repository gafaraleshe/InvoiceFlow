/**
 * Drizzle Postgres client for Supabase.
 *
 * Reads the connection string from the environment. Supports both our own
 * `DATABASE_URL` and the names Vercel's Supabase integration provisions
 * (`POSTGRES_URL` pooled / `POSTGRES_URL_NON_POOLING` direct), so it works the
 * same locally and on Vercel without renaming anything.
 *
 * Uses the pooled (Transaction-mode / PgBouncer) connection for the serverless
 * runtime; prepared statements are disabled because PgBouncer transaction
 * pooling does not support them.
 */
// Load .env here rather than only in the server entrypoint: standalone scripts
// (pnpm seed:dev, seed:owner) import this module directly, and without it they
// silently fall through to the placeholder connection below. dotenv never
// overrides variables already set, so a real deployment's env still wins.
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  "";

export const dbConfigured = Boolean(connectionString);

if (!dbConfigured) {
  // The marketing site and the build must not require a database. The client is
  // still constructed (postgres-js connects lazily), so importing this module
  // never throws; queries simply fail clearly until a connection is configured.
  console.warn(
    "[db] No Postgres connection string set (DATABASE_URL / POSTGRES_URL). " +
      "Database features are disabled until it is configured."
  );
}

// Non-connecting placeholder when unconfigured — postgres-js only dials on the
// first query, so construction is always safe.
//
// connect_timeout is deliberately short (5s): serverless functions have a tight
// budget (Vercel Hobby kills at 10s), so if the database is unreachable we want
// the query to fail fast and be turned into a clean JSON error, rather than
// hanging until the whole function is killed and returns an unparseable
// "A server error has occurred" page.
const client = postgres(
  connectionString ||
    "postgres://placeholder:placeholder@127.0.0.1:5432/placeholder",
  { prepare: false, max: 1, connect_timeout: 5, idle_timeout: 20 }
);

export const db = drizzle(client, { schema });
export { schema, client };
