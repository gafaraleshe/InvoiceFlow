# HermiteFlow — Integration Guide

_Connect any booking site to HermiteFlow in a few minutes. Every booking becomes a
client and an invoice, and (optionally) an email goes out via Resend — no manual
data entry._

HermiteFlow is invoicing for creatives, by **Gaffy Studios**. This guide shows the
fastest path from "someone booked a shoot" to "invoice in their inbox".

---

## 1. Create an API key

Dashboard → **Integrations** → **Create key**.

- Give it a name (e.g. `SHOTBYGAFAR booking site`).
- Tick **owner (special) access** for your own sites — this unlocks every
  capability. (Own the account? The key ships with owner access.)
- The full key `ifk_live_…` is shown **once**. Copy it now; we only store a hash.

> Prefer the CLI? `DATABASE_URL=… pnpm seed:owner` provisions your owner
> workspace and prints an owner key in one step.

## 2. Connect (one command)

Verify the key and write a ready-to-paste env file:

```bash
node scripts/connect.mjs --url https://flow.hermitelabs.com --key ifk_live_xxx
# ✓ authenticated as SHOTBYGAFAR
# ✓ access: owner (full)
# ✓ wrote .env.hermiteflow
```

This writes:

```dotenv
HERMITE_FLOW_API_URL=https://flow.hermitelabs.com
HERMITE_FLOW_API_KEY=ifk_live_xxx
```

## 3. Send a booking

`POST /api/v1/bookings` with your key. Set `auto_send` to raise **and email** the
invoice immediately:

```bash
curl -X POST https://flow.hermitelabs.com/api/v1/bookings \
  -H "Authorization: Bearer $HERMITE_FLOW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "phone": "+44 7000 000000",
    "service_type": "Wedding",
    "package": "Wedding Film & Photo",
    "date": "2026-09-01",
    "location": "London",
    "amount": 1200,
    "source": "shotbygafar",
    "auto_send": true
  }'
```

Response:

```json
{
  "booking": { "id": "…", "status": "quoted", "source": "shotbygafar" },
  "invoice": { "id": "…", "number": "INV-2026-004", "total": "1440.00" },
  "emailed": true
}
```

What happened server-side:

1. A **booking** row landed in your CRM (Dashboard → **Bookings**).
2. A **client** was created (or reused, matched on email).
3. A **draft invoice** was raised for `amount` (+ VAT), then **emailed via
   Resend** with a PDF summary.

### Field reference

| Field | Required | Notes |
|---|---|---|
| `name`, `email` | ✓ | The customer. `email` also matches/creates the client. |
| `phone` | | |
| `service_type` | | e.g. "Wedding", "Portraits" |
| `package` | | Appears as the invoice line-item description |
| `date` | | Event date, `YYYY-MM-DD` |
| `location` | | |
| `amount` | | Quoted amount (ex-VAT). Required for `auto_invoice`/`auto_send`. |
| `source` | | Your site slug — shown in the CRM |
| `auto_invoice` | | Raise a draft invoice now |
| `auto_send` | | Raise **and** email the invoice now |

Leave `amount` off to capture the enquiry only — you can quote and convert it
later from **Bookings → Convert to invoice**.

## 4. Manage bookings (CRM)

Dashboard → **Bookings** is a pipeline: `new → contacted → quoted → confirmed →
completed`. From any row you can convert to an invoice, jump to the invoice, or
move it along the pipeline.

---

## Endpoints

All under `/api/v1`, authenticated with `Authorization: Bearer ifk_…`.

```
GET    /bookings                 List (?status=&search=&page=&limit=)
POST   /bookings                 Create (optionally auto-invoice / auto-send)
GET    /bookings/{id}            Retrieve
PATCH  /bookings/{id}            Update status
POST   /bookings/{id}/convert    Convert to a draft invoice ({ amount?, send? })
DELETE /bookings/{id}            Delete
GET    /bookings/stats           Pipeline stats
GET    /me                       Workspace + access level ({ owner, scopes })
```

The full REST reference is in [`API.md`](./API.md); the machine-readable spec is
served at `/api/v1/openapi.json`.

## Connect from an AI assistant (MCP)

The [`@hermitelabs/flow-mcp`](../mcp) server exposes the whole API — including
bookings — as tools, so you can run your CRM in natural language.

```json
{
  "mcpServers": {
    "hermite-flow": {
      "command": "node",
      "args": ["/absolute/path/to/mcp/dist/index.js"],
      "env": {
        "HERMITE_FLOW_API_URL": "https://flow.hermitelabs.com",
        "HERMITE_FLOW_API_KEY": "ifk_live_xxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

## Notes

- `HERMITE_FLOW_API_URL` / `HERMITE_FLOW_API_KEY` are the current env names; the legacy
  `HERMITE_FLOW_API_URL` / `HERMITE_FLOW_API_KEY` still work as a fallback.
- Delivery is best-effort: if Resend isn't configured, the booking and invoice
  still persist and `emailed` is `false` — nothing is lost.
