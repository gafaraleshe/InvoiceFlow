# InvoiceFlow Public API (v1)

A versioned, key-authenticated REST API over the same domain services that power the
app. Designed for customers and integrations to manage clients, invoices, and payments
programmatically.

- **Base URL:** `https://api.invoiceflow.app/v1` (or `https://YOURDOMAIN/api/v1`)
- **Format:** JSON. UTF-8. Money as integer-minor-units optional; default decimal strings.
- **Versioning:** path-based (`/v1`). Breaking changes ship under `/v2`.
- **Spec:** an **OpenAPI 3.1** document is published at `/api/v1/openapi.json` and
  rendered as interactive docs at `/docs/api`.

> Status: **design** (built in Phase 4). This documents the contract we implement.

---

## Authentication
Send your secret API key as a bearer token:

```
Authorization: Bearer ifk_live_xxxxxxxxxxxxxxxxxxxxxxxx
```

- Keys are created in **Settings → API keys** (admin/owner only).
- The full key is shown **once**; we store only a SHA-256 hash plus a lookup `prefix`.
- Each key is scoped to **one organization** and carries **scopes**
  (`clients:read`, `clients:write`, `invoices:read`, `invoices:write`, `payments:read`).
- Test keys use the `ifk_test_` prefix and hit test data / Stripe test mode.

---

## Conventions

| Topic | Rule |
|---|---|
| Pagination | `?limit=` (max 100, default 25) + `?cursor=`; responses include `next_cursor`. |
| Filtering | e.g. `GET /invoices?status=overdue&client_id=...&from=2026-01-01`. |
| Idempotency | Send `Idempotency-Key: <uuid>` on POST; we dedupe for 24h. |
| Errors | HTTP status + `{ "error": { "code", "message", "details" } }`. |
| Rate limits | Per key; headers `X-RateLimit-Limit/Remaining/Reset`. 429 on exceed. |
| Timestamps | ISO-8601 UTC. |
| Webhooks (outbound) | Subscribe to `invoice.paid`, `invoice.sent`, etc. (Phase 7). |

### Error codes
`unauthorized` · `forbidden` · `not_found` · `validation_error` ·
`rate_limited` · `conflict` · `plan_limit_reached` · `internal_error`.

---

## Resources & endpoints

### Clients
```
GET    /v1/clients                 List clients (paginated, ?search=)
POST   /v1/clients                 Create a client
GET    /v1/clients/{id}            Retrieve a client
PATCH  /v1/clients/{id}            Update a client
DELETE /v1/clients/{id}            Delete a client (409 if it has invoices)
```

### Invoices
```
GET    /v1/invoices                List (?status=&client_id=&from=&to=)
POST   /v1/invoices                Create (with line items; totals auto-computed)
GET    /v1/invoices/{id}           Retrieve (includes line items + totals)
PATCH  /v1/invoices/{id}           Update (draft only)
DELETE /v1/invoices/{id}           Delete (draft only)
POST   /v1/invoices/{id}/send      Email to the client (optionally attach pay link)
POST   /v1/invoices/{id}/pay-link  Create a Stripe payment link, returns URL
POST   /v1/invoices/{id}/mark-paid Manually mark paid (records a payment)
GET    /v1/invoices/{id}/pdf       Download the rendered PDF
```

### Payments
```
GET    /v1/payments                List payments (?invoice_id=)
GET    /v1/payments/{id}           Retrieve a payment
```

### Meta
```
GET    /v1/me                      The org + plan + limits for this key
GET    /v1/openapi.json            Machine-readable spec
```

---

## Example: create & send an invoice

```bash
curl https://YOURDOMAIN/api/v1/invoices \
  -H "Authorization: Bearer ifk_live_..." \
  -H "Idempotency-Key: 1b9d...-uuid" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "c_123",
    "currency": "GBP",
    "due_date": "2026-07-23",
    "tax_rate": 20,
    "line_items": [
      { "description": "Website design", "quantity": 1, "unit_price": "6500.00" },
      { "description": "Design system",  "quantity": 1, "unit_price": "3800.00" }
    ]
  }'
```

```json
{
  "id": "in_456",
  "number": "INV-2026-018",
  "status": "draft",
  "currency": "GBP",
  "subtotal": "10300.00",
  "tax_amount": "2060.00",
  "total": "12360.00",
  "created_at": "2026-06-23T10:00:00Z"
}
```

```bash
# then send it with a Stripe pay link attached
curl -X POST https://YOURDOMAIN/api/v1/invoices/in_456/send \
  -H "Authorization: Bearer ifk_live_..." \
  -d '{ "attach_payment_link": true }'
```

---

## Implementation notes (for the build)
- REST routes live in `api/v1/*` (or a Hono/Express sub-app) and call the **same**
  service functions as the tRPC routers — no duplicated business logic.
- The OpenAPI document is generated from Zod schemas (single source of truth) so the
  docs never drift from the code.
- Plan limits are enforced centrally; over-limit calls return `plan_limit_reached` (402/403).
