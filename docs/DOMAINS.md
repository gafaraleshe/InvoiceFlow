# Domains & deployment — Hermite Labs

## How it is actually deployed today

Two Vercel projects, each serving its own hosts:

| Vercel project | Builds from | Serves |
|---|---|---|
| `invoice-flow` | `gafaraleshe/InvoiceFlow`, branch `main` | `flow.hermitelabs.com` — **HermiteFlow**: marketing at `/`, app at `/dashboard`, API at `/api/v1` |
| `hermite` | `gafaraleshe/hermite`, branch `main` (the Next.js app in `site/`) | `hermitelabs.com`, `www.hermitelabs.com` — the **Hermite Labs** parent site |

The photography site (`shotbygafar`) stays its own repo/project — it is a
separate website that *talks to* HermiteFlow over the API.

> **`gafaraleshe/InvoiceFlow` is the live repo for the platform.** Do not
> archive it. An earlier plan (below) moved the platform to
> `gafaraleshe/hermite` and development was expected to continue there; it did
> not. `gafaraleshe/hermite`'s `main` is a clean *ancestor* of
> `InvoiceFlow`'s `main` and is currently 11+ commits behind it.

## Open decision: consolidate to one project?

This repo can serve both brands from a single deployment — `client/src/lib/host.ts`
switches on the hostname, and `HermiteLabs.tsx` is a complete parent site. That
is what the original "one repo, one Vercel project" plan assumed, and it is
still a reasonable target.

It is a migration, not a checkbox, because there are **two competing parent-site
implementations**: the Next.js `site/` in `gafaraleshe/hermite` (currently live
at `hermitelabs.com`) and `HermiteLabs.tsx` here. Consolidating means choosing
one and retiring the other.

If you do consolidate, the steps are:

1. Fast-forward `gafaraleshe/hermite`'s `main` to `InvoiceFlow`'s `main` (shared
   history, so this is a fast-forward, not a merge).
2. Vercel → `invoice-flow` → Settings → Git → connect `gafaraleshe/hermite`
   (production branch `main`); Settings → General → rename to `hermite`.
3. Move `hermitelabs.com` and `www.hermitelabs.com` onto that project.
4. Only then archive the repo and project you retired.

Until that decision is made, the two-project layout above is correct and
working. Nothing is blocked by it.

## Host routing within this codebase

| Host | Serves |
|---|---|
| `hermitelabs.com`, `www.hermitelabs.com` | **Hermite Labs** parent site (`HermiteLabs.tsx`) — only if this project serves those hosts; today it does not |
| `flow.hermitelabs.com` | **HermiteFlow** — marketing at `/`, app at `/dashboard`, API at `/api/v1` |
| any other host (previews, `localhost`) | HermiteFlow (append `/labs` or `?labs=1` to preview the parent site) |

## Vercel setup

Today `flow.hermitelabs.com` belongs to the `invoice-flow` project and the two
apex hosts belong to `hermite`. The list below is the full set for the
**consolidated** layout — add all three to one project only if you have made
that decision:

1. In the Vercel project → **Settings → Domains**:
   - `hermitelabs.com`
   - `www.hermitelabs.com` (redirect to apex, or serve — both render the parent site)
   - `flow.hermitelabs.com`
2. **DNS** (at your registrar for `hermitelabs.com`):
   - Apex `@` → Vercel (A `76.76.21.21`, or the ALIAS/ANAME Vercel shows).
   - `www` → CNAME `cname.vercel-dns.com`.
   - `flow` → CNAME `cname.vercel-dns.com`.
3. Vercel provisions TLS for each automatically.

Subdomains for the rest of the suite (`ai.`, `auth.`, `cloud.`, `finance.`,
`analytics.`) can be pointed at their own projects when those products ship.

## App environment (production)

Set these in Vercel → **Settings → Environment Variables** (see `.env.example`):

- `APP_URL` / `VITE_APP_URL` → `https://flow.hermitelabs.com`
- Clerk: add `flow.hermitelabs.com` (and `hermitelabs.com`) to the allowed
  origins / redirect URLs in the Clerk dashboard.
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (a verified `@hermitelabs.com` sender).
  NB: the code reads `RESEND_FROM_EMAIL` — `EMAIL_FROM` is not read by anything.
- `DATABASE_URL` / `DIRECT_URL` (Supabase). On an **empty** database apply
  `drizzle/pg/apply.sql` once (Supabase SQL Editor); on an existing one run
  `pnpm db:pg:migrate`. Env var changes need a **redeploy** to take effect.

## Connecting a booking site

Booking sites (e.g. SHOTBYGAFAR) point at `https://flow.hermitelabs.com` with an
owner API key — see [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md).
