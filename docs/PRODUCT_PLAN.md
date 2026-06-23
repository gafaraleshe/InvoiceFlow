# InvoiceFlow — Product & Engineering Plan

> The single source of truth for turning InvoiceFlow from a marketing site into a
> shippable, multi-tenant invoicing SaaS. Read alongside `SETUP_GUIDE.md`
> (accounts & keys) and `API.md` (public REST API).

**Status:** Phase 0 complete (marketing site + Vercel config). Building toward a lean
multi-tenant MVP.

**Locked decisions**

| Area | Decision |
|---|---|
| Language | TypeScript, end to end |
| Auth | **Supabase Auth** (email/password, magic link, Google) |
| Database | **Supabase Postgres** via Drizzle ORM |
| SaaS billing | **Polar.sh** (merchant of record for plan subscriptions) |
| Invoice payments | **Stripe** (your customers' clients pay invoices) |
| Email | **Resend** (transactional + reminders) |
| File storage | **Supabase Storage** (invoice PDFs) |
| Hosting | **Vercel** (serverless API + static site) + **Vercel Cron** |
| Scope (v1) | Lean multi-tenant MVP: signup, orgs, invoicing, billing, public API |

---

## 1. Vision & positioning

InvoiceFlow is a fast, focused invoicing platform for small teams and freelancers.
The job-to-be-done: **create polished invoices, send them, and get paid faster** —
with automated reminders and a clean dashboard, without accounting-suite bloat.

- **Buyers:** freelancers, agencies, small finance/ops teams.
- **Wedge:** speed + craft (Linear-grade UX) and "get paid faster" automation.
- **Monetization:** SaaS subscription (Starter free, Pro, Business) via Polar.sh.
  Invoice payment collection is a feature, billed to your customers' clients via Stripe.

---

## 2. Architecture overview

```
                    ┌──────────────────────────────────────────────┐
                    │                   Browser                      │
                    │   React 19 + Vite + Tailwind (the existing UI) │
                    └───────────────┬───────────────┬───────────────┘
                                    │ tRPC (typed)  │ Supabase JS (auth)
                                    ▼               ▼
        ┌───────────────────────────────────────────────────────────────┐
        │                    Vercel (serverless)                          │
        │  ┌───────────────┐   ┌────────────────┐   ┌──────────────────┐ │
        │  │ tRPC API      │   │ Public REST    │   │ Webhooks         │ │
        │  │ /api/trpc     │   │ /api/v1/*      │   │ /api/webhooks/*  │ │
        │  │ (first-party) │   │ (API keys)     │   │ polar/stripe     │ │
        │  └──────┬────────┘   └───────┬────────┘   └────────┬─────────┘ │
        │         └──────── shared service layer ───────────┘            │
        │                          │                                      │
        │  ┌──────────────────────────────────────────────────────────┐ │
        │  │ Vercel Cron → /api/jobs/{reminders,overdue-sweep}         │ │
        │  └──────────────────────────────────────────────────────────┘ │
        └───────────────┬───────────────┬───────────────┬───────────────┘
                        ▼               ▼               ▼
                 ┌────────────┐  ┌────────────┐  ┌──────────────────────┐
                 │  Supabase  │  │   Resend   │  │ Polar.sh   Stripe    │
                 │ Postgres   │  │  email     │  │ (subs)    (invoice   │
                 │ Auth       │  │            │  │            payments) │
                 │ Storage    │  │            │  │                      │
                 └────────────┘  └────────────┘  └──────────────────────┘
```

**Key principles**

- **One service layer, three entry points.** tRPC (first-party UI), REST `/api/v1`
  (third parties), and webhooks all call the *same* domain services. No business
  logic in routers/controllers.
- **Multi-tenant by `organizationId`.** Every row is owned by an org; every query is
  scoped by the caller's active org. Postgres **Row-Level Security (RLS)** is the
  defense-in-depth backstop.
- **Stateless & serverless-friendly.** No in-memory state; DB connections via a
  pooled/serverless driver. Idempotent webhook handlers.
- **Typed contracts everywhere.** Drizzle types → tRPC → client; Zod validates all
  inputs at the boundary.

---

## 3. Multi-tenancy & data model (target: Postgres)

Today data is scoped to a single `userId`. We introduce **organizations** and
**memberships** and re-scope everything to `organizationId`.

```
organizations         users (= Supabase auth.uid)      memberships
─────────────         ──────────────────────────       ───────────────────────
id                    id (uuid, FK auth.users)          organization_id
name                  email                              user_id
slug                  full_name                          role: owner|admin|member|viewer
plan                  avatar_url                         created_at
billing_email         created_at                         (PK: org_id + user_id)
logo_url
default_currency
default_vat_rate
created_at

clients                       invoices                          line_items
──────────────                ────────────────────────          ───────────────
id                            id                                id
organization_id (FK)          organization_id (FK)              invoice_id (FK)
name, email, company          client_id (FK)                    description
address fields                number  (per-org sequence)        quantity
phone                         status: draft|sent|paid|overdue|void  unit_price
payment_terms (days)          currency                          amount
notes                         issue_date, due_date              tax_rate
created_at                    subtotal, tax_amount, total       sort_order
                              notes, pdf_path
                              stripe_payment_intent_id
                              sent_at, paid_at, created_at

api_keys                  subscriptions                  payments                 webhook_events
──────────────           ────────────────────           ─────────────            ─────────────
id                       organization_id (FK)           id                       id
organization_id (FK)     polar_subscription_id          invoice_id (FK)          provider
name                     plan                           provider (stripe)        event_id (unique)
prefix (ifk_live_…)      status                         amount, currency         processed_at
hashed_key               current_period_end             status                   → idempotency
scopes[]                 cancel_at_period_end           provider_ref
last_used_at             created_at                     created_at
revoked_at
created_at

audit_logs (phase 7): organization_id, actor_user_id, action, target_type, target_id, metadata, created_at
```

**Notes**

- `users.id` mirrors Supabase `auth.users.id` (uuid). A DB trigger inserts a public
  `users` row on signup.
- Invoice numbers are a **per-org monotonic sequence** (e.g. `INV-2026-001`) generated
  in a transaction to avoid gaps/duplicates.
- All money stored as `numeric(14,2)` + a `currency` (ISO-4217) column. Never floats.
- RLS policy shape: a row is visible/writable only if
  `organization_id IN (select organization_id from memberships where user_id = auth.uid())`.

---

## 4. Authentication & authorization

- **Supabase Auth** issues JWTs to the browser. The frontend uses `@supabase/supabase-js`
  for sign-in/up; the access token is sent to our API.
- The API verifies the Supabase JWT (JWKS), loads the user + memberships, and resolves
  the **active organization** (from a header/claim), producing the tRPC/REST `ctx`.
- **Roles** (per org): `owner` > `admin` > `member` > `viewer`. Procedure guards:
  - `viewer`: read-only.
  - `member`: create/edit invoices & clients.
  - `admin`: + manage members, API keys, settings.
  - `owner`: + billing & delete org.
- **Public REST API** authenticates with hashed API keys (see `API.md`), scoped to one org.

This replaces the current Manus OAuth. The existing dev-login path is kept for local
development only.

---

## 5. Billing & payments

### 5.1 SaaS subscriptions — Polar.sh
- Three Polar **products/prices**: Starter (free), Pro, Business (monthly + annual).
- Checkout from the pricing page / in-app upgrade → Polar Checkout.
- **Webhook** `/api/webhooks/polar` updates `subscriptions` + `organizations.plan`.
- **Plan gating** enforced server-side in the service layer (e.g. Starter = 5 clients /
  20 invoices per month; Pro/Business = unlimited, automation, API, team seats).
- Customer self-serve management via Polar's customer portal.

### 5.2 Invoice payments — Stripe
- When a user sends an invoice, optionally attach a **Stripe payment link / Checkout**.
- Your customer's client pays by card/bank; **webhook** `/api/webhooks/stripe`
  marks the invoice `paid`, records a `payments` row, and emails a receipt via Resend.
- Stripe keys are **per-platform** for v1 (you collect on behalf). Stripe Connect
  (each customer connects their own Stripe) is a fast-follow for true payout separation.

> Both webhook handlers are **idempotent** (dedupe on `webhook_events.event_id`) and
> verify signatures.

---

## 6. Email — Resend
- Transactional: invoice sent, payment receipt, reminder (pre-due / overdue), team invite.
- Templates authored with **React Email** for consistent, branded HTML.
- Sending domain verified in Resend (SPF/DKIM DNS). From: `billing@yourdomain.com`.

---

## 7. Background jobs — Vercel Cron
- `POST /api/jobs/overdue-sweep` (daily): flip `sent` invoices past `due_date` to `overdue`.
- `POST /api/jobs/reminders` (daily): send scheduled reminders per org settings.
- Secured by a shared `CRON_SECRET`; jobs are batched and resumable.

---

## 8. Public REST API
A versioned, key-authenticated REST API (`/api/v1`) over the same service layer, so
customers and integrations can manage clients, invoices, and payments programmatically.
Full contract, auth, pagination, idempotency, rate limits, and an **OpenAPI 3.1** spec
are documented in `API.md`.

---

## 9. Security
- Supabase **RLS** on every tenant table (defense in depth behind app-layer scoping).
- API keys stored **hashed** (SHA-256), shown once; `prefix` for lookup; scopes + revocation.
- All inputs validated with **Zod** at the boundary; output types from Drizzle.
- Webhook **signature verification** + idempotency.
- **Rate limiting** on REST + auth-sensitive routes (Upstash Redis or Supabase-based).
- Secrets only in Vercel/Supabase env — never in the repo. `.env.example` documents them.
- Least-privilege: service-role key only on the server; browser uses anon key + RLS.
- Run `/security-review` before each release.

---

## 10. Scalability
- **Stateless serverless** scales horizontally on Vercel automatically.
- **Postgres connection pooling** via Supabase's pooler (PgBouncer) / serverless driver
  to survive serverless concurrency.
- Hot-path **indexes** (org_id, status, due_date, invoice number) defined in schema.
- Heavy/slow work (PDF render, bulk email) pushed to jobs/queues, not request path.
- Read-heavy dashboards can add materialized views / cached aggregates later.
- Clear path to **Stripe Connect**, queues (e.g. QStash), and read replicas as volume grows.

---

## 11. Observability & quality
- **Sentry** for API + client error tracking; structured request logs.
- **Vercel Analytics** for web vitals; Supabase logs for DB.
- **Tests:** keep the existing Vitest suite; expand with multi-tenant + billing + API
  contract tests. CI runs lint, typecheck, test, build on every PR.

---

## 12. Roadmap (linear, ship-as-you-go)

| Phase | Outcome | Depends on you providing |
|---|---|---|
| **0 ✅** | Marketing site + Vercel deploy config | — |
| **1** | Supabase project; Postgres + Drizzle migration; Supabase Auth; orgs + memberships + RLS | Supabase keys |
| **2** | Core invoicing & clients ported to multi-tenant; org switching; settings | — |
| **3** | Polar subscriptions + plan gating; Stripe invoice payments + webhooks | Polar + Stripe keys |
| **4** | Public REST API + API keys + OpenAPI docs | — |
| **5** | Vercel Cron reminders/overdue; Resend templates; PDF → Supabase Storage | Resend key + domain |
| **6** | Hardening: security review, tests, rate limiting, Sentry → **LAUNCH** | Sentry (optional) |
| **7** | Post-launch: recurring invoices, multi-currency, audit log, analytics, Stripe Connect | — |

Each phase is independently shippable behind feature flags where needed.

---

## 13. What I need from you to proceed
See **`SETUP_GUIDE.md`** for click-by-click instructions. In short, create accounts and
hand me the keys (or set them in Vercel) for: **Supabase, Resend, Polar.sh, Stripe**, plus
a **custom domain**. The moment Supabase exists, I start Phase 1.
