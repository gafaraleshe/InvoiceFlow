<p align="center">
  <h1 align="center">Hermite Labs</h1>
  <p align="center">
    Software for creative businesses, by Gaffy Studios. This repo is the Hermite Labs platform —
    it deploys <a href="https://flow.hermitelabs.com">flow.hermitelabs.com</a> (<b>HermiteFlow</b>,
    the CRM + invoicing product) and also carries the Hermite Labs parent site, which host-based
    routing can serve from the same deployment. Today <a href="https://hermitelabs.com">hermitelabs.com</a>
    is served by a separate project — see <a href="docs/DOMAINS.md">docs/DOMAINS.md</a>.
    Built with TypeScript, React, Express, and tRPC.
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Node.js-22-green?logo=node.js" alt="Node.js">
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React">
    <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
  </p>
</p>

---

## 📐 Building the product (roadmap & docs)

We're evolving HermiteFlow from an app into a **shippable, multi-tenant invoicing SaaS**
(Supabase Auth + Postgres, Polar.sh subscriptions, Stripe invoice payments, Resend email,
a public REST API, all on Vercel). Start here:

| Document                                                                   | What it covers                                                                        |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [`docs/PRODUCT_PLAN.md`](docs/PRODUCT_PLAN.md)                             | Architecture, multi-tenant data model, security, scalability, and the phased roadmap  |
| [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md)                               | Click-by-click setup for Supabase, Resend, Polar.sh, Stripe, and Vercel (+ env vars)  |
| [`docs/API.md`](docs/API.md)                                               | Public REST API (`/api/v1`) design — auth, resources, pagination, OpenAPI             |
| [`.env.example`](.env.example)                                             | Every environment variable the product needs                                          |
| [`docs/HermiteFlow-Product-Guide.pdf`](docs/HermiteFlow-Product-Guide.pdf) | One-page-per-topic PDF for you **and your clients** — summary, setup, costs, timeline |

> Regenerate the PDF after editing the guide: `node scripts/generate-guide-pdf.mjs`.

---

## Overview

**HermiteFlow** is a full-stack invoice management application designed for freelancers and small businesses operating in the UK. It handles the complete invoicing lifecycle — from creating clients and drafting invoices with itemised line items, through automatic UK VAT (20%) calculation, to generating professional invoice documents and emailing them directly to clients via the Resend API.

