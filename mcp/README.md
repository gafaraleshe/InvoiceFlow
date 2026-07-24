# @hermitelabs/flow-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server that exposes
the **HermiteFlow REST API** as tools, so assistants like Claude can manage your
clients and invoices in natural language.

It talks to the deployed HermiteFlow API over HTTP with an API key — it does not
need database access or the app source.

## Tools

| Tool | Description |
|------|-------------|
| `list_clients` | List clients (`page`, `limit`, `search`) |
| `get_client` | Retrieve a client by id |
| `create_client` | Create a client |
| `update_client` | Update a client |
| `delete_client` | Delete a client |
| `list_invoices` | List invoices (`status`, `client_id`, pagination) |
| `get_invoice` | Retrieve an invoice |
| `create_invoice` | Create an invoice (totals/VAT computed server-side) |
| `update_invoice` | Update a draft invoice |
| `update_invoice_status` | Set status (draft/sent/paid/overdue) |
| `delete_invoice` | Delete a draft invoice |
| `send_invoice_email` | Email the invoice to the client |
| `generate_invoice_pdf` | Generate the invoice PDF |
| `get_dashboard_stats` | Revenue / outstanding / counts |

## Configuration

Two environment variables:

| Variable | Example | Notes |
|----------|---------|-------|
| `HERMITE_FLOW_API_URL` | `https://flow.hermitelabs.com` | Your site origin. `/api/v1` is appended automatically. |
| `HERMITE_FLOW_API_KEY` | `ifk_live_…` | Create one in the dashboard → **Settings → Integrations → API keys**. |

## Install & build

```bash
cd mcp
pnpm install
pnpm build      # -> dist/index.js
```

Run it standalone (for a quick check — it speaks MCP over stdio):

```bash
HERMITE_FLOW_API_URL=https://flow.hermitelabs.com \
HERMITE_FLOW_API_KEY=ifk_live_xxx \
node dist/index.js
```

## Use in Claude Code (`.mcp.json`)

Add to `.mcp.json` in your project root (or `~/.claude.json`):

```json
{
  "mcpServers": {
    "hermite-flow": {
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

## Use in Claude Desktop (`claude_desktop_config.json`)

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or
`%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "hermite-flow": {
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

Restart Claude Desktop after editing. If you publish the package, you can use
`"command": "npx", "args": ["-y", "@hermitelabs/flow-mcp"]` instead of an absolute path.

## Develop

```bash
pnpm dev     # tsx src/index.ts
pnpm test    # vitest (mocked REST client)
pnpm check   # tsc --noEmit
```
