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
export const ACTIVE_ORG_KEY = "invoiceflow.activeOrg";

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
