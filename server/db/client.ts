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

if (!connectionString) {
  // Don't throw at import time — the marketing site and build must not require
  // a database. Routes that actually query will surface a clear error instead.
  console.warn(
    "[db] No Postgres connection string set (DATABASE_URL / POSTGRES_URL). " +
      "Database features are disabled until it is configured."
  );
}

// A single shared client per serverless instance.
const client = connectionString
  ? postgres(connectionString, { prepare: false, max: 1 })
  : // Lazy stub: any query without a connection string fails loudly.
    (undefined as unknown as ReturnType<typeof postgres>);

export const db = drizzle(client, { schema });
export { schema };
