<p align="center">
  <h1 align="center">InvoiceFlow</h1>
  <p align="center">
    A production-grade invoice management system for freelancers and small businesses, built with TypeScript, React, Express, and tRPC.
  </p>
  <p align="center">
    <a href="https://github.com/gafaraleshe/InvoiceFlow/actions"><img src="https://github.com/gafaraleshe/InvoiceFlow/actions/workflows/ci.yml/badge.svg" alt="CI/CD"></a>
    <img src="https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Node.js-22-green?logo=node.js" alt="Node.js">
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React">
    <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
  </p>
</p>

---

## 📐 Building the product (roadmap & docs)

We're evolving InvoiceFlow from an app into a **shippable, multi-tenant invoicing SaaS**
(Supabase Auth + Postgres, Polar.sh subscriptions, Stripe invoice payments, Resend email,
a public REST API, all on Vercel). Start here:

| Document | What it covers |
|---|---|
| [`docs/PRODUCT_PLAN.md`](docs/PRODUCT_PLAN.md) | Architecture, multi-tenant data model, security, scalability, and the phased roadmap |
| [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md) | Click-by-click setup for Supabase, Resend, Polar.sh, Stripe, and Vercel (+ env vars) |
| [`docs/API.md`](docs/API.md) | Public REST API (`/api/v1`) design — auth, resources, pagination, OpenAPI |
| [`.env.example`](.env.example) | Every environment variable the product needs |
| [`docs/InvoiceFlow-Product-Guide.pdf`](docs/InvoiceFlow-Product-Guide.pdf) | One-page-per-topic PDF for you **and your clients** — summary, setup, costs, timeline |

> Regenerate the PDF after editing the guide: `node scripts/generate-guide-pdf.mjs`.

---

## Overview

**InvoiceFlow** is a full-stack invoice management application designed for freelancers and small businesses operating in the UK. It handles the complete invoicing lifecycle — from creating clients and drafting invoices with itemised line items, through automatic UK VAT (20%) calculation, to generating professional invoice documents and emailing them directly to clients via the Resend API.

The system features a clean, responsive dashboard UI with real-time statistics, a type-safe API layer powered by tRPC, OAuth 2.0 authentication with role-based access control, and a comprehensive test suite with 34 passing tests. It ships with Docker Compose for containerised deployment and a GitHub Actions CI/CD pipeline that runs linting, type checking, tests, and Docker builds on every push.

---

## Features

| Category | Details |
|---|---|
| **Client Management** | Full CRUD operations storing name, email, company, address (line 1, line 2, city, postcode, country), phone, payment terms (configurable 1–365 days), and notes |
| **Invoice Management** | Full CRUD with dynamic line items, auto-generated invoice numbers (`INV-YYYY-NNN`), issue/due dates, and optional notes |
| **VAT Calculation** | Automatic UK VAT at 20% (configurable 0–100%) with precise subtotal, VAT amount, and total computation |
| **Status Tracking** | Four-stage lifecycle: `draft` → `sent` → `paid` / `overdue`, with automatic overdue flagging for past-due invoices |
| **Document Generation** | Professional HTML invoice documents with full company/client details, line item tables, and VAT breakdown, stored in S3 |
| **Email Delivery** | Send invoices to clients via the Resend API with branded HTML email templates containing invoice summary and document link |
| **Authentication** | OAuth 2.0 sign-in with session-based cookies, protected and public procedure separation |
| **Role-Based Access** | Admin and user roles with `adminProcedure` middleware enforcing elevated permissions |
| **Dashboard** | Real-time KPI cards (total revenue, outstanding amount, invoice count, overdue count) and recent invoices table |
| **Input Validation** | Zod schemas enforcing type safety on all API inputs across clients, invoices, line items, and query parameters |
| **Testing** | 34 Vitest tests covering VAT calculations, authentication flows, RBAC, input validation, and line item computations |
| **CI/CD** | GitHub Actions pipeline with lint, type check, test, build, and Docker build stages |
| **Containerisation** | Multi-stage Dockerfile and Docker Compose with PostgreSQL, health checks, and volume persistence |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Tailwind CSS 4, shadcn/ui, Radix UI, Recharts, Wouter |
| **Backend** | Node.js 22, Express 4, tRPC 11, Superjson |
| **Database** | MySQL/TiDB via Drizzle ORM with migration support |
| **Validation** | Zod 4 with shared schemas between client and server |
| **Authentication** | OAuth 2.0 with JWT session cookies (via Jose) |
| **Email** | Resend API (direct HTTP integration) |
| **Storage** | AWS S3 for invoice document storage |
| **Testing** | Vitest with tRPC caller-based unit tests |
| **Build** | Vite 7 (frontend), esbuild (server), TypeScript 5.9 |
| **DevOps** | Docker, Docker Compose, GitHub Actions |

---

## Project Structure

