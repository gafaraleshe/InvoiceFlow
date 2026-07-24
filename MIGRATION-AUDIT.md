# MIGRATION-AUDIT.md

**Phase 0 — Audit. No code has been changed.**

Audit date: 2026-07-24 · Repo: `gafaraleshe/InvoiceFlow` @ `fe011da` · Branch: `claude/new-session-wrbp07`

---

## 0. Read this first — the migration plan does not match the repo

The prompt describes a greenfield rebrand of a repo called InvoiceFlow. **That rebrand already largely happened.** Four of the six phases are partly or mostly complete, and three of the prompt's structural assumptions are contradicted by decisions already committed to this repo.

| # | Finding | Impact |
|---|---|---|
| **F1** | **The product is already called Hermite Flow.** `package.json` name is `hermitelabs`. Only **56** brand-string occurrences of `invoice*flow` survive, mostly in docs, Docker, and scripts. | Phase 1 is ~85% done. |
| **F2** | **The migration to `gafaraleshe/hermite` already happened.** `hermite`'s `main` branch is at `0ea177e` — a commit in this repo's own history. `docs/DOMAINS.md` documents the transfer as complete. | Phase 6's repo move is done. |
| **F3** | **The repo has already committed to "one repo, one Vercel project."** `docs/DOMAINS.md` states this explicitly; `client/src/lib/host.ts` implements host-based routing for `hermitelabs.com` vs `flow.hermitelabs.com`. | **Directly conflicts** with the prompt's 4-repo target. Needs your decision — see Q1. |
| **F4** | **There are two Supabase projects, not one.** `fakimjxhuusiwzzljqzg` (platform, in `.mcp.json`) and `cyrzdfzxgpbcctzftvkk` (hermite site waitlist, in `hermite/supabase/README.md`). | The prompt says "keep the existing Supabase project" (singular). Needs your decision — see Q2. |
| **F5** | **Schema is managed by Drizzle, not Supabase migrations.** `drizzle/pg/` holds the migrations; there is no `supabase/` directory in this repo. | Phase 2 as written would create a **second competing source of schema truth**. Needs your decision — see Q3. |
| **F6** | **The public API already exists** at `/api/v1` — 13 routes, hashed API-key auth, scopes, `last_used_at`, revocation, a stable error envelope, and a generated OpenAPI spec. | Phase 4 is ~60% done. Real gaps are narrow: rate limiting, OpenAPI 3.1, docs UI. |
| **F7** | **The brand system is genuinely greenfield.** Not one of `#3ADCC8` / `#FF7A45` / `#9B8AFB` / `#08090A` / `#FAFAFA` appears anywhere in the codebase. Current accent is `#0007cd` (electric blue), light-mode-first, `--radius: 0.65rem`. | Phase 5 is the **real** work, and it **contradicts** the current design. See Q4. |
| **F8** | **The brand rule "HermiteFlow, one word" is violated 106 times.** The codebase uses the spaced form "Hermite Flow" across 38 files; the correct joined form appears only 18 times. | This is the single largest rename bucket — and the prompt's rename table doesn't mention it. |

**Nothing here is blocking the audit. Four items need a decision before Phase 1 — collected in §7.**

---

## 1. Stack inventory

| Aspect | Value |
|---|---|
| Framework | React 19 + Vite 7 (SPA), Express 4 API, tRPC 11 |
| Language | TypeScript 5.9.3, ESM (`"type": "module"`) |
| Package manager | **pnpm 10.4.1** (lockfile present; `patchedDependencies` on `wouter@3.7.1`) |
| Database | Supabase Postgres via **Drizzle ORM 0.44.5** + `postgres` (postgres-js) |
| Auth | **Clerk** (`@clerk/backend`, `@clerk/clerk-react`) — *not* Supabase Auth |
| Styling | Tailwind CSS 4.1 + shadcn/ui (new-york, 53 UI components) |
| Email | Resend | 
| PDF | pdfkit |
| Storage | AWS S3 SDK (`@aws-sdk/client-s3`) |
| Testing | Vitest 2.1.9 |
| Deploy target | **Vercel** (`vercel.json`, `build:vercel`, `api/index.js`), Docker also present |
| CI | **None.** `README.md:117` claims `.github/workflows/ci.yml`; no `.github/` directory exists in either repo. |
| Lint | **None.** Only `prettier --write` (`format`). No ESLint config. |

