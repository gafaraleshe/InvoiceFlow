/**
 * Tenant isolation for overdue flagging.
 *
 * `flagOverdueInvoices()` used to take no organization id at all, and was
 * exposed on `dashboard.flagOverdue` via `protectedProcedure` — so any signed-in
 * user of any tenant triggered an unbounded UPDATE across every organization's
 * invoices. It was the only unscoped write in server/db.ts.
 *
 * The split is now: a request-scoped variant that takes an org id, and an
 * all-orgs sweep reachable only from the CRON_SECRET-gated job endpoint. These
 * tests pin both halves down.
 */
import http from "node:http";
import express from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORG_ID = "22222222-2222-4222-8222-222222222222";
const OTHER_ORG = "33333333-3333-4333-8333-333333333333";

const forOrg = vi.fn(async (_orgId: string) => 1);
const allOrgs = vi.fn(async () => 7);

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return {
    ...actual,
    flagOverdueInvoicesForOrg: (orgId: string) => forOrg(orgId),
    flagOverdueInvoicesAllOrgs: () => allOrgs(),
  };
});

async function request(app: express.Express, path: string) {
  const server = http.createServer(app);
  await new Promise<void>(r => server.listen(0, r));
  const { port } = server.address() as { port: number };
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`);
    return { status: res.status, json: await res.json().catch(() => null) };
  } finally {
    server.close();
  }
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  forOrg.mockClear();
  allOrgs.mockClear();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("dashboard.flagOverdue (request-scoped)", () => {
  async function callAsOrg(organizationId: string) {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({
      user: { id: "user_1", email: "a@b.com", fullName: "A" },
      active: {
        userId: "user_1",
        organizationId,
        organizationName: "Test Org",
        role: "admin" as const,
      },
      req: { protocol: "https", headers: {} } as never,
      res: {} as never,
    });
    return caller.dashboard.flagOverdue();
  }

  it("flags only the caller's organization", async () => {
    await callAsOrg(ORG_ID);
    expect(forOrg).toHaveBeenCalledWith(ORG_ID);
    expect(allOrgs).not.toHaveBeenCalled();
  });

  it("uses each caller's own organization, never a shared one", async () => {
    await callAsOrg(ORG_ID);
    await callAsOrg(OTHER_ORG);
    expect(forOrg.mock.calls.map(c => c[0])).toEqual([ORG_ID, OTHER_ORG]);
  });

  it("never reaches the all-orgs sweep from a user request", async () => {
    await callAsOrg(ORG_ID);
    expect(allOrgs).not.toHaveBeenCalled();
  });
});

describe("GET /api/jobs/flag-overdue (cron-gated)", () => {
  async function appWith(secret?: string) {
    vi.resetModules();
    if (secret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = secret;
    const { createApp } = await import("./_core/app");
    return createApp();
  }

  it("rejects a request with no secret", async () => {
    const { status } = await request(await appWith("s3cret"), "/api/jobs/flag-overdue");
    expect(status).toBe(401);
    expect(allOrgs).not.toHaveBeenCalled();
  });

  it("rejects a wrong secret", async () => {
    const { status } = await request(
      await appWith("s3cret"),
      "/api/jobs/flag-overdue?secret=wrong"
    );
    expect(status).toBe(401);
    expect(allOrgs).not.toHaveBeenCalled();
  });

  it("denies everyone when CRON_SECRET is unset, rather than opening up", async () => {
    // An unset secret must fail closed — otherwise a deploy that forgot to set
    // it would expose a cross-tenant write to the public internet.
    const { status } = await request(await appWith(undefined), "/api/jobs/flag-overdue");
    expect(status).toBe(401);
    expect(allOrgs).not.toHaveBeenCalled();
  });

  it("runs the sweep with the correct secret", async () => {
    const { status, json } = await request(
      await appWith("s3cret"),
      "/api/jobs/flag-overdue?secret=s3cret"
    );
    expect(status).toBe(200);
    expect(json).toEqual({ flagged: 7 });
    expect(allOrgs).toHaveBeenCalledTimes(1);
  });
});
