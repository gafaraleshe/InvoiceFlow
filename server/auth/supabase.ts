/**
 * Supabase Auth verification (Phase 1).
 *
 * The browser authenticates with Supabase and sends the resulting access token
 * to our API as a Bearer token. We verify that JWT here — this is the
 * server-side trust boundary that replaces the previous Manus OAuth.
 *
 * Supports both signing schemes:
 *  - Asymmetric (ES256/RS256) — the modern Supabase default. Verified against
 *    the project's public JWKS endpoint (no secret needed).
 *  - HS256 — legacy shared secret via SUPABASE_JWT_SECRET.
 */
import { createRemoteJWKSet, jwtVerify } from "jose";

const encoder = new TextEncoder();

const supabaseUrl = (
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  ""
).replace(/\/$/, "");

// Lazily-created, cached remote key set for asymmetric verification.
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJwks() {
  if (!supabaseUrl) return null;
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`)
    );
  }
  return jwks;
}

export interface SupabaseUser {
  id: string; // auth.users.id (uuid)
  email: string | null;
  fullName: string | null;
}

function extractUser(payload: Record<string, unknown>): SupabaseUser | null {
  if (!payload.sub || typeof payload.sub !== "string") return null;
  const meta = (payload.user_metadata as Record<string, unknown>) ?? {};
  return {
    id: payload.sub,
    email: (payload.email as string | undefined) ?? null,
    fullName:
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      null,
  };
}

/**
 * Verify a Supabase access token. Returns the user, or null if the token is
 * missing/invalid/expired or no verification material is configured.
 */
export async function verifySupabaseToken(
  token: string | undefined | null
): Promise<SupabaseUser | null> {
  if (!token) return null;

  // Legacy HS256 shared secret takes precedence if explicitly configured.
  const secret = process.env.SUPABASE_JWT_SECRET;
  try {
    if (secret) {
      const { payload } = await jwtVerify(token, encoder.encode(secret), {
        audience: "authenticated",
      });
      return extractUser(payload);
    }
    const keys = getJwks();
    if (!keys) {
      console.warn(
        "[auth] No SUPABASE_URL or SUPABASE_JWT_SECRET set — cannot verify tokens."
      );
      return null;
    }
    const { payload } = await jwtVerify(token, keys, {
      audience: "authenticated",
    });
    return extractUser(payload);
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