### Baseline gate status (measured, not assumed)

| Check | Command | Result |
|---|---|---|
| Typecheck | `pnpm run check` | ✅ **clean** (exit 0) |
| Tests | `pnpm test` | ✅ **51/51 pass** (3 files) |
| Build | `pnpm run build` | ✅ **passes** (4.04s; client 916 kB, server 115 kB) |
| Lint | — | ⚠️ **no lint script exists** |

Phase 1's gate says "build, typecheck, lint, and pass existing tests." Three of four are green today; **lint does not exist** and would have to be introduced before it can be a gate.

Two pre-existing build warnings (not migration-related): `VITE_ANALYTICS_ENDPOINT` / `VITE_ANALYTICS_WEBSITE_ID` are referenced in `client/index.html` but undefined and undocumented in `.env.example`.

---

## 2. Brand-string inventory

The prompt's central warning is correct and load-bearing here. The numbers:

- **56** occurrences of `invoice[-_ ]?flow` → the rename candidates
- **1,124** lines containing `invoice` as a business-domain term across **63 files** → must not be touched
- **106** occurrences of the spaced `"Hermite Flow"` → rename to `HermiteFlow` per the brand system

A naive find-and-replace on `invoice` would corrupt roughly **95%** of its occurrences.

### 2a. RENAME — product/brand references

**Group A — `invoice*flow` → `hermiteflow` / HermiteFlow (56 occurrences)**

| File | Line(s) | Current | → New |
|---|---|---|---|
| `README.md` | 32 | `docs/InvoiceFlow-Product-Guide.pdf` (×2 in link) | `HermiteFlow-Product-Guide.pdf` |
| `README.md` | 86 | `invoice-flow/` (tree root) | `hermite-flow/` |
| `README.md` | 110 | `invoiceflow.test.ts` | `hermiteflow.test.ts` |
| `README.md` | 262 | `INVOICEFLOW_API_URL`, `INVOICEFLOW_API_KEY` | `HERMITE_FLOW_API_*` |
| `client/src/lib/auth.ts` | 15 | `"invoiceflow.activeOrg"` | `"hermiteflow.activeOrg"` ⚠️ **localStorage key — see note** |
| `client/src/marketing/mockups.tsx` | 33, 353 | `app.invoiceflow.com` | `flow.hermitelabs.com` |
| `client/src/pages/Integrations.tsx` | 220, 223 | `npx @invoiceflow/connect` | `npx @hermite/connect` |
| `client/src/pages/Integrations.tsx` | 227 | `.env.invoiceflow` | `.env.hermiteflow` |
| `client/src/pages/marketing/Contact.tsx` | 22, 28 | `hello@invoiceflow.com`, `sales@invoiceflow.com` | `@hermitelabs.com` |
| `docker-compose.yml` | 7, 10–12, 18, 28, 34 | `invoiceflow` container/user/password/db | `hermiteflow` ⚠️ **see note** |
| `docker-compose.yml` | 23 | `# ─── InvoiceFlow API ───` | `HermiteFlow API` |
| `docker-compose.yml` | 37 | `InvoiceFlow <invoices@resend.dev>` | `HermiteFlow <…>` |
| `docs/API.md` | 7 | `https://api.invoiceflow.app/v1` | `https://flow.hermitelabs.com/api/v1` |
| `docs/API.md` | 158–159, 166, 170–171 | `INVOICEFLOW_API_*`, `"invoiceflow"` MCP key | `HERMITE_FLOW_API_*`, `"hermiteflow"` |
| `docs/DOMAINS.md` | 10, 18 | `gafaraleshe/InvoiceFlow` | historical reference — **keep**, see §2b |
| `docs/DOMAINS.md` | 19 | `gafitenisons-projects/invoice-flow` | Vercel project name — **external**, see §6 |
| `docs/INTEGRATION_GUIDE.md` | 32 | `.env.invoiceflow` | `.env.hermiteflow` |
| `docs/INTEGRATION_GUIDE.md` | 149 | `INVOICEFLOW_API_URL/KEY` fallback note | update wording |
| `docs/SETUP_GUIDE.md` | 15 | Supabase project named `invoiceflow` | ⚠️ **external** — renaming is a dashboard action |
| `docs/SETUP_GUIDE.md` | 87 | `invoiceflow.app` | `hermitelabs.com` |
| `drizzle/pg/apply.sql` | 1, 165 | `-- InvoiceFlow — full schema…` | comment only — safe |
| `drizzle/pg/policies.sql` | 1 | `-- …for InvoiceFlow` | comment only — safe |
| `mcp/src/index.ts` | 7–8 | `INVOICEFLOW_API_*` in doc comment | `HERMITE_FLOW_API_*` |
| `mcp/src/index.ts` | 17 | `name: "invoiceflow-mcp"` | `"hermiteflow-mcp"` ⚠️ **MCP server identity** |
| `mcp/src/index.ts` | 42 | comment says `SIGMA_*` | stale third brand — fix |
| `mcp/src/index.ts` | 43–44 | `?? process.env.INVOICEFLOW_API_*` | **already has the fallback** Phase 1 asks for |
| `scripts/connect.mjs` | 7, 17, 49 | `.env.invoiceflow` | `.env.hermiteflow` |
| `scripts/generate-guide-pdf.mjs` | 1, 9 | `docs/InvoiceFlow-Product-Guide.pdf` | `HermiteFlow-…` |
| `scripts/generate-guide-pdf.mjs` | 121, 136–137, 163, 311 | `"InvoiceFlow"` in PDF copy | `HermiteFlow` |
| `server/_core/app.ts` | 110, 112 | route `/api/debug/invoice-flow`, `"debug-user-invoice-flow"` | ⚠️ **delete instead** — see §4 |
| `todo.md` | 1 | `# InvoiceFlow - Project TODO` | `HermiteFlow` |

