/**
 * MCP tool definitions. Each tool has a Zod input shape (mirroring the shapes
 * in the app's shared/validation.ts) and a handler that calls the REST client
 * and returns concise structured data. index.ts registers these on the server.
 */
import { z, type ZodRawShape } from "zod";
import type { InvoiceFlowClient } from "./client.js";

export interface ToolDef {
  name: string;
  description: string;
  shape: ZodRawShape;
  handler: (
    client: InvoiceFlowClient,
    args: Record<string, unknown>
  ) => Promise<unknown>;
}

const clientFields = {
  name: z.string().min(1).max(255),
  email: z.string().email().max(320),
  company: z.string().max(255).nullish(),
  addressLine1: z.string().max(255).nullish(),
  addressLine2: z.string().max(255).nullish(),
  city: z.string().max(100).nullish(),
  postcode: z.string().max(20).nullish(),
  country: z.string().max(100).nullish(),
  phone: z.string().max(50).nullish(),
  paymentTerms: z.number().int().min(1).max(365).optional(),
  notes: z.string().nullish(),
};

const lineItem = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().positive(),
  unit_price: z.number().min(0),
});

const invoiceStatus = z.enum(["draft", "sent", "paid", "overdue"]);

export const tools: ToolDef[] = [
  // ── Clients ──
  {
    name: "list_clients",
    description: "List clients for the organization, with optional search and pagination.",
    shape: {
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      search: z.string().optional(),
    },
    handler: (c, a) => c.listClients(a),
  },
  {
    name: "get_client",
    description: "Retrieve a single client by id.",
    shape: { id: z.string().uuid() },
    handler: (c, a) => c.getClient(a.id as string),
  },
  {
    name: "create_client",
    description: "Create a new client.",
    shape: clientFields,
    handler: (c, a) => c.createClient(a),
  },
  {
    name: "update_client",
    description: "Update fields on an existing client.",
    shape: {
      id: z.string().uuid(),
      name: z.string().min(1).max(255).optional(),
      email: z.string().email().max(320).optional(),
      company: z.string().max(255).nullish(),
      addressLine1: z.string().max(255).nullish(),
      addressLine2: z.string().max(255).nullish(),
      city: z.string().max(100).nullish(),
      postcode: z.string().max(20).nullish(),
      country: z.string().max(100).nullish(),
      phone: z.string().max(50).nullish(),
      paymentTerms: z.number().int().min(1).max(365).optional(),
      notes: z.string().nullish(),
    },
    handler: (c, a) => {
      const { id, ...body } = a;
      return c.updateClient(id as string, body);
    },
  },
  {
    name: "delete_client",
    description: "Delete a client (fails if it still has invoices).",
    shape: { id: z.string().uuid() },
    handler: (c, a) => c.deleteClient(a.id as string),
  },

  // ── Invoices ──
  {
    name: "list_invoices",
    description: "List invoices, optionally filtered by status or client_id.",
    shape: {
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      status: z.enum(["all", "draft", "sent", "paid", "overdue"]).optional(),
      client_id: z.string().uuid().optional(),
    },
    handler: (c, a) => c.listInvoices(a),
  },
  {
    name: "get_invoice",
    description: "Retrieve a single invoice (with line items and totals).",
    shape: { id: z.string().uuid() },
    handler: (c, a) => c.getInvoice(a.id as string),
  },
  {
    name: "create_invoice",
    description:
      "Create an invoice. Totals, VAT and the invoice number are computed server-side.",
    shape: {
      client_id: z.string().uuid(),
      issue_date: z.string().describe("ISO date, e.g. 2026-07-01").optional(),
      due_date: z.string().describe("ISO date, e.g. 2026-07-31").optional(),
      tax_rate: z.number().min(0).max(100).optional(),
      notes: z.string().nullish(),
      line_items: z.array(lineItem).min(1),
    },
    handler: (c, a) => c.createInvoice(a),
  },
  {
    name: "update_invoice",
    description: "Update a draft invoice (client, dates, tax rate, notes, line items).",
    shape: {
      id: z.string().uuid(),
      client_id: z.string().uuid().optional(),
      issue_date: z.string().optional(),
      due_date: z.string().optional(),
      tax_rate: z.number().min(0).max(100).optional(),
      notes: z.string().nullish(),
      line_items: z.array(lineItem).min(1).optional(),
    },
    handler: (c, a) => {
      const { id, ...body } = a;
      return c.updateInvoice(id as string, body);
    },
  },
  {
    name: "update_invoice_status",
    description: "Set an invoice's status (draft, sent, paid, overdue).",
    shape: { id: z.string().uuid(), status: invoiceStatus },
    handler: (c, a) => c.updateInvoice(a.id as string, { status: a.status }),
  },
  {
    name: "delete_invoice",
    description: "Delete a draft invoice (paid invoices cannot be deleted).",
    shape: { id: z.string().uuid() },
    handler: (c, a) => c.deleteInvoice(a.id as string),
  },
  {
    name: "send_invoice_email",
    description: "Email the invoice to the client (optionally override recipient/message).",
    shape: {
      id: z.string().uuid(),
      to: z.string().email().optional(),
      message: z.string().optional(),
    },
    handler: (c, a) =>
      c.sendInvoice(a.id as string, {
        to: a.to as string | undefined,
        message: a.message as string | undefined,
      }),
  },
  {
    name: "generate_invoice_pdf",
    description: "Generate (and store) the PDF for an invoice; returns its path.",
    shape: { id: z.string().uuid() },
    handler: (c, a) => c.generateInvoicePdf(a.id as string),
  },

  // ── Dashboard ──
  {
    name: "get_dashboard_stats",
    description:
      "Revenue, outstanding balance, overdue/paid counts and totals for the organization.",
    shape: {},
    handler: c => c.getDashboardStats(),
  },
];
