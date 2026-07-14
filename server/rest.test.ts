import { describe, expect, it } from "vitest";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import http from "node:http";
import { TRPCError } from "@trpc/server";
import { createRestApi, toCreateInvoice, pagination } from "./rest";
import { bearerToken } from "./rest/auth";
import { handleError } from "./rest/errors";
import { resolveApiKeyContext } from "./db";

// ─── Pure helpers ────────────────────────────────────────────────────────────

describe("REST helpers", () => {
  it("parses a bearer token", () => {
    expect(
      bearerToken({ headers: { authorization: "Bearer ifk_live_abc" } } as Request)
    ).toBe("ifk_live_abc");
    expect(bearerToken({ headers: {} } as Request)).toBeNull();
    expect(
      bearerToken({ headers: { authorization: "Basic xyz" } } as Request)
    ).toBeNull();
  });

  it("computes pagination offset from page/limit", () => {
    expect(pagination({ page: "3", limit: "10" })).toEqual({
      page: 3,
      limit: 10,
      offset: 20,
    });
    expect(pagination({})).toEqual({ page: 1, limit: 25, offset: 0 });
    // clamps limit to 100
    expect(pagination({ limit: "999" }).limit).toBe(100);
  });

  it("maps a snake_case invoice body to the tRPC shape", () => {
    const mapped = toCreateInvoice({
      client_id: "c1",
      due_date: "2026-07-23",
      tax_rate: 20,
      line_items: [{ description: "Design", quantity: 2, unit_price: "100" }],
    });
    expect(mapped.clientId).toBe("c1");
    expect(mapped.vatRate).toBe(20);
    expect(mapped.lineItems[0]).toEqual({
      description: "Design",
      quantity: 2,
      unitPrice: 100,
    });
    expect(typeof mapped.dueDate).toBe("number");
  });
});

// ─── Error mapping ───────────────────────────────────────────────────────────

function fakeRes() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

describe("REST error mapping", () => {
  const cases: [string, number, string][] = [
    ["NOT_FOUND", 404, "not_found"],
    ["BAD_REQUEST", 400, "validation_error"],
    ["UNAUTHORIZED", 401, "unauthorized"],
    ["FORBIDDEN", 403, "forbidden"],
    ["PRECONDITION_FAILED", 409, "conflict"],
    ["INTERNAL_SERVER_ERROR", 500, "internal_error"],
  ];
  for (const [trpcCode, status, restCode] of cases) {
    it(`${trpcCode} -> ${status} ${restCode}`, () => {
      const res = fakeRes();
      handleError(res as unknown as Response, new TRPCError({ code: trpcCode as never }));
      expect(res.statusCode).toBe(status);
      expect((res.body as { error: { code: string } }).error.code).toBe(restCode);
    });
  }

  it("maps unknown errors to 500 internal_error", () => {
    const res = fakeRes();
    handleError(res as unknown as Response, new Error("boom"));
    expect(res.statusCode).toBe(500);
    expect((res.body as { error: { code: string } }).error.code).toBe(
      "internal_error"
    );
  });
});

// ─── API-key resolution guard (no DB needed) ─────────────────────────────────

describe("resolveApiKeyContext", () => {
  it("rejects a non-ifk token without touching the database", async () => {
    expect(await resolveApiKeyContext("not-a-key")).toBeNull();
  });
});

// ─── HTTP integration ────────────────────────────────────────────────────────

const FAKE_CTX = {
  user: { id: "u1", email: null, fullName: "API key" },
  active: {
    userId: "u1",
    organizationId: "22222222-2222-4222-8222-222222222222",
    organizationName: "Test Org",
    role: "owner" as const,
  },
};

/** Auth middleware that injects a fake key context (bypasses the DB lookup). */
const fakeAuth = (req: Request, _res: Response, next: NextFunction) => {
  (req as Request & { apiCtx: typeof FAKE_CTX }).apiCtx = FAKE_CTX;
  next();
};

function appWith(auth?: Parameters<typeof createRestApi>[0]) {
  const app = express();
  app.use(express.json());
  app.use("/api/v1", auth ? createRestApi(auth) : createRestApi());
  return app;
}

async function request(
  app: express.Express,
  method: string,
  path: string,
  body?: unknown
) {
  const server = http.createServer(app);
  await new Promise<void>(r => server.listen(0, r));
  const { port } = server.address() as { port: number };
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: body ? { "content-type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, json };
  } finally {
    server.close();
  }
}

describe("REST API — public", () => {
  it("serves the OpenAPI document without a key", async () => {
    const { status, json } = await request(appWith(), "GET", "/api/v1/openapi.json");
    expect(status).toBe(200);
    expect((json as { openapi: string }).openapi).toBe("3.0.3");
  });
});

describe("REST API — auth gating (default key auth)", () => {
  it("rejects unauthenticated requests with 401", async () => {
    for (const [m, p] of [
      ["GET", "/api/v1/clients"],
      ["POST", "/api/v1/clients"],
      ["GET", "/api/v1/invoices"],
      ["GET", "/api/v1/dashboard/stats"],
    ] as const) {
      const { status, json } = await request(
        appWith(),
        m,
        p,
        m === "POST" ? {} : undefined
      );
      expect(status).toBe(401);
      expect((json as { error: { code: string } }).error.code).toBe("unauthorized");
    }
  });
});

describe("REST API — clients & invoices (injected key context)", () => {
  const app = appWith(fakeAuth);

  it("returns the org for /me", async () => {
    const { status, json } = await request(app, "GET", "/api/v1/me");
    expect(status).toBe(200);
    expect((json as { organization: { name: string } }).organization.name).toBe(
      "Test Org"
    );
  });

  it("400s on invalid client input (validation, before the DB)", async () => {
    const { status, json } = await request(app, "POST", "/api/v1/clients", {
      name: "",
      email: "not-an-email",
    });
    expect(status).toBe(400);
    expect((json as { error: { code: string } }).error.code).toBe("validation_error");
  });

  it("400s on an invoice with no line items", async () => {
    const { status, json } = await request(app, "POST", "/api/v1/invoices", {
      client_id: "11111111-1111-4111-8111-111111111111",
      line_items: [],
    });
    expect(status).toBe(400);
    expect((json as { error: { code: string } }).error.code).toBe("validation_error");
  });

  it("valid input passes validation and only then fails at the DB (500)", async () => {
    const { status, json } = await request(app, "POST", "/api/v1/clients", {
      name: "Acme Ltd",
      email: "billing@acme.test",
      paymentTerms: 30,
    });
    // No database in tests — so a *valid* request reaches the data layer and
    // fails there, proving it passed auth + validation + routing.
    expect(status).toBe(500);
    expect((json as { error: { code: string } }).error.code).toBe("internal_error");
  });

  it("routes GET /clients through to the data layer", async () => {
    const { status } = await request(app, "GET", "/api/v1/clients");
    expect(status).toBe(500); // reached db.getClients (no connection in tests)
  });
});