**Filenames to rename (4):**

| Current | → New |
|---|---|
| `server/invoiceflow.test.ts` | `server/hermiteflow.test.ts` |
| `docs/InvoiceFlow-Product-Guide.html` | `docs/HermiteFlow-Product-Guide.html` |
| `docs/InvoiceFlow-Product-Guide.pdf` | `docs/HermiteFlow-Product-Guide.pdf` (regenerate via `scripts/generate-guide-pdf.mjs`) |
| — | (`client/src/pages/*Invoice*.tsx` are **domain** files — do **not** rename) |

**Group B — `"Hermite Flow"` → `"HermiteFlow"` (106 occurrences, 38 files)**

The brand system (§06 Rules, "Don't") explicitly forbids writing "Hermite Flow". Top files by count:

| File | Count | | File | Count |
|---|---|---|---|---|
| `client/src/pages/marketing/Docs.tsx` | 11 | | `client/src/pages/marketing/About.tsx` | 3 |
| `client/src/pages/marketing/Landing.tsx` | 8 | | `client/src/pages/Login.tsx` | 3 |
| `docs/InvoiceFlow-Product-Guide.html` | 6 | | `client/src/pages/Integrations.tsx` | 3 |
| `README.md` | 6 | | `client/index.html` | 3 |
| `scripts/connect.mjs` | 5 | | `docs/PRODUCT_PLAN.md` | 3 |
| `server/emailService.ts` | 4 | | `docs/INTEGRATION_GUIDE.md` | 3 |
| `mcp/README.md` | 4 | | `server/pdfGenerator.ts` | 2 |
| `docs/DOMAINS.md` | 4 | | `client/src/lib/host.ts` | 2 |
| `client/src/pages/marketing/HermiteLabs.tsx` | 4 | | `client/src/index.css` | 2 |
| `client/src/pages/marketing/Features.tsx` | 4 | | `client/src/components/DashboardLayout.tsx` | 2 |
| `client/src/marketing/mockups.tsx` | 4 | | *(+18 files with 1 each)* | 18 |

⚠️ **Two of these need care, not blanket replacement:**
- `server/emailService.ts` (4) and `server/pdfGenerator.ts` (2) — customer-facing email and PDF output. Changing these changes what your clients see.
- `mcp/package.json` (1) — package identity.

