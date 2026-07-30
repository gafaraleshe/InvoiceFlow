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
import { warnIfDevAuthMisconfigured } from "./auth/devAuth";

// Log — deliberately do NOT throw. In a serverless runtime a module-scope throw
// fails every invocation, including /api/health, which is the endpoint that
// would tell you what is misconfigured. Dev sign-in is already inert in
// production (see devAuth.ts); the health probe reports the misconfiguration.
warnIfDevAuthMisconfigured();

export default createApp();
