/**
 * Serverless entry for Vercel. Exports the Express app as the default export so
 * Vercel's Node runtime can invoke it directly.
 *
 * This file is bundled by our own esbuild (see the `build:vercel` script) into
 * a single self-contained file, so the deployed function has no unresolved
 * path-alias or extensionless imports — the thing that made Vercel's own
 * tracer fail with ERR_MODULE_NOT_FOUND.
 */
import { createApp } from "./_core/app";
import { assertDevAuthSafe } from "./auth/devAuth";

// Throws at cold start (failing the function loudly) rather than serving traffic
// with unverified sign-in enabled.
assertDevAuthSafe();

export default createApp();
