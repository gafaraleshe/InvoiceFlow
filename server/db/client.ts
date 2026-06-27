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
const client = postgres(
  connectionString ||
    "postgres://placeholder:placeholder@127.0.0.1:5432/placeholder",
  { prepare: false, max: 1, connect_timeout: 10 }
);

export const db = drizzle(client, { schema });
export { schema };
