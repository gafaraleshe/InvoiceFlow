/**
 * Client auth helpers for Clerk.
 *
 * Clerk mounts a global `window.Clerk` once <ClerkProvider> is active, which
 * lets us read the current session token outside of React (e.g. from the tRPC
 * link) without threading a hook through everything.
 */

export const clerkPublishableKey = import.meta.env
  .VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

export const clerkConfigured = Boolean(clerkPublishableKey);

/** localStorage key holding the user's selected active organization id. */
export const ACTIVE_ORG_KEY = "hermiteflow.activeOrg";

/** Pre-rebrand key. Read once on boot so nobody loses their active org. */
// TODO(hermite): remove after env cutover
const LEGACY_ACTIVE_ORG_KEY = "invoiceflow.activeOrg";

/**
 * Move a pre-rebrand active-org selection onto the new key. Runs once at
 * module load; a no-op for anyone who never had the old key.
 */
// TODO(hermite): remove after env cutover
function migrateLegacyActiveOrg(): void {
  try {
    if (localStorage.getItem(ACTIVE_ORG_KEY)) return;
    const legacy = localStorage.getItem(LEGACY_ACTIVE_ORG_KEY);
    if (!legacy) return;
    localStorage.setItem(ACTIVE_ORG_KEY, legacy);
    localStorage.removeItem(LEGACY_ACTIVE_ORG_KEY);
  } catch {
    // Storage unavailable (private mode, blocked cookies) — nothing to migrate.
  }
}

if (typeof localStorage !== "undefined") migrateLegacyActiveOrg();

type ClerkGlobal = {
  session?: { getToken: () => Promise<string | null> } | null;
};

declare global {
  interface Window {
    Clerk?: ClerkGlobal;
  }
}

/** Current access token + active org, for attaching to API requests. */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  try {
    const token = await window.Clerk?.session?.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {
    // No active session — request goes out unauthenticated.
  }
  const org = localStorage.getItem(ACTIVE_ORG_KEY);
  if (org) headers["x-organization-id"] = org;
  return headers;
}
