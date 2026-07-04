import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import {
  bearerFromHeader,
  verifyClerkToken,
  type AuthUser,
} from "../auth/clerk";
import { resolveActiveContext, type ActiveContext } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: AuthUser | null;
  /** The caller's active organization + role, or null if unauthenticated. */
  active: ActiveContext | null;
  /**
   * Set when the Clerk token was valid but we couldn't load/provision the
   * workspace (e.g. the database is unreachable or the schema isn't applied).
   * Lets `auth.me` report the real reason instead of looking unauthenticated.
   */
  authError?: string;
};

const ORG_HEADER = "x-organization-id";

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: AuthUser | null = null;
  let active: ActiveContext | null = null;
  let authError: string | undefined;

  // A missing/invalid token just means "not signed in" — never block the
  // request, so public procedures keep working.
  try {
    const token = bearerFromHeader(opts.req.headers.authorization);
    user = await verifyClerkToken(token);
  } catch (error) {
    console.error("[context] token verification failed:", error);
    user = null;
  }

  // The token is valid but resolving the org can fail for real, actionable
  // reasons (DB down, schema not migrated). Capture that separately.
  if (user) {
    try {
      const requestedOrg = opts.req.headers[ORG_HEADER];
      const orgId = Array.isArray(requestedOrg)
        ? requestedOrg[0]
        : requestedOrg;
      active = await resolveActiveContext(
        { id: user.id, email: user.email ?? "", fullName: user.fullName },
        orgId ?? null
      );
    } catch (error) {
      console.error("[context] workspace resolution failed:", error);
      authError =
        error instanceof Error ? error.message : "Failed to load workspace";
    }
  }

  return { req: opts.req, res: opts.res, user, active, authError };
}
