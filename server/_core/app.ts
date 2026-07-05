import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { sql } from "drizzle-orm";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { db, client } from "../db/client";
import { BOOTSTRAP_SQL } from "../db/bootstrap-sql";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Unauthenticated diagnostics: reports whether the server env + database are
  // wired up correctly. Returns booleans/types only (no secret values). Safe to
  // remove once the deployment is confirmed healthy.
  app.get("/api/health", async (_req, res) => {
    const clerkSecret = Boolean(process.env.CLERK_SECRET_KEY);
    const databaseUrl = Boolean(
      process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.POSTGRES_PRISMA_URL
    );

    let dbConnect = "unknown";
    let currentDatabase: string | null = null;
    let usersIdType: string | null = null;
    let publicTables: string[] = [];
    let error: string | undefined;
    try {
      const meta = (await db.execute(
        sql`select current_database() as db`
      )) as unknown as { db: string }[];
      currentDatabase = meta[0]?.db ?? null;
      dbConnect = "ok";

      const tbls = (await db.execute(
        sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`
      )) as unknown as { table_name: string }[];
      publicTables = tbls.map(t => t.table_name);

      // NB: filter by schema — Supabase also has auth.users (always uuid).
      const rows = (await db.execute(
        sql`select data_type from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'id'`
      )) as unknown as { data_type: string }[];
      usersIdType = rows[0]?.data_type ?? "table-missing";
    } catch (e) {
      dbConnect = "error";
      error = e instanceof Error ? e.message : String(e);
    }

    res.json({
      ok: clerkSecret && databaseUrl && dbConnect === "ok",
      clerkSecret,
      databaseUrl,
      dbConnect,
      currentDatabase,
      usersIdType, // expect "character varying"; "uuid" => migration not applied
      publicTables,
      error,
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

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
}
