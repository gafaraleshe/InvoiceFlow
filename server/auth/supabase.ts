/**
 * Supabase Auth verification (Phase 1).
 *
 * The browser authenticates with Supabase and sends the resulting access token
 * to our API as a Bearer token. Here we verify that JWT with the project's
 * `SUPABASE_JWT_SECRET` (HS256) and extract the user identity. This is the
 * server-side trust boundary that replaces the previous Manus OAuth.
 *
 * No network call is needed — verification is local using the shared secret.
 */
import { jwtVerify } from "jose";

const encoder = new TextEncoder();

function getJwtSecret(): Uint8Array | null {
  const secret = process.env.SUPABASE_JWT_SECRET;
  return secret ? encoder.encode(secret) : null;
}

export interface SupabaseUser {
  id: string; // auth.users.id (uuid)
  email: string | null;
  role: string | null; // Supabase auth role (e.g. "authenticated")
}

/**
 * Verify a Supabase access token. Returns the user, or null if the token is
 * missing/invalid/expired or the secret isn't configured.
 */
export async function verifySupabaseToken(
  token: string | undefined | null
): Promise<SupabaseUser | null> {
  if (!token) return null;
  const secret = getJwtSecret();
  if (!secret) {
    console.warn("[auth] SUPABASE_JWT_SECRET not set — cannot verify tokens.");
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      // Supabase signs access tokens for the "authenticated" audience.
      audience: "authenticated",
    });
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      email: (payload.email as string | undefined) ?? null,
      role: (payload.role as string | undefined) ?? null,
    };
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
