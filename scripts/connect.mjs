#!/usr/bin/env node
/**
 * HermiteFlow connect — a one-command connector (Composio-style) for wiring a
 * booking site to HermiteFlow.
 *
 * It verifies your API key against the live API, tells you which workspace and
 * access level the key has, and writes a ready-to-paste `.env.hermiteflow`
 * (HERMITE_FLOW_API_URL / HERMITE_FLOW_API_KEY) plus a copy-paste booking snippet.
 *
 * Usage:
 *   node scripts/connect.mjs --url https://flow.hermitelabs.com --key ifk_live_xxx
 *   npx @hermitelabs/flow-connect --url <origin> --key <key>   (once published)
 *
 * Flags:
 *   --url   <origin>   Your HermiteFlow site origin ("/api/v1" is appended automatically)
 *   --key   <ifk_...>  An API key (create one in Settings → Integrations)
 *   --out   <path>     Env file to write (default: .env.hermiteflow)
 *   --no-write         Verify only; don't write any file
 */
import { writeFileSync } from "node:fs";

const RESET = "\x1b[0m";
const c = (n) => (s) => `\x1b[${n}m${s}${RESET}`;
const blue = c("38;2;26;38;255");
const cyan = c("38;2;0;212;255");
const dim = c("2");
const green = c("32");
const red = c("31");

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--no-write") out.write = false;
    else if (a.startsWith("--")) out[a.slice(2)] = argv[++i];
  }
  return out;
}

function normalizeBase(url) {
  const trimmed = String(url).replace(/\/+$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = args.url || process.env.HERMITE_FLOW_API_URL;
  const key = args.key || process.env.HERMITE_FLOW_API_KEY;
  const outPath = args.out || ".env.hermiteflow";
  const shouldWrite = args.write !== false;

  console.log("");
  console.log(`  ${blue("≈")} ${blue("HermiteFlow connect")}  ${dim("— by Gaffy Studios")}`);
  console.log("");

  if (!url || !key) {
    console.error(red("  Missing --url or --key."));
    console.error(
      dim("  Usage: node scripts/connect.mjs --url <origin> --key ifk_live_xxx")
    );
    process.exit(1);
  }

  const base = normalizeBase(url);
  process.stdout.write(dim(`  → verifying key against ${base}/me ... `));

  let me;
  try {
    const res = await fetch(`${base}/me`, {
      headers: { authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      console.log(red("failed"));
      const body = await res.json().catch(() => ({}));
      console.error(
        red(`  ✗ ${res.status} ${body?.error?.message ?? "Invalid or revoked API key."}`)
      );
      process.exit(1);
    }
    me = await res.json();
  } catch (err) {
    console.log(red("failed"));
    console.error(red(`  ✗ Could not reach ${base}: ${err.message}`));
    process.exit(1);
  }

  console.log(green("ok"));
  console.log("");
  console.log(`  ${green("✓")} authenticated as ${cyan(me.organization?.name ?? "workspace")}`);
  console.log(
    `  ${green("✓")} access: ${cyan(me.owner ? "owner (full)" : me.role ?? "member")}` +
      (me.scopes?.length ? dim(`  scopes: ${me.scopes.join(", ")}`) : "")
  );

  if (shouldWrite) {
    const env = [
      "# Written by `hermite-flow connect`. Point your booking site at HermiteFlow.",
      `HERMITE_FLOW_API_URL=${url}`,
      `HERMITE_FLOW_API_KEY=${key}`,
      "",
    ].join("\n");
    writeFileSync(outPath, env);
    console.log(`  ${green("✓")} wrote ${cyan(outPath)}`);
  }

  console.log("");
  console.log(dim("  Create a booking (invoice raised + emailed via Resend):"));
  console.log(
    `  ${blue("$")} curl -X POST ${base}/bookings \\\n` +
      `      -H "Authorization: Bearer ${key.slice(0, 12)}..." \\\n` +
      `      -H "Content-Type: application/json" \\\n` +
      `      -d '{"name":"Ada","email":"ada@example.com","service_type":"Wedding","amount":1200,"auto_send":true}'`
  );
  console.log("");
  console.log(dim("  Docs: docs/INTEGRATION_GUIDE.md"));
  console.log("");
}

main().catch((err) => {
  console.error(red(err.stack || String(err)));
  process.exit(1);
});