```
invoice-flow/
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
│   ├── invoiceflow.test.ts     # Comprehensive test suite (33 tests)
│   └── auth.logout.test.ts     # Auth logout test (1 test)
├── drizzle/
│   ├── schema.ts               # Database tables (users, clients, invoices, line_items)
│   └── relations.ts            # Drizzle ORM relations
├── shared/
│   ├── validation.ts           # Zod schemas shared between client & server
│   ├── const.ts                # Shared constants
│   └── types.ts                # Shared TypeScript types
├── .github/workflows/ci.yml    # GitHub Actions CI/CD pipeline
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

| Procedure | Type | Auth | Description |
|---|---|---|---|
| `auth.me` | Query | Public | Returns the current authenticated user or `null` |
| `auth.logout` | Mutation | Public | Clears the session cookie and logs out |

### Clients

| Procedure | Type | Auth | Description |
|---|---|---|---|
| `clients.list` | Query | Protected | List clients with pagination and search |
| `clients.getById` | Query | Protected | Get a single client by ID |
| `clients.create` | Mutation | Protected | Create a new client |
| `clients.update` | Mutation | Protected | Update an existing client |
| `clients.delete` | Mutation | Protected | Delete a client (fails if client has invoices) |

### Invoices

| Procedure | Type | Auth | Description |
|---|---|---|---|
| `invoice.list` | Query | Protected | List invoices with status/client filters and pagination |
| `invoice.getById` | Query | Protected | Get invoice with line items |
| `invoice.create` | Mutation | Protected | Create invoice with line items (auto-generates number, calculates VAT) |
| `invoice.update` | Mutation | Protected | Update invoice and line items (blocked for paid invoices) |
| `invoice.updateStatus` | Mutation | Protected | Change invoice status (draft/sent/paid/overdue) |
| `invoice.delete` | Mutation | Protected | Delete invoice (blocked for paid invoices) |
| `invoice.generatePdf` | Mutation | Protected | Generate and store invoice document |
| `invoice.sendEmail` | Mutation | Protected | Email invoice to client via Resend (auto-generates document if needed) |

### Dashboard

| Procedure | Type | Auth | Description |
|---|---|---|---|
| `dashboard.stats` | Query | Protected | Revenue totals, invoice count, overdue count |
| `dashboard.recentInvoices` | Query | Protected | Last 5 invoices |
| `dashboard.flagOverdue` | Mutation | Protected | Flag all past-due invoices as overdue |

---

## Getting Started

### Prerequisites

- **Node.js** 22 or later
- **pnpm** 10 or later
- A running database instance (connection string via `DATABASE_URL`)

### Installation

```bash
# Clone the repository
git clone https://github.com/gafaraleshe/InvoiceFlow.git
cd InvoiceFlow

# Install dependencies
pnpm install

# Set up environment variables
# DATABASE_URL, JWT_SECRET, and OAuth variables are required
# RESEND_API_KEY is optional (emails are simulated without it)

# Generate and apply database migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Start the development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Docker Compose

For a fully containerised setup with PostgreSQL:

```bash
# Start all services
docker compose up -d

# The API will be available at http://localhost:3000
# PostgreSQL runs on port 5432
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Database connection string |
| `JWT_SECRET` | Yes | Secret key for signing session cookies |
| `OAUTH_SERVER_URL` | Yes | OAuth provider base URL |
| `VITE_APP_ID` | Yes | OAuth application ID |
| `VITE_OAUTH_PORTAL_URL` | Yes | OAuth login portal URL |
| `RESEND_API_KEY` | No | Resend API key for email delivery (simulated if absent) |
| `RESEND_FROM_EMAIL` | No | Sender email address (defaults to `InvoiceFlow <invoices@resend.dev>`) |

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server with hot reload |
| `pnpm build` | Build the frontend (Vite) and backend (esbuild) for production |
| `pnpm start` | Run the production build |
| `pnpm check` | Run TypeScript type checking |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run the Vitest test suite |
| `pnpm db:push` | Generate and apply database migrations |

---

## Testing

The test suite contains **34 tests** across two test files, all executed with Vitest using tRPC's `createCaller` for direct procedure testing without HTTP overhead.

```bash
# Run all tests
pnpm test
```

### Test Coverage

| Suite | Tests | What It Covers |
|---|---|---|
| **VAT Calculation** | 10 | Standard 20% rate, zero-rate, reduced rate, rounding precision, large amounts, multiple items, single penny, high-value invoices |
| **Authentication Flows** | 4 | `auth.me` returns user/null, `auth.logout` clears cookies with correct options |
| **Role-Based Access Control** | 5 | Protected procedures reject unauthenticated users, role assignment, admin/user distinction |
| **Input Validation (Zod)** | 8 | Empty names, invalid emails, missing line items, negative payment terms, VAT rate bounds, invalid statuses, valid data acceptance |
| **Line Item Calculations** | 6 | Single items, fractional quantities, subtotal aggregation, zero-value items, decimal precision |
| **Auth Logout** | 1 | Cookie clearing with correct security options |

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request to `main` with four sequential stages:

1. **Lint & Type Check** — Runs `pnpm check` for TypeScript validation and `pnpm format --check` for code style
2. **Tests** — Executes the full Vitest suite with `NODE_ENV=test`
3. **Build** — Compiles the frontend and backend for production
4. **Docker Build** — Builds the Docker image on pushes to `main` (uses GitHub Actions cache for layer reuse)

---

## VAT Calculation Logic

InvoiceFlow computes UK VAT automatically on every invoice. The calculation follows this formula:

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
