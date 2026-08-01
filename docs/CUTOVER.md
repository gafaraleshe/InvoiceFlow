# CUTOVER — getting HermiteFlow live at flow.hermitelabs.com

Everything in this document is a step **only you can do** — it needs a dashboard
login or a secret. The application itself is built and verified: CRM, public
API, MCP server and schema all work end to end (see *What is already done* at
the bottom).

Work top to bottom. **Step 4 (`DATABASE_URL`) is the one currently breaking
sign-in** — `flow.hermitelabs.com/api/health` returns 503 with `database_url`
unset, and every check below it fails as a consequence rather than on its own.

Verify progress at any point with <https://flow.hermitelabs.com/api/health>:
it reports each requirement separately and names the exact fix for whatever is
failing. All five green means sign-in works.

---

## 0. Point `flow.hermitelabs.com` at the right Vercel project — ✅ DONE

> This step is complete. `flow.hermitelabs.com` serves HermiteFlow, and
> `hermitelabs.com` / `www.hermitelabs.com` serve the parent site. Kept here for
> reference; skip to step 1.

**Original symptom:** `flow.hermitelabs.com` served the *Hermite Labs parent
site*, not HermiteFlow. The DNS was correct; the domain was attached to the
wrong project.

There are two Vercel projects (see [`DOMAINS.md`](./DOMAINS.md) for whether to
keep it that way):

| Project | Builds from | Should serve |
|---|---|---|
| `hermite` | `gafaraleshe/hermite` (branch `main`) | `hermitelabs.com` |
| `invoice-flow` | `gafaraleshe/InvoiceFlow` (branch `main`) | `flow.hermitelabs.com` |

1. <https://vercel.com/gafitenisons-projects/hermite> → **Settings → Domains**
   → find `flow.hermitelabs.com` → **Remove**.
2. <https://vercel.com/gafitenisons-projects/invoice-flow> → **Settings →
   Domains** → **Add** → `flow.hermitelabs.com` → **Add**.
3. Vercel provisions TLS automatically. No DNS change needed — the CNAME already
   points at `cname.vercel-dns.com`.

*Optional, while you are here:* **Settings → General → Project Name** →
rename `invoice-flow` to `hermite-flow`. This does not affect the Git
connection or the domains.

---

## 1. Apply the database schema to Supabase

Project ref **`uuccxbuaixwzyanatyow`**.

1. Open <https://supabase.com/dashboard/project/uuccxbuaixwzyanatyow/sql/new>.
2. Copy the entire contents of [`drizzle/pg/apply.sql`](../drizzle/pg/apply.sql)
   and paste it in.
3. **Run**.

You should see 11 tables created: `api_keys`, `bookings`, `clients`,
`invoices`, `line_items`, `memberships`, `organizations`, `payments`,
`subscriptions`, `users`, `webhook_events`.

> `apply.sql` is generated from `server/db/schema.ts` and is safe to run on an
> empty database. Do **not** hand-edit it — regenerate with `pnpm gen:bootstrap`.
> If the database already has tables, use `pnpm db:pg:migrate` instead.

---

## 2. Collect the Supabase connection strings

<https://supabase.com/dashboard/project/uuccxbuaixwzyanatyow/settings/database>

Under **Connection string → URI**:

- **Transaction mode** (pooled, port 6543) → this is `DATABASE_URL`
- **Direct connection** (port 5432) → this is `DIRECT_URL`

Replace `[YOUR-PASSWORD]` in both with your database password. If you do not
have it: **Settings → Database → Database password → Reset database password**.

---

## 3. Set up Clerk

<https://dashboard.clerk.com>

### 3a. Keys and domain

1. **API Keys** → copy:
   - `Publishable key` (`pk_live_…` / `pk_test_…`) → `VITE_CLERK_PUBLISHABLE_KEY`
   - `Secret key` (`sk_live_…` / `sk_test_…`) → `CLERK_SECRET_KEY`
2. **Configure → Domains** (or **Paths**) → add `flow.hermitelabs.com` as an
   allowed origin / satellite domain.
3. **User & Authentication → Email, Phone, Username** → enable **Email address**
   so you can sign in with email.

> The secret key is server-only. The publishable key is safe in the browser —
> that is why it carries the `VITE_` prefix.

### 3b. Google sign-in

The login page uses Clerk's `<SignIn>` / `<SignUp>` components
(`client/src/pages/Login.tsx`), so **enabling Google in the dashboard makes the
Google button appear on its own — there is no code change to make.**

**On a development instance** Clerk provides shared OAuth credentials, so this
is all it takes:

1. **SSO connections** → **Add connection** → **For all users**
2. Choose **Google** → save.

**On a production instance you must supply your own Google credentials.** Shared
credentials do not work in production.

1. In Clerk: **SSO connections** → **Add connection** → **For all users** →
   **Google**.
2. Toggle on **Enable for sign-up and sign-in** *and* **Use custom credentials**.
3. **Copy the Authorized Redirect URI** Clerk shows you — you need it in a
   moment, and it is easy to miss.
4. Open <https://console.cloud.google.com/> → create or select a project →
   **APIs & Services → Credentials → Create Credentials → OAuth client ID** →
   application type **Web application**.
5. **Authorized JavaScript origins** — add:
   - `https://flow.hermitelabs.com`
   - `http://localhost:3000` (for local dev)
6. **Authorized redirect URIs** — paste the URI you copied from Clerk in step 3.
7. Save, then copy the **Client ID** and **Client Secret**.
8. Back in Clerk, paste both into the Google connection and save.
9. Test at <https://flow.hermitelabs.com/login> — a **Continue with Google**
   button should now be present.

