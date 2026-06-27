import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { Role } from "./db";
import { calculateVat } from "./db";

// ─── Test Helpers ───────────────────────────────────────────────────────────

const USER_ID = "33333333-3333-4333-8333-333333333333";
const ORG_ID = "22222222-2222-4222-8222-222222222222";
const CLIENT_ID = "11111111-1111-4111-8111-111111111111";

function createAuthContext(role: Role = "admin"): TrpcContext {
  return {
    user: { id: USER_ID, email: "test@example.com", fullName: "Test User" },
    active: {
      userId: USER_ID,
      organizationId: ORG_ID,
      organizationName: "Test Org",
      role,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    active: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

// ─── VAT Calculation Tests ──────────────────────────────────────────────────

describe("VAT Calculation", () => {
  it("calculates UK standard 20% VAT correctly", () => {
    const result = calculateVat(100, 20);
    expect(result.subtotal).toBe(100);
    expect(result.vatRate).toBe(20);
    expect(result.vatAmount).toBe(20);
    expect(result.total).toBe(120);
  });

  it("calculates VAT for zero subtotal", () => {
    const result = calculateVat(0, 20);
    expect(result.subtotal).toBe(0);
    expect(result.vatAmount).toBe(0);
    expect(result.total).toBe(0);
  });

  it("handles 0% VAT rate", () => {
    const result = calculateVat(500, 0);
    expect(result.vatAmount).toBe(0);
    expect(result.total).toBe(500);
  });

  it("handles decimal subtotals with precision", () => {
    const result = calculateVat(99.99, 20);
    expect(result.vatAmount).toBe(20);
    expect(result.total).toBe(119.99);
  });

  it("handles large amounts correctly", () => {
    const result = calculateVat(1000000, 20);
    expect(result.vatAmount).toBe(200000);
    expect(result.total).toBe(1200000);
  });

  it("handles reduced VAT rate (5%)", () => {
    const result = calculateVat(200, 5);
    expect(result.vatAmount).toBe(10);
    expect(result.total).toBe(210);
  });

  it("rounds VAT amount to 2 decimal places", () => {
    const result = calculateVat(33.33, 20);
    expect(result.vatAmount).toBe(6.67);
    expect(result.total).toBe(40);
  });

  it("handles single penny amounts", () => {
    const result = calculateVat(0.01, 20);
    expect(result.vatAmount).toBe(0);
    expect(result.total).toBe(0.01);
  });

  it("defaults to 20% VAT rate when not specified", () => {
    const result = calculateVat(100);
    expect(result.vatRate).toBe(20);
    expect(result.vatAmount).toBe(20);
    expect(result.total).toBe(120);
  });

  it("calculates correctly for typical freelance amounts", () => {
    expect(calculateVat(2500, 20).total).toBe(3000);
    expect(calculateVat(750, 20).total).toBe(900);
    expect(calculateVat(45.5, 20).total).toBe(54.6);
  });
});

// ─── Auth Flow Tests ────────────────────────────────────────────────────────

describe("Authentication Flows", () => {
  describe("auth.me", () => {
    it("returns the user + organization when authenticated", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.auth.me();
      expect(result).toBeDefined();
      expect(result?.id).toBe(USER_ID);
      expect(result?.email).toBe("test@example.com");
      expect(result?.organizationId).toBe(ORG_ID);
      expect(result?.role).toBe("admin");
    });

    it("returns null when not authenticated", async () => {
      const caller = appRouter.createCaller(createUnauthContext());
      const result = await caller.auth.me();
      expect(result).toBeNull();
    });
  });

  describe("auth.logout", () => {
    it("returns success", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      expect(await caller.auth.logout()).toEqual({ success: true });
    });
  });
});

// ─── Role-Based Access Control Tests ────────────────────────────────────────

describe("Role-Based Access Control", () => {
  it("exposes the active role", async () => {
    const caller = appRouter.createCaller(createAuthContext("viewer"));
    const me = await caller.auth.me();
    expect(me?.role).toBe("viewer");
  });

  it("protected procedures reject unauthenticated users", async () => {
    const caller = appRouter.createCaller(createUnauthContext());
    await expect(
      caller.clients.list({ limit: 10, offset: 0 })
    ).rejects.toThrow();
  });

  it("protected procedures reject unauthenticated invoice access", async () => {
    const caller = appRouter.createCaller(createUnauthContext());
    await expect(
      caller.invoice.list({ limit: 10, offset: 0, status: "all" })
    ).rejects.toThrow();
  });

  it("protected procedures reject unauthenticated dashboard access", async () => {
    const caller = appRouter.createCaller(createUnauthContext());
    await expect(caller.dashboard.stats()).rejects.toThrow();
  });
});

// ─── Input Validation Tests ─────────────────────────────────────────────────

describe("Input Validation (Zod)", () => {
  const caller = () => appRouter.createCaller(createAuthContext());

  it("rejects client creation with empty name", async () => {
    await expect(
      caller().clients.create({
        name: "",
        email: "test@example.com",
        paymentTerms: 30,
      })
    ).rejects.toThrow();
  });

  it("rejects client creation with invalid email", async () => {
    await expect(
      caller().clients.create({
        name: "Test Client",
        email: "not-an-email",
        paymentTerms: 30,
      })
    ).rejects.toThrow();
  });

  it("rejects invoice creation with no line items", async () => {
    await expect(
      caller().invoice.create({
        clientId: CLIENT_ID,
        issueDate: Date.now(),
        dueDate: Date.now() + 86400000 * 30,
        vatRate: 20,
        lineItems: [],
      })
    ).rejects.toThrow();
  });

  it("rejects a non-uuid client id", async () => {
    await expect(
      caller().invoice.create({
        // @ts-expect-error intentionally invalid id
        clientId: 1,
        issueDate: Date.now(),
        dueDate: Date.now() + 86400000 * 30,
        vatRate: 20,
        lineItems: [{ description: "Test", quantity: 1, unitPrice: 100 }],
      })
    ).rejects.toThrow();
  });

  it("rejects negative payment terms", async () => {
    await expect(
      caller().clients.create({
        name: "Test",
        email: "test@example.com",
        paymentTerms: -1,
      })
    ).rejects.toThrow();
  });

  it("rejects VAT rate above 100", async () => {
    await expect(
      caller().invoice.create({
        clientId: CLIENT_ID,
        issueDate: Date.now(),
        dueDate: Date.now() + 86400000 * 30,
        vatRate: 150,
        lineItems: [{ description: "Test", quantity: 1, unitPrice: 100 }],
      })
    ).rejects.toThrow();
  });

  it("rejects invalid invoice status", async () => {
    await expect(
      caller().invoice.updateStatus({
        id: CLIENT_ID,
        status: "invalid" as never,
      })
    ).rejects.toThrow();
  });

  it("accepts valid client data (fails later at the DB, not validation)", async () => {
    try {
      await caller().clients.create({
        name: "Valid Client",
        email: "valid@example.com",
        company: "Acme Ltd",
        paymentTerms: 30,
      });
    } catch (err) {
      expect((err as { code?: string }).code).not.toBe("BAD_REQUEST");
    }
  });

  it("accepts valid invoice data (fails later at the DB, not validation)", async () => {
    try {
      await caller().invoice.create({
        clientId: CLIENT_ID,
        issueDate: Date.now(),
        dueDate: Date.now() + 86400000 * 30,
        vatRate: 20,
        lineItems: [
          { description: "Web Development", quantity: 40, unitPrice: 75 },
          { description: "Design Work", quantity: 10, unitPrice: 100 },
        ],
      });
    } catch (err) {
      expect((err as { code?: string }).code).not.toBe("BAD_REQUEST");
    }
  });
});

// ─── Line Item Calculation Tests ────────────────────────────────────────────

describe("Line Item Calculations", () => {
  it("calculates single item amount correctly", () => {
    expect(Number((10 * 75).toFixed(2))).toBe(750);
  });

  it("calculates fractional quantity correctly", () => {
    expect(Number((2.5 * 100).toFixed(2))).toBe(250);
  });

  it("calculates subtotal from multiple items", () => {
    const items = [
      { quantity: 40, unitPrice: 75 },
      { quantity: 10, unitPrice: 100 },
      { quantity: 5, unitPrice: 50 },
    ];
    const subtotal = items.reduce(
      (sum, i) => sum + Number((i.quantity * i.unitPrice).toFixed(2)),
      0
    );
    expect(subtotal).toBe(4250);
    const { vatAmount, total } = calculateVat(subtotal, 20);
    expect(vatAmount).toBe(850);
    expect(total).toBe(5100);
  });

  it("handles zero quantity", () => {
    expect(Number((0 * 100).toFixed(2))).toBe(0);
  });

  it("handles decimal precision in multi-item invoice", () => {
    const items = [
      { quantity: 1.5, unitPrice: 33.33 },
      { quantity: 3, unitPrice: 16.67 },
    ];
    const subtotal = items.reduce(
      (sum, i) => sum + Number((i.quantity * i.unitPrice).toFixed(2)),
      0
    );
    expect(subtotal).toBe(100);
  });
});
