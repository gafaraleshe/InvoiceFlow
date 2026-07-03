/**
 * Clerk authentication verification.
 *
 * The browser authenticates with Clerk and sends the resulting session token to
 * our API as a Bearer token. We verify that JWT here — this is the server-side
 * trust boundary that replaces the previous Supabase Auth.
 *
 * `verifyToken` validates the signature against Clerk's JWKS (cached) using the
 * instance's secret key. The default Clerk session token only carries `sub`
 * (the user id), so we resolve email/name from the Backend API — unless a
 * custom JWT template has been configured to include them as claims, which we
 * prefer when present to avoid the extra lookup.
 */
import { createClerkClient, verifyToken } from "@clerk/backend";

type TokenClaims = Awaited<ReturnType<typeof verifyToken>>;

const secretKey = process.env.CLERK_SECRET_KEY ?? "";

const clerk = secretKey ? createClerkClient({ secretKey }) : null;

export interface AuthUser {
  id: string; // Clerk user id, e.g. "user_2ab…"
  email: string | null;
  fullName: string | null;
}

// Short-lived cache of profile lookups so we don't hit the Backend API on every
// request for the same signed-in user.
const PROFILE_TTL_MS = 5 * 60_000;
type CachedProfile = { at: number; email: string | null; fullName: string | null };
const profileCache = new Map<string, CachedProfile>();

function nameFromParts(first?: unknown, last?: unknown, fallback?: unknown) {
  const joined = [first, last]
    .filter((p): p is string => typeof p === "string" && p.length > 0)
    .join(" ");
  return joined || (typeof fallback === "string" ? fallback : null);
}

async function resolveProfile(
  userId: string,
  claims: TokenClaims & Record<string, unknown>
): Promise<{ email: string | null; fullName: string | null }> {
  // Prefer claims from a custom JWT template if one is configured.
  const claimEmail =
    typeof claims.email === "string" ? claims.email : null;
  if (claimEmail) {
    return {
      email: claimEmail,
      fullName:
        (typeof claims.name === "string" ? claims.name : null) ??
        nameFromParts(claims.first_name, claims.last_name),
    };
  }

  const cached = profileCache.get(userId);
  if (cached && Date.now() - cached.at < PROFILE_TTL_MS) {
    return { email: cached.email, fullName: cached.fullName };
  }

  if (!clerk) return { email: null, fullName: null };

  try {
    const u = await clerk.users.getUser(userId);
    const email =
      u.primaryEmailAddress?.emailAddress ??
      u.emailAddresses[0]?.emailAddress ??
      null;
    const fullName = nameFromParts(u.firstName, u.lastName, u.username);
    profileCache.set(userId, { at: Date.now(), email, fullName });
    return { email, fullName };
  } catch (err) {
    console.error("[auth] failed to load Clerk user profile:", err);
    return { email: null, fullName: null };
  }
}

/**
 * Verify a Clerk session token. Returns the user, or null if the token is
 * missing/invalid/expired or no verification material is configured.
 */
export async function verifyClerkToken(
  token: string | undefined | null
): Promise<AuthUser | null> {
  if (!token) return null;
  if (!secretKey) {
    console.warn("[auth] CLERK_SECRET_KEY not set — cannot verify tokens.");
    return null;
  }

  try {
    const claims = (await verifyToken(token, { secretKey })) as TokenClaims &
      Record<string, unknown>;
    if (!claims.sub) return null;
    const { email, fullName } = await resolveProfile(claims.sub, claims);
    return { id: claims.sub, email, fullName };
  } catch {
    return null;
  }
}

/** Pull the bearer token out of an Authorization header. */
export function bearerFromHeader(
  authorization: string | undefined | null
): string | null {
  if (!authorization) return null;
  const [scheme, value] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !value) return null;
  return value.trim();
}
