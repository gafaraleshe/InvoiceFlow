# Supabase Postgres migrations (Phase 1)

The multi-tenant data model from `docs/PRODUCT_PLAN.md`. Source of truth:
`server/db/schema.ts`.

## Files
- `0000_*.sql` — generated tables, enums, and indexes (`pnpm db:pg:generate`).
- `policies.sql` — Row-Level Security policies (hand-written; apply after the schema).

## Apply to your Supabase project
Set the connection envs first (locally in `.env`, or they're already present on
Vercel via the Supabase integration):

```bash
# DIRECT_URL / POSTGRES_URL_NON_POOLING is used for migrations
pnpm db:pg:migrate                       # creates tables, enums, indexes
psql "$DIRECT_URL" -f drizzle/pg/policies.sql   # enables RLS + policies
```

> The API connects as the `postgres` role (bypasses RLS) and enforces tenant
> scoping in the application layer; the policies are defense-in-depth for the
> Supabase anon/PostgREST path.

This is additive scaffolding — it does not yet replace the current MySQL data
layer. The switchover (routers, context, auth) lands in Phase 1 part 2 once the
schema is applied and verified against the live database.
