import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import {
  bearerFromHeader,
  verifySupabaseToken,
  type SupabaseUser,
} from "../auth/supabase";
import { resolveActiveContext, type ActiveContext } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: SupabaseUser | null;
  /** The caller's active organization + role, or null if unauthenticated. */
  active: ActiveContext | null;
};

const ORG_HEADER = "x-organization-id";

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: SupabaseUser | null = null;
  let active: ActiveContext | null = null;

  try {
    const token = bearerFromHeader(opts.req.headers.authorization);
    user = await verifySupabaseToken(token);

    if (user) {
      const requestedOrg = opts.req.headers[ORG_HEADER];
      const orgId = Array.isArray(requestedOrg)
        ? requestedOrg[0]
        : requestedOrg;
      active = await resolveActiveContext(
        { id: user.id, email: user.email ?? "", fullName: user.fullName },
        orgId ?? null
      );
    }
  } catch (error) {
    // Auth is optional for public procedures; never block context creation.
    console.error("[context] auth resolution failed:", error);
    user = null;
    active = null;
  }

  return { req: opts.req, res: opts.res, user, active };
}
