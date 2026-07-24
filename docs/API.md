# HermiteFlow Public API (v1)

A versioned, key-authenticated REST API over the same domain services that power the
app. Designed for customers and integrations to manage clients, invoices, and payments
programmatically.

- **Base URL:** `https://flow.hermitelabs.com/api/v1` (or `https://YOURDOMAIN/api/v1`)
- **Format:** JSON. UTF-8. Money as integer-minor-units optional; default decimal strings.
- **Versioning:** path-based (`/v1`). Breaking changes ship under `/v2`.
- **Spec:** an **OpenAPI 3.0** document is published at `/api/v1/openapi.json`
  (source of truth: `server/rest/openapi.ts`, mirrored to `openapi.yaml`).

> Status: **implemented** — clients, invoices, and dashboard endpoints are live.
> Payments, pay-links, idempotency, and rate-limit headers remain design (later
> phases) and are marked below.

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
| Pagination | `?page=` (1-based) + `?limit=` (max 100, default 25); responses include `{ data, page, limit, total, total_pages }`. |
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
GET    /v1/invoices                List (?status=&client_id=&page=&limit=)
POST   /v1/invoices                Create (with line items; totals auto-computed)
GET    /v1/invoices/{id}           Retrieve (includes line items + totals)
PATCH  /v1/invoices/{id}           Update / change status (paid invoices are locked)
DELETE /v1/invoices/{id}           Delete (draft only)
POST   /v1/invoices/{id}/send      Email to the client
POST   /v1/invoices/{id}/pdf       Generate the rendered PDF (returns its path)
```

> Request bodies accept snake_case (`client_id`, `due_date`, `tax_rate`,
> `line_items[].unit_price`) with ISO dates; responses use the app's camelCase
> field names. `PATCH` applies field updates and, if `status` is present,
> transitions the invoice.

### Meta
```
GET    /v1/me                      The org this key belongs to
GET    /v1/openapi.json            Machine-readable spec (no key required)
```

### Not yet implemented (design — later phases)
```
POST   /v1/invoices/{id}/pay-link  Create a Stripe payment link
POST   /v1/invoices/{id}/mark-paid Manually mark paid (records a payment)
GET    /v1/payments                List payments
GET    /v1/payments/{id}           Retrieve a payment
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

## Implementation notes
- REST routes live in [`server/rest/`](../server/rest) as an Express sub-app
  mounted at `/api/v1`, and call the **same** tRPC procedures via
  `appRouter.createCaller(ctx)` — no duplicated business logic.
- API keys are **organization-scoped** (`server/db/schema.ts` → `api_keys`),
  SHA-256 hashed with a lookup `prefix`. `resolveApiKeyContext` turns a key into
  the same `{ user, active }` context a `protectedProcedure` expects.
- The OpenAPI object in `server/rest/openapi.ts` is the single source of truth;
  `pnpm gen:openapi` writes `openapi.yaml`, and it is served at
  `/api/v1/openapi.json`.
- Plan limits / idempotency / rate-limit headers are future work.

---

## MCP server

The [`mcp/`](../mcp) package wraps this REST API as a Model Context Protocol
server, so assistants (Claude Code, Claude Desktop) can manage clients and
invoices. It talks to the API over HTTP using:

| Variable | Example |
|----------|---------|
| `HERMITE_FLOW_API_URL` | `https://flow.hermitelabs.com` |
| `HERMITE_FLOW_API_KEY` | `ifk_live_…` |

Configure it in `.mcp.json` (Claude Code) or `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hermiteflow": {
      "command": "node",
      "args": ["/absolute/path/to/HermiteFlow/mcp/dist/index.js"],
      "env": {
        "HERMITE_FLOW_API_URL": "https://flow.hermitelabs.com",
        "HERMITE_FLOW_API_KEY": "ifk_live_xxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

Tools: `list_clients`, `get_client`, `create_client`, `update_client`,
`delete_client`, `list_invoices`, `get_invoice`, `create_invoice`,
`update_invoice`, `update_invoice_status`, `delete_invoice`,
`send_invoice_email`, `generate_invoice_pdf`, `get_dashboard_stats`.
See [`mcp/README.md`](../mcp/README.md) for full setup.