The system features a clean, responsive dashboard UI with real-time statistics, a type-safe API layer powered by tRPC, Clerk authentication with organization-scoped role-based access control, and a test suite with 93 passing tests. It ships with Docker Compose for containerised deployment. **There is no CI pipeline yet** — see [CI/CD Pipeline](#cicd-pipeline) below and run `pnpm check && pnpm test && pnpm build` before pushing.

---

## Features

| Category                | Details                                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client Management**   | Full CRUD operations storing name, email, company, address (line 1, line 2, city, postcode, country), phone, payment terms (configurable 1–365 days), and notes |
| **Invoice Management**  | Full CRUD with dynamic line items, auto-generated invoice numbers (`INV-YYYY-NNN`), issue/due dates, and optional notes                                         |
| **VAT Calculation**     | Automatic UK VAT at 20% (configurable 0–100%) with precise subtotal, VAT amount, and total computation                                                          |
| **Status Tracking**     | Four-stage lifecycle: `draft` → `sent` → `paid` / `overdue`, with automatic overdue flagging for past-due invoices                                              |
| **Document Generation** | Professional HTML invoice documents with full company/client details, line item tables, and VAT breakdown, stored in S3                                         |
| **Email Delivery**      | Send invoices to clients via the Resend API with branded HTML email templates containing invoice summary and document link                                      |
| **Authentication**      | Clerk session tokens verified server-side; development-only sign-in for local work (`DEV_AUTH`)                                                                  |
| **Role-Based Access**   | Per-organization roles (owner/admin/member/viewer) with `adminProcedure` middleware enforcing elevated permissions                                               |
| **Dashboard**           | Real-time KPI cards (total revenue, outstanding amount, invoice count, overdue count) and recent invoices table                                                 |
| **Input Validation**    | Zod schemas enforcing type safety on all API inputs across clients, invoices, line items, and query parameters                                                  |
| **Testing**             | 93 Vitest tests covering VAT, auth flows, RBAC, validation, line items, the REST API, schema artifacts, and the dev-auth gate                                    |
| **CI/CD**               | _Not set up yet_ — no `.github/workflows/`; run `pnpm check && pnpm test && pnpm build` locally                                                                  |
| **Containerisation**    | Multi-stage Dockerfile and Docker Compose with PostgreSQL, health checks, and volume persistence                                                                |

---

## Tech Stack

| Layer              | Technology                                                      |
| ------------------ | --------------------------------------------------------------- |
| **Frontend**       | React 19, Tailwind CSS 4, shadcn/ui, Radix UI, Recharts, Wouter |
| **Backend**        | Node.js 22, Express 4, tRPC 11, Superjson                       |
| **Database**       | Supabase Postgres via Drizzle ORM (postgres-js), RLS policies   |
| **Validation**     | Zod 4 with shared schemas between client and server             |
| **Authentication** | Clerk (`@clerk/backend` verifies session tokens)                |
| **Email**          | Resend API (direct HTTP integration)                            |
| **Storage**        | AWS S3 for invoice document storage                             |
| **Testing**        | Vitest with tRPC caller-based unit tests                        |
| **Build**          | Vite 7 (frontend), esbuild (server), TypeScript 5.9             |
| **DevOps**         | Docker, Docker Compose (no CI pipeline yet)                     |

---

## Project Structure

```
hermite-flow/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components (shadcn/ui)
│   │   ├── pages/              # Page components
│   │   │   ├── Home.tsx        # Dashboard with stats & recent invoices
│   │   │   ├── Invoices.tsx    # Invoice list with status filters
│   │   │   ├── InvoiceDetail.tsx
│   │   │   ├── CreateInvoice.tsx
│   │   │   ├── EditInvoice.tsx
│   │   │   ├── Clients.tsx     # Client list with search
│   │   │   ├── ClientDetail.tsx
│   │   │   ├── CreateClient.tsx
│   │   │   └── EditClient.tsx
│   │   ├── App.tsx             # Routes & layout
│   │   └── lib/trpc.ts         # tRPC client binding
│   └── index.html
├── server/
│   ├── _core/                  # Framework plumbing (auth, context, OAuth)
│   ├── routers.ts              # tRPC procedures (clients, invoices, dashboard)
│   ├── db.ts                   # Database query helpers
│   ├── pdfGenerator.ts         # Invoice document generation
│   ├── emailService.ts         # Resend email integration
│   ├── storage.ts              # S3 file storage helpers
│   ├── hermiteflow.test.ts     # Comprehensive test suite (33 tests)
│   └── auth.logout.test.ts     # Auth logout test (1 test)
├── drizzle/
│   ├── schema.ts               # Database tables (users, clients, invoices, line_items)
│   └── relations.ts            # Drizzle ORM relations
├── shared/
│   ├── validation.ts           # Zod schemas shared between client & server
│   ├── const.ts                # Shared constants
│   └── types.ts                # Shared TypeScript types
├── Dockerfile                  # Multi-stage production build
├── docker-compose.yml          # Full-stack containerised setup
├── vitest.config.ts            # Test configuration
└── package.json
```

---

## Database Schema

The application uses a normalised relational schema with four core tables and proper indexing for query performance.

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    users     │       │     invoices      │       │  line_items   │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)          │──┐    │ id (PK)      │
│ openId       │  │    │ userId (FK)      │  │    │ invoiceId(FK)│
│ name         │  │    │ clientId (FK)    │  │    │ description  │
│ email        │  ├───>│ invoiceNumber    │  ├───>│ quantity     │
│ role         │  │    │ status           │  │    │ unitPrice    │
│ loginMethod  │  │    │ issueDate        │  │    │ amount       │
│ createdAt    │  │    │ dueDate          │  │    │ sortOrder    │
│ updatedAt    │  │    │ subtotal         │  │    │ createdAt    │
│ lastSignedIn │  │    │ vatRate          │  │    └──────────────┘
└──────────────┘  │    │ vatAmount        │
                  │    │ total            │
