# InvoiceFlow — Setup & Connections Guide

Everything **you** need to create and connect so I can build and ship the product.
Work top to bottom — that's the order I need them. Copy each value into `.env`
locally (use `.env.example` as the template) **and** into your Vercel project's
Environment Variables. Never commit real keys.

> 🔒 Anything ending in `SECRET`, `SERVICE_ROLE`, or `KEY` is sensitive. Share with me
> via your environment/Vercel, not in plain chat where possible.

---

## 1. Supabase (database + auth + storage) — **do this first**

1. Go to <https://supabase.com> → **New project**. Name it `invoiceflow`. Pick a strong
   DB password and the region closest to your users. Wait for it to provision.
2. **Project Settings → API**, copy:
   - `Project URL` → `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(server only — never in the browser)*
3. **Project Settings → API → JWT Settings**, copy `JWT Secret` → `SUPABASE_JWT_SECRET`.
4. **Project Settings → Database → Connection string → "URI"** (enable **Use connection
   pooling**, mode *Transaction*). Copy → `DATABASE_URL`. Also copy the **direct**
   (non-pooled) URI → `DIRECT_URL` (used for migrations).
5. **Authentication → Providers**: enable **Email**, and **Google** (optional now). Set
   **Site URL** to your domain (and `http://localhost:3000` for local).
6. **Storage → Create bucket** named `invoices` (Private). I'll wire PDF uploads to it.

I handle the schema, migrations, and RLS policies in code.

---

## 2. Resend (email)

1. <https://resend.com> → sign up → **API Keys → Create** → copy → `RESEND_API_KEY`.
2. **Domains → Add domain** (e.g. `yourdomain.com`). Add the shown **DNS records**
   (SPF, DKIM, DMARC) at your domain registrar. Wait for "Verified".
3. Decide your from-address, e.g. `billing@yourdomain.com` → `EMAIL_FROM`.

*Until the domain verifies, Resend test mode only sends to your own address — fine for dev.*

---

## 3. Polar.sh (SaaS subscription billing)

1. <https://polar.sh> → create an **Organization**.
2. **Products** → create three products matching the pricing page:
   - **Starter** — free.
   - **Pro** — monthly + annual prices.
   - **Business** — monthly + annual prices.
   Copy each **price/product ID** — paste them to me (or into `POLAR_PRODUCTS_JSON`).
3. **Settings → Developers / API**: create an **Organization Access Token** →
   `POLAR_ACCESS_TOKEN`.
4. **Webhooks → Add endpoint**: URL `https://YOURDOMAIN/api/webhooks/polar`, copy the
   **signing secret** → `POLAR_WEBHOOK_SECRET`. (Add this after the first deploy exists.)
5. Start in **Sandbox** mode; flip to production at launch → set `POLAR_SERVER=production`.

---

## 4. Stripe (invoice payments)

1. <https://stripe.com> → create account (Test mode is fine to build).
2. **Developers → API keys**: copy `Secret key` → `STRIPE_SECRET_KEY` and
   `Publishable key` → `VITE_STRIPE_PUBLISHABLE_KEY`.
3. **Developers → Webhooks → Add endpoint**: URL
   `https://YOURDOMAIN/api/webhooks/stripe`, events
   `checkout.session.completed`, `payment_intent.succeeded`. Copy the **signing secret**
   → `STRIPE_WEBHOOK_SECRET`. (Add after first deploy.)
4. For local webhook testing I'll use the Stripe CLI — no action needed from you.

---

## 5. Vercel (hosting)

1. <https://vercel.com> → **Add New → Project** → import `gafaraleshe/InvoiceFlow`.
   It auto-detects `vercel.json` (build `vite build`, output `dist/public`).
2. **Settings → Environment Variables**: paste every variable from `.env.example`
   (Production + Preview). This is where the app reads its secrets in production.
3. **Settings → Domains**: add your custom domain; follow the DNS instructions.
4. **Settings → Cron Jobs**: I'll declare these in `vercel.json`; you just confirm they're
   enabled (Pro plan required for >daily granularity; daily is fine on Hobby).
5. Add `CRON_SECRET` (any long random string) so only Vercel can trigger jobs.

---

## 6. Domain & DNS
- Buy/own a domain (e.g. `invoiceflow.app`). Point it at Vercel (step 5.3).
- Add Resend's email DNS records (step 2.2).
- Set `APP_URL=https://yourdomain` and `VITE_APP_URL=https://yourdomain`.

---

## 7. Sentry (optional, recommended)
- <https://sentry.io> → new project (Node + React) → copy DSN → `SENTRY_DSN` /
  `VITE_SENTRY_DSN`.

---

## Quick checklist

- [ ] Supabase project created; URL, anon, service_role, JWT secret, DB URLs copied
- [ ] Supabase `invoices` storage bucket created; Email auth enabled
- [ ] Resend API key + verified domain + `EMAIL_FROM`
- [ ] Polar org + 3 products (price IDs) + access token (+ webhook secret after deploy)
- [ ] Stripe keys (+ webhook secret after deploy)
- [ ] Vercel project imported; env vars pasted; domain added; `CRON_SECRET` set
- [ ] Domain DNS pointed at Vercel; email DNS added
- [ ] (Optional) Sentry DSN

When Supabase (section 1) is done, tell me — **I start building Phase 1 immediately**,
and you can finish the rest in parallel.
