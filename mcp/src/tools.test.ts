import { describe, expect, it, vi } from "vitest";
import { tools } from "./tools.js";
import type { HermiteFlowClient } from "./client.js";

function findTool(name: string) {
  const t = tools.find(t => t.name === name);
  if (!t) throw new Error(`tool ${name} not found`);
  return t;
}

/** A fake client whose methods echo back what they were called with. */
function fakeClient() {
  return {
    listClients: vi.fn(async q => ({ data: [], page: 1, called: q })),
    getClient: vi.fn(async (id: string) => ({ id })),
    createClient: vi.fn(async b => ({ id: "c_new", ...(b as object) })),
    updateClient: vi.fn(async (id: string, b) => ({ id, ...(b as object) })),
    deleteClient: vi.fn(async () => ({ deleted: true })),
    listInvoices: vi.fn(async q => ({ data: [], called: q })),
    getInvoice: vi.fn(async (id: string) => ({ id })),
    createInvoice: vi.fn(async b => ({ id: "in_new", ...(b as object) })),
    updateInvoice: vi.fn(async (id: string, b) => ({ id, ...(b as object) })),
    deleteInvoice: vi.fn(async () => ({ deleted: true })),
    sendInvoice: vi.fn(async (id: string, b) => ({ id, ...(b as object) })),
    generateInvoicePdf: vi.fn(async (id: string) => ({ pdfPath: `/pdf/${id}` })),
    getDashboardStats: vi.fn(async () => ({ totalRevenue: 42 })),
  };
}

describe("tool catalogue", () => {
  it("exposes exactly the expected tools", () => {
    expect(tools.map(t => t.name).sort()).toEqual(
      [
        "create_client",
        "create_invoice",
        "delete_client",
        "delete_invoice",
        "generate_invoice_pdf",
        "get_client",
        "get_dashboard_stats",
        "get_invoice",
        "list_clients",
        "list_invoices",
        "send_invoice_email",
        "update_client",
        "update_invoice",
        "update_invoice_status",
        "list_bookings",
        "get_booking",
        "create_booking",
        "update_booking_status",
        "convert_booking_to_invoice",
        "get_booking_stats",
      ].sort()
    );
  });

  it("every tool has a description and an input shape", () => {
    for (const t of tools) {
      expect(t.description.length).toBeGreaterThan(0);
      expect(typeof t.shape).toBe("object");
    }
  });
});

describe("tool handlers", () => {
  it("get_client passes the id through", async () => {
    const c = fakeClient();
    const out = await findTool("get_client").handler(
      c as unknown as HermiteFlowClient,
      { id: "abc" }
    );
    expect(c.getClient).toHaveBeenCalledWith("abc");
    expect(out).toEqual({ id: "abc" });
  });

  it("create_client forwards the body", async () => {
    const c = fakeClient();
    const body = { name: "Acme", email: "a@acme.test" };
    await findTool("create_client").handler(
      c as unknown as HermiteFlowClient,
      body
    );
    expect(c.createClient).toHaveBeenCalledWith(body);
  });

  it("update_client splits id from the body", async () => {
    const c = fakeClient();
    await findTool("update_client").handler(c as unknown as HermiteFlowClient, {
      id: "c1",
      name: "New",
    });
    expect(c.updateClient).toHaveBeenCalledWith("c1", { name: "New" });
  });

  it("update_invoice_status maps to updateInvoice({status})", async () => {
    const c = fakeClient();
    await findTool("update_invoice_status").handler(
      c as unknown as HermiteFlowClient,
      { id: "in1", status: "paid" }
    );
    expect(c.updateInvoice).toHaveBeenCalledWith("in1", { status: "paid" });
  });

  it("send_invoice_email passes recipient and message", async () => {
    const c = fakeClient();
    await findTool("send_invoice_email").handler(
      c as unknown as HermiteFlowClient,
      { id: "in1", to: "x@y.z", message: "hi" }
    );
    expect(c.sendInvoice).toHaveBeenCalledWith("in1", {
      to: "x@y.z",
      message: "hi",
    });
  });

  it("get_dashboard_stats needs no args", async () => {
    const c = fakeClient();
    const out = await findTool("get_dashboard_stats").handler(
      c as unknown as HermiteFlowClient,
      {}
    );
    expect(c.getDashboardStats).toHaveBeenCalled();
    expect(out).toEqual({ totalRevenue: 42 });
  });
});