┌──────────────┐  │    │ notes            │
│   clients    │  │    │ pdfUrl           │
├──────────────┤  │    │ pdfKey           │
│ id (PK)      │──┘    │ sentAt           │
│ userId (FK)  │──────>│ paidAt           │
│ name         │       │ createdAt        │
│ email        │       │ updatedAt        │
│ company      │       └──────────────────┘
│ addressLine1 │
│ addressLine2 │
│ city         │
│ postcode     │
│ country      │
│ phone        │
│ paymentTerms │
│ notes        │
│ createdAt    │
│ updatedAt    │
└──────────────┘
```

**Indexes** are defined on `userId`, `clientId`, `status`, `dueDate`, `invoiceNumber`, and `email` columns to optimise common query patterns.

---

## API Reference

All API procedures are exposed via tRPC under `/api/trpc`. The application uses `protectedProcedure` for authenticated endpoints and `adminProcedure` for admin-only operations.

### Authentication

| Procedure     | Type     | Auth   | Description                                      |
| ------------- | -------- | ------ | ------------------------------------------------ |
| `auth.me`     | Query    | Public | Returns the current authenticated user or `null` |
| `auth.logout` | Mutation | Public | Clears the session cookie and logs out           |

### Clients

| Procedure         | Type     | Auth      | Description                                    |
| ----------------- | -------- | --------- | ---------------------------------------------- |
| `clients.list`    | Query    | Protected | List clients with pagination and search        |
| `clients.getById` | Query    | Protected | Get a single client by ID                      |
| `clients.create`  | Mutation | Protected | Create a new client                            |
| `clients.update`  | Mutation | Protected | Update an existing client                      |
| `clients.delete`  | Mutation | Protected | Delete a client (fails if client has invoices) |

### Invoices

| Procedure              | Type     | Auth      | Description                                                            |
| ---------------------- | -------- | --------- | ---------------------------------------------------------------------- |
| `invoice.list`         | Query    | Protected | List invoices with status/client filters and pagination                |
| `invoice.getById`      | Query    | Protected | Get invoice with line items                                            |
| `invoice.create`       | Mutation | Protected | Create invoice with line items (auto-generates number, calculates VAT) |
| `invoice.update`       | Mutation | Protected | Update invoice and line items (blocked for paid invoices)              |
| `invoice.updateStatus` | Mutation | Protected | Change invoice status (draft/sent/paid/overdue)                        |
| `invoice.delete`       | Mutation | Protected | Delete invoice (blocked for paid invoices)                             |
| `invoice.generatePdf`  | Mutation | Protected | Generate and store invoice document                                    |
| `invoice.sendEmail`    | Mutation | Protected | Email invoice to client via Resend (auto-generates document if needed) |

### Dashboard

| Procedure                  | Type     | Auth      | Description                                  |
| -------------------------- | -------- | --------- | -------------------------------------------- |
| `dashboard.stats`          | Query    | Protected | Revenue totals, invoice count, overdue count |
| `dashboard.recentInvoices` | Query    | Protected | Last 5 invoices                              |
| `dashboard.flagOverdue`    | Mutation | Protected | Flag all past-due invoices as overdue        |

---

## Public REST API (`/api/v1`)

A key-authenticated REST API sits **on top of the same tRPC procedures**, so the
business logic (VAT, invoice numbering, validation, tenancy) is never duplicated.
See [`docs/API.md`](docs/API.md) and the machine-readable spec at
`GET /api/v1/openapi.json` (source: [`openapi.yaml`](openapi.yaml)).

**Auth:** send an API key as a bearer token. Keys are minted per organization in
the dashboard (**Settings → Integrations → API keys**) — the plaintext key is
shown once; only a SHA-256 hash + prefix are stored.

```
Authorization: Bearer ifk_live_xxxxxxxxxxxxxxxx
```

| Method & path                     | Description                                        |
| --------------------------------- | -------------------------------------------------- |
| `GET /api/v1/clients`             | List clients (`?page=&limit=&search=`)             |
| `POST /api/v1/clients`            | Create a client                                    |
| `GET /api/v1/clients/{id}`        | Retrieve a client                                  |
| `PATCH /api/v1/clients/{id}`      | Update a client                                    |
| `DELETE /api/v1/clients/{id}`     | Delete a client (409 if it has invoices)           |
| `GET /api/v1/invoices`            | List invoices (`?page=&limit=&status=&client_id=`) |
| `POST /api/v1/invoices`           | Create an invoice (totals/VAT computed)            |
| `GET /api/v1/invoices/{id}`       | Retrieve an invoice                                |
| `PATCH /api/v1/invoices/{id}`     | Update / change status                             |
| `DELETE /api/v1/invoices/{id}`    | Delete a draft invoice                             |
| `POST /api/v1/invoices/{id}/send` | Email the invoice to the client                    |
| `POST /api/v1/invoices/{id}/pdf`  | Generate the invoice PDF                           |
| `GET /api/v1/dashboard/stats`     | Revenue / outstanding / counts                     |
| `GET /api/v1/me`                  | The organization this key belongs to               |
| `GET /api/v1/openapi.json`        | OpenAPI 3.0 document (no key required)             |

- **Pagination:** `?page=` (1-based) + `?limit=` (max 100). Responses:
  `{ data, page, limit, total, total_pages }`.
- **Errors:** `{ "error": { "code", "message", "details"? } }` with a matching
  HTTP status (`unauthorized`, `not_found`, `validation_error`, `conflict`, …).

Key management is exposed to the web app via tRPC (`apiKeys.create/list/revoke`,
owner/admin only) — a separate path from the API keys themselves.

## MCP server

An MCP server in [`mcp/`](mcp/) wraps this REST API so assistants (Claude Code,
Claude Desktop) can manage invoicing conversationally. It ships as its own
package (`node mcp/dist/index.js`) and is configured with two env vars —
`HERMITE_FLOW_API_URL` and `HERMITE_FLOW_API_KEY`. Tools include `list_clients`,
`create_invoice`, `send_invoice_email`, `get_dashboard_stats`, and more. See
[`mcp/README.md`](mcp/README.md) for the exact `.mcp.json` /
`claude_desktop_config.json` snippet.

---

## Getting Started

### Prerequisites

- **Node.js** 22 or later
- **pnpm** 10 or later
- **PostgreSQL** 14 or later — either a local server or a Supabase project

### Quickstart: run it locally and sign in

This path needs **no third-party accounts** — no Clerk, no Supabase, no Resend.
It uses a local Postgres and a development-only sign-in.

```bash
git clone https://github.com/gafaraleshe/hermite.git
cd hermite
pnpm install