**Group C — stale third-brand references**

| File | Line | Issue |
|---|---|---|
| `.env.example` | 2 | Header reads `# Sigma — environment variables` — **"Sigma" is a dead brand** |
| `mcp/src/index.ts` | 42 | Comment references `SIGMA_*` env vars that don't exist |

### 2b. DO NOT RENAME — business-domain terms

**1,124 lines across 63 files.** These are legitimate invoicing-domain vocabulary and must survive untouched:

- **DB schema** (`server/db/schema.ts`): tables `invoices`, `line_items`; columns `invoice_id`, `invoice_number`, `invoice_date`. Renaming = destructive migration, explicitly forbidden by rule 3.
- **API surface** (`server/rest/index.ts`): `/invoices`, `/invoices/:id`, `/invoices/:id/pdf`, `/invoices/:id/send`. Renaming = **breaking public API change**.
- **tRPC routers** (`server/routers.ts`): `invoice.*` procedures.
- **React pages**: `CreateInvoice.tsx`, `EditInvoice.tsx`, `InvoiceDetail.tsx`, `Invoices.tsx` and their routes `/invoices/*`.
- **Types/validation**: `shared/validation.ts`, `shared/types.ts` — `Invoice`, `InvoiceLineItem`, `invoiceSchema`.
- **Drizzle migrations** (`drizzle/pg/*.sql`, `drizzle/*.sql`, `meta/*.json`): historical DDL. **Never edit applied migrations.**
- **UI copy**: "Create invoice", "Invoice #", "Send invoice" etc. — product vocabulary, not brand.
- **`SUPABASE_STORAGE_BUCKET=invoices`** — bucket name; renaming orphans stored files.
- **`RESEND_FROM_EMAIL: InvoiceFlow <invoices@resend.dev>`** — the `invoices@` **local-part is domain**; only the display name `InvoiceFlow` renames.

**Genuinely ambiguous — flagging rather than guessing** (rule 5):

| Item | Why ambiguous |
|---|---|
| `ifk_` API-key prefix (`ifk_live_…`) | Reads as **I**nvoice**F**low**K**ey — brand-derived. But it's persisted in `api_keys.prefix` and in **every key customers already hold**. Renaming to `hfk_` **breaks every live key** (`resolveApiKeyContext` hard-checks `raw.startsWith("ifk_")`). **Recommendation: keep `ifk_`.** |
| `client/src/lib/auth.ts:15` `"invoiceflow.activeOrg"` | localStorage key. Renaming silently logs every user out of their active org. **Recommendation: rename with a migration shim reading the old key once.** |
| `docker-compose.yml` DB user/password/dbname | Renaming breaks existing local dev volumes for anyone with one. Cosmetic otherwise. **Recommendation: rename, note it in the changelog.** |
| `docs/DOMAINS.md:10,18` `gafaraleshe/InvoiceFlow` | **Historical provenance**, not branding. **Recommendation: keep.** |

---

## 3. Hardcoded external references

### 3a. Env vars

Referenced in code (27): `BUILT_IN_FORGE_API_KEY`, `BUILT_IN_FORGE_API_URL`, `CLERK_SECRET_KEY`, `CRON_SECRET`, `DATABASE_URL`, `DIRECT_URL`, `HERMITE_FLOW_API_KEY`, `HERMITE_FLOW_API_URL`, `INVOICEFLOW_API_KEY`, `INVOICEFLOW_API_URL`, `JWT_SECRET`, `NODE_ENV`, `OAUTH_SERVER_URL`, `OWNER_*` (5), `PORT`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `VITE_APP_ID`, `VITE_FRONTEND_FORGE_API_*`.

**Only two env vars carry the old brand** — `INVOICEFLOW_API_URL` / `INVOICEFLOW_API_KEY` — and `mcp/src/index.ts:43-44` **already implements the exact fallback pattern Phase 1 prescribes**:
```ts
process.env.HERMITE_FLOW_API_URL ?? process.env.INVOICEFLOW_API_URL
```
Phase 1's env-var work is therefore nearly a no-op; it needs the `// TODO(hermite): remove after env cutover` markers added and the stale `SIGMA_*` comment fixed.

