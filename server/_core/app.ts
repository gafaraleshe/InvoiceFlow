import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { sql } from "drizzle-orm";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { db, client } from "../db/client";
import { BOOTSTRAP_SQL } from "../db/bootstrap-sql";
import { createRestApi } from "../rest";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  /**
   * Readiness probe — the first thing to hit when a deploy misbehaves.
   *
   * Each failing check carries a `fix` naming the exact thing to set, so a
   * broken deployment diagnoses itself instead of failing silently at sign-in.
   *
   * Anonymous callers get pass/fail plus those hints and nothing else. Schema
   * detail (database name, table list, column types) is only returned with
   * `?secret=<CRON_SECRET>` — it is useful for debugging but is not something
   * to hand to the public internet.
   */
  app.get("/api/health", async (req, res) => {
    const detailed =
      Boolean(process.env.CRON_SECRET) &&
      req.query.secret === process.env.CRON_SECRET;

    const clerkSecret = Boolean(process.env.CLERK_SECRET_KEY);
    const databaseUrl = Boolean(
      process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.POSTGRES_PRISMA_URL
    );

    let dbConnect = false;
    let currentDatabase: string | null = null;
    let usersIdType: string | null = null;
    let publicTables: string[] = [];
    let schemaApplied = false;
    let error: string | undefined;

    if (databaseUrl) {
      try {
        const meta = (await db.execute(
          sql`select current_database() as db`
        )) as unknown as { db: string }[];
        currentDatabase = meta[0]?.db ?? null;
        dbConnect = true;

        const tbls = (await db.execute(
          sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`
        )) as unknown as { table_name: string }[];
        publicTables = tbls.map(t => t.table_name);

        // Every table the app actually needs. `bookings` is the one that went
        // missing before — the CRM fails at runtime without it.
        const required = [
          "api_keys",
          "bookings",
          "clients",
          "invoices",
          "line_items",
          "memberships",
          "organizations",
          "users",
        ];
        schemaApplied = required.every(t => publicTables.includes(t));

        // NB: filter by schema — Supabase also has auth.users (always uuid).
        const rows = (await db.execute(
          sql`select data_type from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'id'`
        )) as unknown as { data_type: string }[];
        usersIdType = rows[0]?.data_type ?? "table-missing";
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
      }
    }

    const checks = [
      {
        name: "clerk_secret_key",
        ok: clerkSecret,
        fix: "Set CLERK_SECRET_KEY (Clerk dashboard → API keys) in your host's environment variables. Sign-in cannot be verified without it.",
      },
      {
        name: "database_url",
        ok: databaseUrl,
        fix: "Set DATABASE_URL to the Supabase pooled connection string (Project Settings → Database → Connection string → URI, Transaction mode).",
      },
      {
        name: "database_reachable",
        ok: dbConnect,
        fix: "The connection string is set but the database refused it. Check the password and that the project is not paused.",
      },
      {
        name: "schema_applied",
        ok: schemaApplied,
        fix: "Run drizzle/pg/apply.sql in the Supabase SQL Editor (or `pnpm db:pg:migrate`). Missing tables mean the CRM will fail at runtime.",
      },
      {
        name: "users_id_is_varchar",
        ok: usersIdType === "character varying",
        fix: "users.id must be varchar — Clerk ids are strings, not uuids. Re-apply drizzle/pg/apply.sql.",
      },
    ];

    const failing = checks.filter(c => !c.ok);
    res.status(failing.length ? 503 : 200).json({
      ok: failing.length === 0,
      checks: checks.map(c => ({
        name: c.name,
        ok: c.ok,
        ...(c.ok ? {} : { fix: c.fix }),
      })),
      ...(error ? { error } : {}),
      ...(detailed ? { currentDatabase, usersIdType, publicTables } : {}),
    });
  });

  // One-shot schema bootstrap: applies the full schema + RLS to the database
  // the app is actually connected to. Refuses to run if the public schema
  // already has tables (unless ?secret=CRON_SECRET is provided), so it can't
  // clobber an existing database. Safe to remove once the DB is set up.
  app.get("/api/bootstrap-db", async (req, res) => {
    const secretOk =
      Boolean(process.env.CRON_SECRET) &&
      req.query.secret === process.env.CRON_SECRET;
    try {
      const existing = (await db.execute(
        sql`select table_name from information_schema.tables where table_schema = 'public'`
      )) as unknown as { table_name: string }[];

      if (existing.length > 0 && !secretOk) {
        return res.status(409).json({
          applied: false,
          reason:
            "public schema already has tables; pass ?secret=<CRON_SECRET> to force",
          tables: existing.map(t => t.table_name),
        });
      }

      await client.unsafe(BOOTSTRAP_SQL);

      const after = (await db.execute(
        sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`
      )) as unknown as { table_name: string }[];
      res.json({ applied: true, tables: after.map(t => t.table_name) });
    } catch (e) {
      res
        .status(500)
        .json({ applied: false, error: e instanceof Error ? e.message : String(e) });
    }
  });

  registerOAuthRoutes(app);

  // Public REST API (API-key auth) — separate from the web session's tRPC path.
  app.use("/api/v1", createRestApi());

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
}