> ⚠️ **Set the Google app's publishing status to "In production."** New OAuth
> apps default to **Testing**, which caps you at 100 users and shows an
> unverified-app warning. Google Cloud Console → **APIs & Services → OAuth
> consent screen → Publish app**. Verification checks your app name, logo and
> requested scopes, so allow time for it before launch.

Two further notes from Clerk's documentation:

- Google **blocks authentication inside WebViews**. If you ever embed the sign-in
  page in a native shell, Google sign-in will fail there.
- Email subaddresses containing `+`, `=` or `#` are blocked by default. That is
  a sensible security default — leave it on unless you have a reason not to.

---

## 4. Set the environment variables in Vercel

<https://vercel.com/gafitenisons-projects/invoice-flow> → **Settings →
Environment Variables**. Add each for **Production, Preview and Development**:

| Name | Value |
|---|---|
| `CLERK_SECRET_KEY` | `sk_…` from step 3 |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_…` from step 3 |
| `DATABASE_URL` | pooled URI from step 2 |
| `DIRECT_URL` | direct URI from step 2 |
| `APP_URL` | `https://flow.hermitelabs.com` |
| `VITE_APP_URL` | `https://flow.hermitelabs.com` |
| `CRON_SECRET` | any long random string (gates the detailed health output) |
| `RESEND_API_KEY` | from <https://resend.com/api-keys> — needed to email invoices |
| `RESEND_FROM_EMAIL` | e.g. `HermiteFlow <billing@hermitelabs.com>` |

Then **Deployments → ⋯ on the latest → Redeploy**. Environment variables are
baked in at build time, so a redeploy is required — changing them alone does
nothing.

> ⚠️ The variable the code reads is **`RESEND_FROM_EMAIL`**, not `EMAIL_FROM`.
> An older version of `.env.example` documented the wrong name.

---

## 5. Verify before signing in

```bash
curl -s https://flow.hermitelabs.com/api/health | jq
```

Every check should be `"ok": true`. If any fails, the response tells you exactly
what to fix:

```json
{
  "ok": false,
  "checks": [
    { "name": "clerk_secret_key", "ok": false,
      "fix": "Set CLERK_SECRET_KEY (Clerk dashboard → API keys) …" }
  ]
}
```

Checks: `clerk_secret_key`, `database_url`, `database_reachable`,
`schema_applied`, `users_id_is_varchar`.

Add `?secret=<CRON_SECRET>` for the database name and full table list.

Once green, go to <https://flow.hermitelabs.com/login> and sign up. Your first
sign-in creates your user row; the app then creates your organization.

---

## 6. Mint an API key (for the MCP server and booking sites)

Either from the app — **Dashboard → Integrations → Create API key** — or from a
terminal with the database URL to hand:

```bash
DATABASE_URL='<pooled URI>' OWNER_ORG_NAME='Gaffy Studios' pnpm seed:owner
```

This prints the key **once**. It looks like `ifk_live_…`. Store it now; only a
SHA-256 hash is kept.

---

## 7. Connect the MCP server

The MCP server exposes 20 tools over your API — clients, invoices, bookings,
booking→invoice conversion, PDF and email.

```bash
cd mcp && pnpm install && pnpm build
```

Then in your MCP client config (Claude Desktop:
`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "hermiteflow": {
      "command": "node",
      "args": ["/absolute/path/to/mcp/dist/index.js"],
      "env": {
        "HERMITE_FLOW_API_URL": "https://flow.hermitelabs.com",
        "HERMITE_FLOW_API_KEY": "ifk_live_…"
      }
    }
  }
}
```

Verify:

```bash
curl -s -H "Authorization: Bearer ifk_live_…" \
  https://flow.hermitelabs.com/api/v1/me
```

---

## 8. Connect a booking site (optional)

```bash
node scripts/connect.mjs --url https://flow.hermitelabs.com --key ifk_live_…
```

Writes a ready-to-paste `.env.hermiteflow`. See
[`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md).

---

## What is already done

Verified against a real Postgres with the app running — not assumed:

- **CRM** — clients, bookings, pipeline stats, and booking→invoice conversion
  (auto-creates the client from the booking, applies VAT, honours the client's
  payment terms).
- **Public REST API** at `/api/v1` — 13 routes, API-key auth with hashed and
  scoped keys, `last_used_at`, revocation, a stable JSON error envelope, and
  pagination.
- **MCP server** — 20 tools, driven live against the API.
- **Clerk** — session verification, org resolution, graceful degradation when
  unconfigured.
- **Schema** — 11 tables, RLS policies, generated from `schema.ts` and guarded
  by tests against drift.

## Known gaps

Not blockers for going live, but worth knowing:

- **Rate limiting** is not implemented. The `rate_limited` error code exists and
  the docs describe `X-RateLimit-*` headers, but nothing enforces limits yet.
- **OpenAPI is 3.0.3 and hand-maintained** in `server/rest/openapi.ts`, rather
  than 3.1 generated from the route definitions. There is no Swagger/Scalar UI.
- **Invoice PDF generation needs `BUILT_IN_FORGE_API_URL` /
  `BUILT_IN_FORGE_API_KEY`** — a hosted storage proxy inherited from the
  original scaffolding. Without them, `POST /api/v1/invoices/:id/pdf` returns
  *"Storage proxy credentials missing"*. Everything else works. Replacing it
  with direct S3 or Supabase Storage is the real fix.
- **`/api/bootstrap-db`** is an unauthenticated `GET` that runs DDL when the
  public schema is empty. Once step 1 is done it refuses to run, but it is worth
  deleting.
- **No CI.** Run `pnpm check && pnpm test && pnpm build` before pushing.
