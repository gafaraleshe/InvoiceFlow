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

const PLACEHOLDER_URL =
  "postgres://placeholder:placeholder@127.0.0.1:5432/placeholder";

const CLIENT_OPTIONS = {
  prepare: false,
  max: 1,
  // Deliberately short (5s): serverless functions have a tight budget (Vercel
  // Hobby kills at 10s), so if the database is unreachable we want the query to
  // fail fast and be turned into a clean JSON error, rather than hanging until
  // the whole function is killed and returns an unparseable "A server error has
  // occurred" page.
  connect_timeout: 5,
  idle_timeout: 20,
} as const;

/**
 * Set when the connection string is present but unusable — i.e. `postgres()`
 * refused to parse it. Null when the string is absent or fine.
 *
 * postgres-js parses the URL eagerly at construction, so a malformed string
 * throws *at import time*. On a serverless deploy that takes down every route
 * including /api/health — the one endpoint whose job is to tell you the
 * connection string is wrong. The overwhelmingly common cause is a password
 * containing `%`, `@` or `+` that was pasted into the URI without
 * percent-encoding, which yields `URIError: URI malformed`.
 *
 * So: never throw here. Record the reason, fall back to the non-connecting
 * placeholder, and let the health probe report it in a form that names the fix.
 */
export let dbConfigError: string | null = null;

// Non-connecting placeholder when unconfigured — postgres-js only dials on the
// first query, so constructing it is always safe.
function createClient() {
  if (!connectionString) return postgres(PLACEHOLDER_URL, CLIENT_OPTIONS);
  try {
    return postgres(connectionString, CLIENT_OPTIONS);
  } catch (e) {
    dbConfigError = e instanceof Error ? e.message : String(e);
    console.error(
      `[db] DATABASE_URL is set but could not be parsed: ${dbConfigError}. ` +
        "If your password contains %, @, + or /, percent-encode it " +
        "(% -> %25, @ -> %40, + -> %2B, / -> %2F). Database features are " +
        "disabled until this is fixed."
    );
    return postgres(PLACEHOLDER_URL, CLIENT_OPTIONS);
  }
}

const client = createClient();

export const db = drizzle(client, { schema });
export { schema, client };
