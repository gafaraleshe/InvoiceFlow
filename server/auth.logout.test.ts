import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function unauthContext(): TrpcContext {
  return {
    user: null,
    active: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("auth.logout", () => {
  it("reports success (sign-out is handled client-side via Supabase)", async () => {
    const caller = appRouter.createCaller(unauthContext());
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});
