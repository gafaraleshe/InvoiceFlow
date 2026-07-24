# Domains & deployment — Hermite Labs

**One repo, one Vercel project, one deployment.** Hermite Labs (the parent
site) and HermiteFlow (the product) are the same codebase; a host check in the
client (`client/src/lib/host.ts`) decides which site renders. There is no
separate "Flow" project.

## Home repo: `gafaraleshe/hermite`

The platform was transferred here from `gafaraleshe/InvoiceFlow` — the full
history lives on the **`main`** branch of `gafaraleshe/hermite`. (The Hermite
Resolve-plugin work is unaffected on its own branch,
`claude/hermite-resolve-plugin-cf4zzx`.)

Remaining one-time steps (dashboard-only):

- **GitHub**: repo `hermite` → Settings → Default branch → `main`, and archive
  `gafaraleshe/InvoiceFlow` (its history is fully contained here).
- **Vercel**: project `gafitenisons-projects/invoice-flow` → Settings → Git →
  connect `gafaraleshe/hermite` (production branch `main`), and Settings →
  General → rename the project to `hermite`. One project serves both
  hermitelabs.com and flow.hermitelabs.com.
- The photography site (`shotbygafar`) stays its own repo/project — it's a
  separate website that *talks to* HermiteFlow over the API.

| Host | Serves |
|---|---|
| `hermitelabs.com`, `www.hermitelabs.com` | **Hermite Labs** parent site (`HermiteLabs.tsx`) |
| `flow.hermitelabs.com` | **HermiteFlow** — marketing at `/`, app at `/dashboard`, API at `/api/v1` |
| any other host (previews, `localhost`) | HermiteFlow (append `/labs` or `?labs=1` to preview the parent site) |

## Vercel setup

1. In the Vercel project → **Settings → Domains**, add all three:
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
- `RESEND_API_KEY` + `EMAIL_FROM` (a verified `@hermitelabs.com` sender).
- `DATABASE_URL` / `DIRECT_URL` (Supabase), then run `pnpm db:pg:migrate`.

## Connecting a booking site

Booking sites (e.g. SHOTBYGAFAR) point at `https://flow.hermitelabs.com` with an
owner API key — see [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md).