**⚠️ `.env.example` drift — 7 documented vars are not used by any code:**

| Var | Status |
|---|---|
| `EMAIL_FROM` | **Documented but wrong** — code reads `RESEND_FROM_EMAIL` (`server/emailService.ts`). **Live bug**, not just drift. |
| `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_SERVER`, `POLAR_PRODUCTS_JSON` | Aspirational — no Polar integration in code |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY` | Aspirational — no Stripe integration in code |
| `SENTRY_DSN`, `VITE_SENTRY_DSN` | Aspirational — no Sentry integration |
| `SUPABASE_STORAGE_BUCKET` | Referenced in **zero** files |

Conversely, `VITE_ANALYTICS_ENDPOINT` / `VITE_ANALYTICS_WEBSITE_ID` are used in `client/index.html` but **undocumented**.

### 3b. Domains, URLs, endpoints

| Reference | Location | Note |
|---|---|---|
| `flow.hermitelabs.com` | `host.ts:23`, `docs/*`, `mcp/src/index.ts` | ✅ already correct |
| `hermitelabs.com` | `host.ts:25`, `docs/DOMAINS.md` | ✅ already correct |
| `app.invoiceflow.com` | `mockups.tsx:33,353` | ❌ rename |
| `api.invoiceflow.app/v1` | `docs/API.md:7` | ❌ rename |
| `invoiceflow.app` | `docs/SETUP_GUIDE.md:87` | ❌ rename |
| `hello@`/`sales@invoiceflow.com` | `Contact.tsx:22,28` | ❌ rename — **live customer contact addresses** |
| `https://flow.hermitelabs.com/` | `client/index.html` og:url | ✅ correct |
| A `76.76.21.21`, CNAME `cname.vercel-dns.com` | `docs/DOMAINS.md` | Vercel DNS — external |
| `mcp.supabase.com/mcp?project_ref=fakimjxhuusiwzzljqzg` | `.mcp.json` | **Platform Supabase ref** |
| `supabase.com/dashboard/project/cyrzdfzxgpbcctzftvkk` | `hermite/supabase/README.md` | **Second Supabase ref** |

### 3c. Package names

`package.json` is `"hermitelabs"`; `mcp/package.json` and `site/package.json` (`hermite-site`) are separate. **No `@invoiceflow/*` scope is actually published** — the only references are illustrative CLI copy in `Integrations.tsx:220,223`. The `@hermite/*` scope is unclaimed and free.

### 3d. Secrets — ✅ clean

Scanned all tracked files in **both** repos for `sk_live`, `sk_test`, `pk_live`, JWTs (`eyJ…`), `service_role` values, AWS keys, GitHub tokens, Resend keys, Slack tokens, PEM blocks. Also checked git history for committed `.env` files.

**No committed credentials found.** The only matches are placeholder documentation in `.env.example:20` and `docs/SETUP_GUIDE.md:20,101`. The single `.env`-named file ever added to history is `.env.example` itself. **Nothing requires rotation on migration grounds.**

---

## 4. Server routes — API extraction candidates

The public REST API already exists at `/api/v1` (`server/rest/`, 508 lines), mounted at `server/_core/app.ts:193`.

### Already public, versioned, API-key authed — 13 routes

| Route | Methods |
|---|---|
| `/me` | GET |
| `/clients`, `/clients/:id` | GET, POST, GET, PATCH, DELETE |
| `/invoices`, `/invoices/:id` | GET, POST, GET, PATCH, DELETE |
| `/invoices/:id/pdf`, `/invoices/:id/send` | GET, POST |
| `/bookings`, `/bookings/:id`, `/bookings/:id/convert`, `/bookings/stats` | GET, POST, GET, PATCH, DELETE, POST, GET |
| `/dashboard/stats` | GET |
| `/openapi.json` | GET |

### Phase 4 requirements — actual status

| Requirement | Status |
|---|---|
| Versioned `/v1/` routes | ✅ mounted at `/api/v1` |
| API-key auth, **hashed** in Supabase | ✅ `api_keys.hashed_key`, unique index, `resolveApiKeyContext` |
| Scoped per key | ✅ `api_keys.scopes` jsonb |
| Revocable | ✅ `api_keys.revoked_at`, filtered by `isNull()` |
| `last_used_at` timestamp | ✅ `api_keys.last_used_at`, non-blocking write |
| Migration creating `api_keys` | ✅ **already exists** in `drizzle/pg/` |
| Consistent JSON error envelope | ✅ `{ error: { code, message, details? } }` |
| Stable machine-readable codes | ✅ 8 codes incl. `rate_limited` (defined, unused) |
| Zod validation | ✅ via tRPC input schemas |
| **Rate limiting + `X-RateLimit-*`** | ❌ **not implemented** — documented as future work only |
| **OpenAPI 3.1** | ⚠️ spec is **3.0.3** (`server/rest/openapi.ts:7`) |
| **Generated from route definitions** | ❌ **hand-maintained** — `openapi.ts` is the source of truth, `openapi.yaml` is generated *from it*, not from routes |
| Served at `/v1/openapi.json` | ✅ |
| **Docs UI at `/docs`** | ⚠️ `/docs` is a **marketing page** (`App.tsx:68`), not a spec-driven API UI |
| Structured request logging | ❌ not implemented |
| `/health` endpoint | ✅ `/api/health` |
| Integration tests | ⚠️ 19 tests in `rest.test.ts` — error mapping covered; **no rate-limit or per-endpoint happy-path coverage** |

**Real Phase 4 scope is 4 items**, not a ground-up build: rate limiting, OpenAPI 3.0.3→3.1 + true route-derived generation, a docs UI, and structured logging.

### App-internal only — do NOT extract

`server/routers.ts` (tRPC, 526 lines) backs the dashboard directly; `server/_core/*` is vendor scaffolding (see §5); `/api/health`, `/api/bootstrap-db`, `/api/debug/invoice-flow` are operational.

### ⚠️ Security findings — pre-existing, unrelated to the rebrand

These are live in production today and all three are **unauthenticated**:

1. **`/api/debug/invoice-flow`** (`app.ts:110`) — **an unauthenticated `GET` that writes to the production database.** It inserts a `users` row and creates an org, client, and invoice, then self-cleans. Anyone who knows the URL can trigger production writes; a crawler or link-prefetcher can too. **Recommend deletion**, not renaming. (Its own comment says "Safe to remove once invoice creation is confirmed working.")
2. **`/api/bootstrap-db`** (`app.ts:75`) — **an unauthenticated `GET` that executes raw DDL** via `client.unsafe(BOOTSTRAP_SQL)`. It refuses when the public schema is non-empty, so the live DB is currently protected — but on any empty/fresh database it runs with **no authentication at all**, and it's a state-changing `GET`. **Recommend deletion or `POST` + mandatory `CRON_SECRET`.**
3. **`/api/health`** (`app.ts:24`) — unauthenticated, and returns `currentDatabase` plus **the full list of public table names**. Information disclosure. **Recommend reducing to `{ ok }`** for unauthenticated callers.

Flagging under rule 8 — I have not changed them.

---

## 5. `hermite-shared` extraction candidates

### Strong candidates

| Target package | Source | Notes |
|---|---|---|
| `@hermite/types` | `shared/types.ts`, `shared/validation.ts` (Zod), `shared/const.ts`, `shared/_core/errors.ts` | Already isolated and dependency-light — cleanest extraction in the repo |
| `@hermite/ui` | `client/src/components/ui/` (**53 shadcn/ui components**) + `client/src/marketing/primitives.tsx`, `motion.tsx`, `BorderGlow.tsx` | Standard shadcn surface; `components.json` aliases already point at `@/components/ui` |
| `@hermite/config` | `tsconfig.json`, `.prettierrc`, `.prettierignore`, Tailwind config in `client/src/index.css` | ⚠️ No ESLint config exists to share — would need creating |
| `@hermite/brand` | **Nothing to extract — build from `hermite-brand-system.html`** | See §7 Q4 |

### Weak / do not extract

- `server/_core/*`, `client/src/_core/*` — **vendor scaffolding** from a "Manus"/"Forge" codegen platform (20 files reference `manus` / `frontend_forge` / `BUILT_IN_FORGE`, incl. `ManusDialog.tsx`, `client/public/__manus__/debug-collector.js`, `server/_core/types/manusTypes.ts`). This is **dead weight carrying a third party's brand into the new org**. Recommend auditing for removal as its own task — out of the prompt's scope, so flagging rather than acting.
- `server/db/*`, `server/rest/*` — app/API specific.
- `@hermite/supabase` — **note the mismatch**: this app authenticates with **Clerk**, and uses Supabase only as a Postgres host via Drizzle. There is no Supabase client and no Supabase auth helper to extract. The hermite site (`site/lib/supabase.ts`) *does* use `@supabase/supabase-js`. A shared `@hermite/supabase` package would serve the site, not this app.

### Design-system conflict

`client/src/index.css` holds **57 hardcoded hex values** (111 across the client). The current accent `--primary: #0007cd` is labelled "Hermite Flow electric-blue accent" — **the brand system mandates `#3ADCC8`**. Phase 5c's "fail the build on hardcoded hex outside `@hermite/brand`" would fail on **111 existing violations** on day one.

---

## 6. Manual steps checklist — things that break unless you do them outside the codebase

Ordered. Nothing here can be done from the repo.

**DNS / domains**
- [ ] `hermitelabs.com` apex `@` → A `76.76.21.21` (or Vercel's ALIAS/ANAME)
- [ ] `www` → CNAME `cname.vercel-dns.com`
- [ ] `flow` → CNAME `cname.vercel-dns.com`
- [ ] `cut` → CNAME `cname.vercel-dns.com` *(new — brand system)*
- [ ] `mind` → CNAME `cname.vercel-dns.com` *(new — brand system)*

**Vercel** — https://vercel.com/gafitenisons-projects
- [ ] Project `invoice-flow` → Settings → Git → connect `gafaraleshe/hermite`, production branch `main`
- [ ] Settings → General → rename project `invoice-flow` → `hermite`
- [ ] Settings → Domains → add all five hosts above
- [ ] Settings → Environment Variables → set `HERMITE_FLOW_API_URL` / `HERMITE_FLOW_API_KEY` **before** removing the `INVOICEFLOW_*` fallbacks
- [ ] Fix `EMAIL_FROM` → the code reads **`RESEND_FROM_EMAIL`** (see §3a)

**GitHub** — https://github.com/gafaraleshe
- [ ] Repo `hermite` → Settings → Default branch → `main`
- [ ] Decide on archiving `gafaraleshe/InvoiceFlow` (rule 2: not before you say so)
- [ ] If publishing `@hermite/*` to GitHub Packages: create the org/scope and a `packages:write` PAT

**Clerk** — https://dashboard.clerk.com
- [ ] Add `hermitelabs.com`, `www.hermitelabs.com`, `flow.hermitelabs.com` to allowed origins
- [ ] Update redirect / after-sign-in URLs off any old host

**Supabase** — https://supabase.com/dashboard
- [ ] Decide the two-project question (§7 Q2)
- [ ] Project `fakimjxhuusiwzzljqzg` → Settings → General → rename `invoiceflow` → `hermiteflow` *(cosmetic)*
- [ ] Auth → URL Configuration → update Site URL / redirect allow-list if Supabase Auth is ever enabled
- [ ] Retrieve the DB password for `supabase link` — **I cannot do Phase 2 without it** (§7 Q5)

**Resend** — https://resend.com/domains
- [ ] Verify a sender domain for `@hermitelabs.com`
- [ ] Update `RESEND_FROM_EMAIL` display name `InvoiceFlow` → `HermiteFlow`

**Email addresses (customer-facing)**
- [ ] Create/forward `hello@hermitelabs.com`, `sales@hermitelabs.com` before changing `Contact.tsx`

**Not applicable** — no Stripe, Polar, or Sentry integration exists in code despite `.env.example` (§3a). No OAuth provider consoles, webhook endpoints, or cron/queue names are configured. `OAUTH_SERVER_URL` belongs to the vendor scaffolding (§5).

---

## 7. Decisions I need from you before Phase 1

I've stopped here as instructed. Five questions — the first four are the re-scoping rule 7 calls for.

**Q1 — Repo architecture. The prompt and the repo disagree.**
The prompt wants 4 repos (`hermite-flow`, `hermite-flow-api`, `hermite-shared`, `hermite-web`). `docs/DOMAINS.md` and `client/src/lib/host.ts` implement a deliberate **one repo, one Vercel project** decision, already shipped. Splitting means unpicking the host-routing design, running 4 CI setups and a private npm registry for a solo-maintained product, and the marketing site currently lives *inside* the app (`client/src/pages/marketing/`).
→ **My recommendation: keep one repo for now.** Extract `@hermite/brand` first (Phase 5 needs it and HermiteCut will consume it), and split further only when a second product actually needs the code. I'll do the full 4-repo split if you want it — I'd just rather you choose it than inherit it.

**Q2 — Which Supabase project?** `fakimjxhuusiwzzljqzg` (platform) or `cyrzdfzxgpbcctzftvkk` (hermite site waitlist)? Keep both separate, or consolidate? The prompt assumes one.

**Q3 — Drizzle vs Supabase migrations.** Schema is currently Drizzle-managed (`drizzle/pg/`). `supabase db pull` would create a parallel, competing baseline in `supabase/migrations/`. Options: (a) keep Drizzle as sole truth and skip the Supabase migration workflow, (b) migrate fully to Supabase migrations and retire Drizzle Kit, (c) run both. **I recommend (a)** — it's already working, and (c) reliably causes drift.

**Q4 — The brand system contradicts the shipped design.** Brand spec: dark-first, `#3ADCC8` aqua accent, 2px radius, mono uppercase labels, no shadows. Current app: light-mode-first, `#0007cd` electric blue, `0.65rem` radius, Composio-styled. Applying the spec literally is a **full visual redesign of the live product**, not a re-theme — and Phase 5's hex-color CI check would fail on 111 existing violations.
→ Do you want the brand system applied to (a) the marketing/parent site only, (b) marketing + app, or (c) everything including the hex-lint gate? **I recommend (a) first**, then (b).

**Q5 — Credentials and tooling I don't have.**
- `supabase` CLI: **not installed**, and `supabase link` needs an access token + DB password. **Phase 2 is blocked** without these.
- `gh` CLI: **not installed** — but I have GitHub MCP tools and can create repos/PRs that way, so this one isn't blocking.
- The prompt's Context block still has 3 unfilled `<FILL IN>`s. I resolved two from the repo (source repo = `gafaraleshe/InvoiceFlow`; Supabase ref = ambiguous, see Q2). **The new GitHub org is still unknown** — everything currently sits under the personal account `gafaraleshe`, and `hermite-labs` does not exist. Do you want an org created, or should this stay on `gafaraleshe`?

Also note `npx getdesign@latest add composio` (Phase 5a) — I have not run it. It's an unvetted third-party installer that writes into the repo; I'd rather run it once you've confirmed, and report what it drops in before customizing, as the prompt asks.

---

## Summary

| Phase | Prompt's assumption | Actual state |
|---|---|---|
| 1 — Rename | Full rebrand | **~85% done.** 56 `invoice*flow` + 106 `"Hermite Flow"` occurrences left. Env fallback pattern already implemented. |
| 2 — Supabase migrations | One project, capture schema | **Blocked** — two projects, Drizzle already owns schema, no CLI/credentials |
| 3 — Shared packages | Extract 4 packages | Feasible; `@hermite/supabase` doesn't fit (Clerk auth, no Supabase client in app) |
| 4 — Public API | Build from scratch | **~60% done.** Gaps: rate limiting, OpenAPI 3.1 + true generation, docs UI, logging |
| 5 — Brand system | Re-theme | **Greenfield, and contradicts the shipped design.** The real work. |
| 6 — Cutover | Move repos | Repo move **already done**; CI never existed in either repo |

Baseline is green (typecheck ✓, 51/51 tests ✓, build ✓) — so Phase 1 has a clean gate to measure against. No secrets found in either repo. Three unauthenticated production endpoints flagged in §4 for your attention, independent of this migration.

**Awaiting your approval and answers to §7 before touching code.**
