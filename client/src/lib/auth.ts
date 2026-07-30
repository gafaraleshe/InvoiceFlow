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

/* ── dev sign-in ──────────────────────────────────────────────────────────
 * Local development without a Clerk instance. The server counterpart is
 * server/auth/devAuth.ts, which only honours these tokens when its own
 * DEV_AUTH flag is set and NODE_ENV is not production.
 *
 * Clerk always wins: if a publishable key is set, dev sign-in is off, so a
 * stale VITE_DEV_AUTH in an env file can't downgrade a real deployment.
 */

export const devAuthEnabled =
  !clerkConfigured &&
  /^(1|true|yes|on)$/i.test(String(import.meta.env.VITE_DEV_AUTH ?? "").trim());

/** localStorage key holding the dev identity (dev sign-in only). */
const DEV_IDENTITY_KEY = "hermiteflow.devIdentity";

export type DevIdentity = { email: string; name: string | null };

export function getDevIdentity(): DevIdentity | null {
  if (!devAuthEnabled) return null;
  try {
    const raw = localStorage.getItem(DEV_IDENTITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DevIdentity>;
    if (typeof parsed.email !== "string" || !parsed.email) return null;
    return {
      email: parsed.email,
      name: typeof parsed.name === "string" ? parsed.name : null,
    };
  } catch {
    return null;
  }
}

export function setDevIdentity(identity: DevIdentity): void {
  localStorage.setItem(DEV_IDENTITY_KEY, JSON.stringify(identity));
}

export function clearDevIdentity(): void {
  localStorage.removeItem(DEV_IDENTITY_KEY);
}

/** Encode a dev identity as a bearer token. Mirrors encodeDevToken() on the server. */
function encodeDevToken(identity: DevIdentity): string {
  const json = JSON.stringify({ email: identity.email, name: identity.name });
  // base64url — the server decodes with Buffer.from(…, "base64url"). btoa needs
  // a binary string, so widen the UTF-8 bytes one at a time (an email or name
  // may well be non-ASCII).
  let binary = "";
  new TextEncoder().encode(json).forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  const base64 = btoa(binary);
  return (
    "dev." + base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  );
}

/** localStorage key holding the user's selected active organization id. */
export const ACTIVE_ORG_KEY = "hermiteflow.activeOrg";

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
  const devIdentity = getDevIdentity();
  if (devIdentity) {
    headers["Authorization"] = `Bearer ${encodeDevToken(devIdentity)}`;
  } else {
    try {
      const token = await window.Clerk?.session?.getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    } catch {
      // No active session — request goes out unauthenticated.
    }
  }
  const org = localStorage.getItem(ACTIVE_ORG_KEY);
  if (org) headers["x-organization-id"] = org;
  return headers;
}
