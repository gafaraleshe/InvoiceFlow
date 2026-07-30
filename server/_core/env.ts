/**
 * Environment values for the hosted storage proxy.
 *
 * Everything else that used to live here — OAuth server URL, app id, JWT cookie
 * secret, owner open id — belonged to the pre-Clerk Manus auth flow and was read
 * only by modules that have since been deleted. Authentication now reads
 * CLERK_SECRET_KEY directly (server/auth/clerk.ts) and the database reads its
 * own connection string (server/db/client.ts).
 *
 * These two remain because server/storage.ts and server/pdfGenerator.ts still
 * upload through the inherited storage proxy — see MIGRATION-AUDIT.md § 5 for
 * the recommendation to replace it with Supabase Storage or direct S3.
 */
export const ENV = {
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
