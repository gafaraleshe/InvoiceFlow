#!/usr/bin/env node
/**
 * Sigma MCP server (stdio). Exposes the Sigma REST API as MCP tools
 * so an assistant can manage clients and invoices.
 *
 * Configure with two environment variables:
 *   INVOICEFLOW_API_URL  – your site origin, e.g. https://invoice-flow-teal.vercel.app
 *   INVOICEFLOW_API_KEY  – an API key (ifk_live_… / ifk_test_…) from the dashboard
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SigmaClient } from "./client.js";
import { tools } from "./tools.js";
import { ApiError } from "./client.js";

export function createServer(client: SigmaClient): McpServer {
  const server = new McpServer({ name: "invoiceflow-mcp", version: "1.0.0" });

  for (const tool of tools) {
    server.tool(tool.name, tool.description, tool.shape, async args => {
      try {
        const data = await tool.handler(client, args as Record<string, unknown>);
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? `Sigma API error (${err.status} ${err.code}): ${err.message}`
            : err instanceof Error
              ? err.message
              : String(err);
        return { isError: true, content: [{ type: "text", text: message }] };
      }
    });
  }

  return server;
}

async function main() {
  // Prefer SIGMA_* env vars; fall back to the legacy INVOICEFLOW_* names.
  const baseUrl = process.env.SIGMA_API_URL ?? process.env.INVOICEFLOW_API_URL;
  const apiKey = process.env.SIGMA_API_KEY ?? process.env.INVOICEFLOW_API_KEY;
  if (!baseUrl || !apiKey) {
    console.error(
      "sigma-mcp: set SIGMA_API_URL and SIGMA_API_KEY in the environment."
    );
    process.exit(1);
  }

  const client = new SigmaClient({ baseUrl, apiKey });
  const server = createServer(client);
  await server.connect(new StdioServerTransport());
  console.error("sigma-mcp: ready on stdio");
}

// Only run when executed directly (not when imported by tests).
const isMain =
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isMain) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
