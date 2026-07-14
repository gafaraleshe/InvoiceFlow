/**
 * Generates openapi.yaml from the single source of truth
 * (server/rest/openapi.ts). Run with `pnpm gen:openapi`.
 */
import { writeFileSync } from "node:fs";
import { stringify } from "yaml";
import { openapiSpec } from "../server/rest/openapi";

const header =
  "# AUTO-GENERATED from server/rest/openapi.ts — run `pnpm gen:openapi`.\n";
writeFileSync("openapi.yaml", header + stringify(openapiSpec));
console.log("wrote openapi.yaml");
