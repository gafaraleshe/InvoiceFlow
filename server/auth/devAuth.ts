/**
 * Development-only sign-in, for running the product without a Clerk instance.
 *
 * Clerk is the real trust boundary (see ./clerk.ts). But standing up a Clerk
 * instance just to click through the CRM locally is friction, and the whole app
 * is behind `protectedProcedure`, so without *some* session there is nothing to
 * test. This module accepts a self-declared identity instead — you say who you
 * are and the server believes you.
 *
 * That is obviously not authentication. Two independent conditions gate it:
 *
 *   1. `DEV_AUTH=1` must be set explicitly. Off by default.
 *   2. `NODE_ENV` must not be "production".
 *
 * Both are checked here, once, at module load. There is no code path that
 * accepts a dev token in a production build, and `assertDevAuthSafe()` (called
 * from the server entrypoint) crashes the process rather than start if the two
 * ever disagree.
 *
 * Token format, sent as `Authorization: Bearer dev.<base64url-json>`:
 *
 *   { "email": "you@example.com", "name": "Your Name" }
 *
 * The `dev.` prefix means a dev token can never be mistaken for a Clerk JWT and
 * vice versa. User ids are derived from the email so the same address always
 * lands in the same workspace across restarts.
 */
import { createHash } from "node:crypto";
import type { AuthUser } from "./clerk";

const TOKEN_PREFIX = "dev.";

function envFlag(value: string | undefined): boolean {
  return /^(1|true|yes|on)$/i.test((value ?? "").trim());
}

const isProduction = process.env.NODE_ENV === "production";

/** Whether self-declared dev sign-in is accepted by this process. */
export const DEV_AUTH_ENABLED = envFlag(process.env.DEV_AUTH) && !isProduction;

/**
 * Refuse to boot a production server that was asked to enable dev sign-in.
 *
 * `DEV_AUTH_ENABLED` is already false in that case, so this is belt-and-braces:
 * a deploy with `DEV_AUTH=1` in its environment is a misconfiguration worth
 * failing loudly on, not silently ignoring.
 */
export function assertDevAuthSafe(): void {
  if (envFlag(process.env.DEV_AUTH) && isProduction) {
    throw new Error(
      "DEV_AUTH is set but NODE_ENV=production. Dev sign-in accepts any " +
        "identity without verification and must never be enabled in " +
        "production. Unset DEV_AUTH."
    );
  }
  if (DEV_AUTH_ENABLED) {
    console.warn(
      "\n  ⚠  DEV_AUTH is ON — any caller can sign in as anyone, unverified.\n" +
        "     For local development only. Never set DEV_AUTH in a deployed environment.\n"
    );
  }
}

/**
 * Stable, obviously-synthetic user id for a dev identity.
 *
 * Prefixed `dev_user_` so dev rows are recognisable (and deletable) in the
 * database, and can never collide with a real Clerk id (`user_…`).
 */
export function devUserId(email: string): string {
  const digest = createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");
  return `dev_user_${digest.slice(0, 24)}`;
}

/** Encode a dev identity into a bearer token. Mirrors the client helper. */
export function encodeDevToken(identity: {
  email: string;
  name?: string | null;
}): string {
  const json = JSON.stringify({
    email: identity.email,
    name: identity.name ?? null,
  });
  return TOKEN_PREFIX + Buffer.from(json, "utf8").toString("base64url");
}

/** Whether a bearer token is a dev token (regardless of whether it's allowed). */
export function isDevToken(token: string | undefined | null): boolean {
  return typeof token === "string" && token.startsWith(TOKEN_PREFIX);
}

/**
 * Resolve a dev token to a user, or null if dev sign-in is disabled or the
 * token is malformed. Never throws — an unparseable token is just "not signed
 * in", exactly like an expired Clerk JWT.
 */
export function verifyDevToken(
  token: string | undefined | null
): AuthUser | null {
  if (!DEV_AUTH_ENABLED || !isDevToken(token)) return null;

  try {
    const payload: unknown = JSON.parse(
      Buffer.from(token!.slice(TOKEN_PREFIX.length), "base64url").toString(
        "utf8"
      )
    );
    if (typeof payload !== "object" || payload === null) return null;

    const { email, name } = payload as { email?: unknown; name?: unknown };
    // A real address is required: it is the workspace key, and invoice email
    // and PDF templates read it.
    if (
      typeof email !== "string" ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    ) {
      return null;
    }

    const normalised = email.trim().toLowerCase();
    return {
      id: devUserId(normalised),
      email: normalised,
      fullName: typeof name === "string" && name.trim() ? name.trim() : null,
    };
  } catch {
    return null;
  }
}