# 1. A database to point at
createdb hermiteflow

# 2. Environment
cat > .env <<'EOF'
NODE_ENV=development
APP_URL=http://localhost:3000
VITE_APP_URL=http://localhost:3000
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/hermiteflow
DEV_AUTH=1            # server: accept development sign-in
VITE_DEV_AUTH=1       # browser: show the development sign-in form
CRON_SECRET=local-dev-secret
EOF

# 3. Schema (tables + RLS). Works on a plain Postgres as well as Supabase.
psql "$DATABASE_URL" -f drizzle/pg/apply.sql

# 4. Optional: clients, invoices across every status, and bookings to click through
pnpm seed:dev

# 5. Go
pnpm dev
```

Open <http://localhost:3000/login>, enter any email (the form pre-fills
`dev@example.com`, which is what `pnpm seed:dev` populates) and press **Sign in**.
First sign-in for an email provisions a workspace automatically.

Check the wiring at any time with <http://localhost:3000/api/health> — it reports
each requirement individually and names the exact thing to set for anything
failing.

> **`DEV_AUTH` is not authentication.** It accepts whatever identity the caller
> claims, with no password and no verification. It is ignored in production
> builds, and a production server with `DEV_AUTH` set refuses to start rather
> than serve traffic. Set Clerk keys (below) for anything reachable by anyone
> else.

### Signing in with Clerk (real authentication)

Leave `DEV_AUTH`/`VITE_DEV_AUTH` unset and provide instead:

```bash
CLERK_SECRET_KEY=sk_test_…            # server — verifies session tokens
VITE_CLERK_PUBLISHABLE_KEY=pk_test_…  # browser
```

Clerk takes precedence: with a publishable key present the development form is
never shown. See [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md) for the click-by-click
setup, and `docs/DOMAINS.md` for production origins.

### Docker Compose

For a fully containerised setup with PostgreSQL:

```bash
# Start all services
docker compose up -d

