import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

/** Requires an authenticated user with a resolved active organization. */
const requireOrg = t.middleware(async opts => {
  const { ctx, next } = opts;
  if (!ctx.user || !ctx.active) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: { ...ctx, user: ctx.user, active: ctx.active },
  });
});

export const protectedProcedure = t.procedure.use(requireOrg);

/** Requires owner/admin role in the active organization. */
export const adminProcedure = protectedProcedure.use(async opts => {
  const { ctx, next } = opts;
  if (ctx.active.role !== "owner" && ctx.active.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
  }
  return next();
});
