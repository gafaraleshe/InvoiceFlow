#!/usr/bin/env node
/**
 * HermiteFlow MCP server (stdio). Exposes the HermiteFlow REST API as MCP tools
 * so an assistant can manage clients and invoices.
 *
 * Configure with two environment variables:
 *   HERMITE_FLOW_API_URL  – your site origin, e.g. https://flow.hermitelabs.com
 *   HERMITE_FLOW_API_KEY  – an API key (ifk_live_… / ifk_test_…) from the dashboard
 *
 * The legacy INVOICEFLOW_* names still work as a fallback during the env
 * cutover; see main() below.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { HermiteFlowClient } from "./client.js";
import { tools } from "./tools.js";
import { ApiError } from "./client.js";

export function createServer(client: HermiteFlowClient): McpServer {
  const server = new McpServer({ name: "hermiteflow-mcp", version: "1.0.0" });

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
            ? `HermiteFlow API error (${err.status} ${err.code}): ${err.message}`
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
  // Prefer the HERMITE_* names; fall back to the legacy INVOICEFLOW_* ones so
  // existing MCP client configs keep working across the env cutover.
  // TODO(hermite): remove after env cutover
  const baseUrl = process.env.HERMITE_FLOW_API_URL ?? process.env.INVOICEFLOW_API_URL;
  // TODO(hermite): remove after env cutover
  const apiKey = process.env.HERMITE_FLOW_API_KEY ?? process.env.INVOICEFLOW_API_KEY;
  if (!baseUrl || !apiKey) {
    console.error(
      "hermite-flow-mcp: set HERMITE_FLOW_API_URL and HERMITE_FLOW_API_KEY in the environment."
    );
    process.exit(1);
  }

  const client = new HermiteFlowClient({ baseUrl, apiKey });
  const server = createServer(client);
  await server.connect(new StdioServerTransport());
  console.error("hermite-flow-mcp: ready on stdio");
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