# The API will be available at http://localhost:3000
# PostgreSQL runs on port 5432
```

### Environment Variables

Every variable, with provenance and notes, is documented in
[`.env.example`](.env.example). The ones that gate the app starting usefully:

| Variable                     | Required | Description                                                                                                                 |
| ---------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`               | Yes      | Postgres connection string (pooled). `POSTGRES_URL` is read as a fallback, so Vercel's Supabase integration works unchanged |
| `CLERK_SECRET_KEY`           | Yes¹     | Server-side Clerk key — verifies session tokens                                                                             |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes¹     | Browser-side Clerk key                                                                                                      |
| `DEV_AUTH`                   | No       | `1` accepts development sign-in instead of Clerk. Development only — refuses to run in production                           |
| `VITE_DEV_AUTH`              | No       | `1` renders the development sign-in form. Ignored when a Clerk publishable key is set                                       |
| `APP_URL` / `VITE_APP_URL`   | Yes      | Origin used for links in emails and invoice documents                                                                       |
| `CRON_SECRET`                | No       | Gates `/api/jobs/*` and the detailed `/api/health` output                                                                   |
| `RESEND_API_KEY`             | No       | Resend API key for email delivery (simulated if absent)                                                                     |
| `RESEND_FROM_EMAIL`          | No       | Sender address (defaults to `HermiteFlow <invoices@resend.dev>`)                                                            |

¹ Required unless `DEV_AUTH=1` is used for local development.

---

## Available Scripts

| Command              | Description                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `pnpm dev`           | Start the development server with hot reload                                                       |
| `pnpm build`         | Build the frontend (Vite) and backend (esbuild) for production                                     |
| `pnpm start`         | Run the production build                                                                           |
| `pnpm check`         | Run TypeScript type checking                                                                       |
| `pnpm format`        | Format code with Prettier                                                                          |
| `pnpm test`          | Run the Vitest test suite                                                                          |
| `pnpm db:push`       | Generate and apply database migrations                                                             |
| `pnpm seed:dev`      | Fill the development workspace with clients, invoices, and bookings (`--reset` to wipe and reseed) |
| `pnpm seed:owner`    | Provision the owner workspace and mint an API key                                                  |
| `pnpm gen:bootstrap` | Regenerate `drizzle/pg/apply.sql` and `server/db/bootstrap-sql.ts` from the schema                 |
| `pnpm gen:openapi`   | Regenerate `openapi.yaml` from `server/rest/openapi.ts`                                            |
| `pnpm gen:assets`    | Regenerate the placeholder brand assets (see below)                                                |

---

## Testing

The test suite contains **93 tests** across five test files (`server/hermiteflow.test.ts`,
`server/rest.test.ts`, `server/bootstrap-sql.test.ts`, `server/auth/devAuth.test.ts`,
`server/auth.logout.test.ts`), all executed with Vitest using tRPC's `createCaller` for
direct procedure testing without HTTP overhead.

The suite runs **without a database** by design — the REST tests assert that a valid
request passes auth, validation, and routing and only then fails at the data layer. The
Vitest config blanks `DATABASE_URL` so a developer's real database is never touched.

```bash
# Run all tests
pnpm test
```

### Test Coverage

