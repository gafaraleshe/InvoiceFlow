# Supabase Postgres schema

Source of truth: **`server/db/schema.ts`**.

## Files

| File | What it is | Generated? |
|---|---|---|
| `0000_*.sql`, `0001_*.sql` | Numbered migrations — the change *history* | `pnpm db:pg:generate` |
| `policies.sql` | Row-Level Security policies | hand-written |
| `apply.sql` | **Fresh-install** script: full current schema + RLS | `pnpm gen:bootstrap` |
| `meta/` | Drizzle snapshots | `pnpm db:pg:generate` |

`server/db/bootstrap-sql.ts` mirrors `apply.sql` and is what `/api/bootstrap-db`
applies. Both are generated — **do not edit either by hand.**

## Two paths, two purposes

**Existing database → migrate:**

```bash
pnpm db:pg:migrate                              # applies 0000_, 0001_, … in order
psql "$DIRECT_URL" -f drizzle/pg/policies.sql   # RLS
```

**Empty database → fresh install:** paste `apply.sql` into the Supabase SQL
Editor, or hit `/api/bootstrap-db`. This applies the schema's current end state
in one shot, plus RLS.

> `apply.sql` is deliberately **not** a concatenation of the numbered
> migrations. Replaying the history is not the same as the end state, and here
> it is actively broken: `0001` alters `memberships.user_id` to `varchar` while
> the foreign key to `users.id` still points at a `uuid`, so the sequence fails
> on a clean database. `apply.sql` is produced by `drizzle-kit export`, which
> emits the current schema directly and therefore cannot drift.

## Changing the schema

1. Edit `server/db/schema.ts`.
2. `pnpm db:pg:generate` — writes a new numbered migration **and** regenerates
   `apply.sql` + `bootstrap-sql.ts`.
3. If the new table is org-scoped, add its RLS policy to `policies.sql`, then
   re-run `pnpm gen:bootstrap`.
4. `pnpm test` — `server/bootstrap-sql.test.ts` fails if any schema table is
   missing from the generated artifacts.
5. `pnpm db:pg:migrate` to apply to your database.

## RLS notes

The API connects as the `postgres` role, which **bypasses RLS**, and enforces
tenant scoping in the application layer. The policies are defense-in-depth for
the Supabase anon/PostgREST path.

User ids are Clerk strings (`varchar`), while `auth.uid()` returns a `uuid` —
every comparison must cast (`auth.uid()::text`). Without the cast Postgres
rejects the policy outright with *operator does not exist: character varying =
uuid*.

## History

`apply.sql` and `bootstrap-sql.ts` were previously hand-maintained and had
drifted from the schema: the `bookings` table and its `booking_status` enum
shipped in `0001` but reached neither file, so any database created through the
documented dashboard path was missing the entire CRM — every `/api/v1/bookings`
call would fail at runtime. They are now generated, and a test guards them.
