/**
 * Guards the generated schema artifacts against drift.
 *
 * `drizzle/pg/apply.sql` (pasted into the Supabase SQL Editor) and
 * `BOOTSTRAP_SQL` (applied by /api/bootstrap-db) are generated from
 * server/db/schema.ts by scripts/gen-bootstrap-sql.mjs. They were previously
 * hand-maintained and silently fell behind: the `bookings` table and its enum
 * shipped in migration 0001 but reached neither artifact, so every database set
 * up through the documented path was missing the entire CRM.
 *
 * These tests fail if that happens again. If one fails, run:
 *
 *   pnpm gen:bootstrap
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getTableName, is } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { BOOTSTRAP_SQL } from "./db/bootstrap-sql";
import * as schema from "./db/schema";

const APPLY_SQL = readFileSync(
  path.join(__dirname, "..", "drizzle", "pg", "apply.sql"),
  "utf8"
);

/** Every table declared in the Drizzle schema, by SQL name. */
const schemaTables = Object.values(schema)
  .filter((v): v is PgTable => is(v, PgTable))
  .map(getTableName)
  .sort();

describe("generated schema artifacts", () => {
  it("declares at least the tables we know about", () => {
    expect(schemaTables).toEqual(
      expect.arrayContaining([
        "api_keys",
        "bookings",
        "clients",
        "invoices",
        "line_items",
        "memberships",
        "organizations",
        "payments",
        "subscriptions",
        "users",
        "webhook_events",
      ])
    );
  });

  it.each(schemaTables)("apply.sql creates %s", table => {
    expect(APPLY_SQL).toContain(`CREATE TABLE "${table}"`);
  });

  it.each(schemaTables)("BOOTSTRAP_SQL creates %s", table => {
    expect(BOOTSTRAP_SQL).toContain(`CREATE TABLE "${table}"`);
  });

  it("keeps BOOTSTRAP_SQL byte-identical to apply.sql", () => {
    expect(BOOTSTRAP_SQL).toBe(APPLY_SQL);
  });

  it("includes the enum types the schema depends on", () => {
    for (const enumName of [
      "booking_status",
      "invoice_status",
      "member_role",
      "payment_status",
      "plan_tier",
      "subscription_status",
    ]) {
      expect(APPLY_SQL).toContain(`CREATE TYPE "public"."${enumName}"`);
    }
  });

  it("casts auth.uid() to text in RLS policies", () => {
    // users.id / memberships.user_id are Clerk strings (varchar); auth.uid()
    // is a uuid. Without the cast Postgres rejects the comparison outright.
    //
    // The local-dev stub block declares auth.uid() rather than comparing against
    // it, so it is excluded — that block is covered by the test below.
    const executable = APPLY_SQL.split("\n")
      .filter(line => !line.trimStart().startsWith("--"))
      .join("\n")
      .replace(/do \$bootstrap\$[\s\S]*?\$bootstrap\$;/g, "");
    expect(executable).toContain("auth.uid()::text");
    expect(executable).not.toMatch(/auth\.uid\(\)(?!::text)/);
  });

  it("installs an auth.uid() stub when there is no auth schema", () => {
    // Supabase provides auth.uid(); a plain local Postgres does not, and every
    // policy would fail to compile without it. The stub returns NULL, so the
    // policies match no rows — the API connects as the table owner and bypasses
    // RLS anyway. Guarded on the schema being absent, so it is a no-op on
    // Supabase and the real auth.uid() is used there.
    expect(APPLY_SQL).toMatch(/if to_regnamespace\('auth'\) is null then/);
    expect(APPLY_SQL).toContain("create schema auth");
    expect(APPLY_SQL).toMatch(
      /create function auth\.uid\(\) returns uuid language sql stable as 'select null::uuid'/
    );
  });

  it("enables row level security on every org-scoped table", () => {
    for (const table of [
      "api_keys",
      "bookings",
      "clients",
      "invoices",
      "memberships",
      "organizations",
      "payments",
      "subscriptions",
      "users",
    ]) {
      expect(APPLY_SQL).toMatch(
        new RegExp(`alter table public\\.${table}\\s+enable row level security`)
      );
    }
  });
});