| Suite                          | Tests | What It Covers                                                                                                                    |
| ------------------------------ | ----- | --------------------------------------------------------------------------------------------------------------------------------- |
| **VAT Calculation**            | 10    | Standard 20% rate, zero-rate, reduced rate, rounding precision, large amounts, multiple items, single penny, high-value invoices  |
| **Authentication Flows**       | 4     | `auth.me` returns user/null, `auth.logout` clears cookies with correct options                                                    |
| **Role-Based Access Control**  | 5     | Protected procedures reject unauthenticated users, role assignment, admin/user distinction                                        |
| **Input Validation (Zod)**     | 8     | Empty names, invalid emails, missing line items, negative payment terms, VAT rate bounds, invalid statuses, valid data acceptance |
| **Line Item Calculations**     | 6     | Single items, fractional quantities, subtotal aggregation, zero-value items, decimal precision                                    |
| **Auth Logout**                | 1     | Cookie clearing with correct security options                                                                                     |
| **Public REST API**            | 19    | API-key auth, error mapping, validation, routing through to the data layer                                                        |
| **Generated schema artifacts** | 28    | `apply.sql` / `BOOTSTRAP_SQL` cover every table, RLS is enabled, `auth.uid()` casts, local-Postgres stub                          |
| **Development sign-in**        | 14    | Off by default, never active in production, refuses to boot a production server, token parsing rejects malformed input            |

---

## CI/CD Pipeline

> **Not set up yet.** This repository has no `.github/workflows/` directory — an
> earlier version of this README described a pipeline that was never committed.
> Until it exists, run the checks locally before pushing:
>
> ```bash
> pnpm check && pnpm test && pnpm build
> ```
>
> The intended pipeline (to be added during cutover) is: type check → tests →
> build → Docker image on pushes to `main`.

---

## Brand assets

The files in `client/public/` are **placeholders**, generated programmatically
from the Hermite Labs monogram by `pnpm gen:assets`
(`scripts/gen-brand-assets.py`). They are correctly sized and wired up, but they
are drawn with DejaVu Sans rather than Inter and are not final artwork.

**Replace these with real exports before launch:**

| File                                     | Size / format               | Used by                            |
| ---------------------------------------- | --------------------------- | ---------------------------------- |
| `favicon.ico`                            | 16/32/48/64 multi-size ICO  | Legacy browser tabs                |
| `favicon.svg`                            | SVG, monochrome             | Modern browser tabs (Hermite Labs) |
| `favicon-flow.svg`                       | SVG, `#3ADCC8` crossbar     | Modern browser tabs (HermiteFlow)  |
| `favicon-16x16.png`, `favicon-32x32.png` | PNG                         | Fallback tab icons                 |
| `apple-touch-icon.png`                   | 180×180 PNG, no alpha       | iOS home screen                    |
| `icon-192.png`, `icon-512.png`           | PNG                         | PWA / `site.webmanifest`           |
| `icon-512-maskable.png`                  | 512×512 PNG, 28% safe inset | Android maskable icon              |
| `og-image.png`                           | 1200×630 PNG                | Hermite Labs OG/Twitter card       |
| `og-image-flow.png`                      | 1200×630 PNG                | HermiteFlow OG/Twitter card        |

Still outstanding (Phase 5 — brand system): light/dark **wordmark exports**, and
per-product OG images for HermiteCut and HermiteMind. The monogram geometry and
the accent tokens live in `scripts/gen-brand-assets.py`; keep them in sync with
the brand system.

---

## VAT Calculation Logic

HermiteFlow computes UK VAT automatically on every invoice. The calculation follows this formula:

```
Line Item Amount = Quantity × Unit Price
Subtotal         = Σ (all line item amounts)
VAT Amount       = Subtotal × (VAT Rate / 100)
Total            = Subtotal + VAT Amount
```

All monetary values are stored as `DECIMAL(12,2)` in the database and rounded to two decimal places to avoid floating-point precision issues. The default VAT rate is **20%** (standard UK rate) but can be configured per invoice from 0% to 100%.

---

## Author

**Gafar Aleshe** — BSc Computer Science student at the University of Essex, web developer, and founder of SHOTBYGAFAR.

- GitHub: [@gafaraleshe](https://github.com/gafaraleshe)
- LinkedIn: [gafaraleshe](https://linkedin.com/in/gafaraleshe)
- Email: gafaraleshe2411@gmail.com
- Portfolio: [gafaraleshe.com](https://gafaraleshe.com)

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
