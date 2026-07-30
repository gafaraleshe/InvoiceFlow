/**
 * Importing the database client must never throw.
 *
 * postgres-js parses the connection URL eagerly at construction. A malformed
 * string therefore throws at *module import*, and on a serverless deploy that
 * fails every route — including /api/health, the endpoint whose entire job is
 * to tell you the connection string is wrong. The observed symptom is an opaque
 * `FUNCTION_INVOCATION_FAILED` with no way to diagnose it from outside.
 *
 * The trigger is mundane and common: a database password containing `%`, `@` or
 * `+` pasted into the URI without percent-encoding. `%Fi` is not a valid
 * percent-escape, so the URL parser rejects the whole string.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type ClientModule = typeof import("./client");

async function loadWith(url: string): Promise<ClientModule> {
  vi.resetModules();
  // Set to "" rather than deleting: client.ts imports dotenv, so an *absent*
  // key gets repopulated from a developer's .env on re-import. An empty string
  // is already present, so dotenv leaves it alone — the same trick the vitest
  // config uses to keep this suite off a real database.
  process.env.DATABASE_URL = url;
  return import("./client");
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => vi.resetModules());
afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("db client construction", () => {
  it("imports cleanly with no connection string", async () => {
    const m = await loadWith("");
    expect(m.dbConfigured).toBe(false);
    expect(m.dbConfigError).toBeNull();
    expect(m.db).toBeDefined();
  });

  it("imports cleanly with a valid connection string", async () => {
    const m = await loadWith(
      "postgres://user:sensiblepassword@db.example.com:6543/postgres"
    );
    expect(m.dbConfigured).toBe(true);
    expect(m.dbConfigError).toBeNull();
  });

  it("does not throw on a password with an un-encoded % (URI malformed)", async () => {
    // The exact shape that took production down: `%Fi` is an invalid escape.
    const m = await loadWith(
      "postgresql://postgres:2GN$Y+TMaT%FiMc@db.example.supabase.co:5432/postgres"
    );
    expect(m.dbConfigError).toMatch(/URI malformed/i);
    // Still importable and still usable as a module — queries fail, the app boots.
    expect(m.db).toBeDefined();
    expect(m.dbConfigured).toBe(true);
  });

  it("reports the failure rather than swallowing it", async () => {
    const m = await loadWith("postgresql://postgres:pw%ZZ@host:5432/postgres");
    expect(m.dbConfigError).toBeTruthy();
    expect(typeof m.dbConfigError).toBe("string");
  });
});
