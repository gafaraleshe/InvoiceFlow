import { z } from "zod";

// ─── Client Schemas ─────────────────────────────────────────────────────────

export const createClientSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address").max(320),
  company: z.string().max(255).optional().nullable(),
  addressLine1: z.string().max(255).optional().nullable(),
  addressLine2: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  postcode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  paymentTerms: z.number().int().min(1).max(365).default(30),
  notes: z.string().optional().nullable(),
});

export const updateClientSchema = createClientSchema.partial();

export const clientIdSchema = z.object({
  id: z.string().uuid(),
});

// ─── Line Item Schemas ──────────────────────────────────────────────────────

export const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required").max(500),
  quantity: z.number().positive("Quantity must be positive"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  sortOrder: z.number().int().min(0).optional(),
});

// ─── Invoice Schemas ────────────────────────────────────────────────────────

export const createInvoiceSchema = z.object({
  clientId: z.string().uuid("Client is required"),
  issueDate: z.number().int().positive("Issue date is required"), // UTC timestamp ms
  dueDate: z.number().int().positive("Due date is required"), // UTC timestamp ms
  vatRate: z.number().min(0).max(100).default(20),
  notes: z.string().optional().nullable(),
  lineItems: z
    .array(lineItemSchema)
    .min(1, "At least one line item is required"),
});

export const updateInvoiceSchema = z.object({
  clientId: z.string().uuid().optional(),
  issueDate: z.number().int().positive().optional(),
  dueDate: z.number().int().positive().optional(),
  vatRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(["draft", "sent", "paid", "overdue"]).optional(),
  lineItems: z.array(lineItemSchema).min(1).optional(),
});

export const invoiceIdSchema = z.object({
  id: z.string().uuid(),
});

export const invoiceStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "sent", "paid", "overdue"]),
});

// ─── List/Filter Schemas ────────────────────────────────────────────────────

export const listQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export const invoiceListQuerySchema = listQuerySchema.extend({
  status: z.enum(["all", "draft", "sent", "paid", "overdue"]).default("all"),
  clientId: z.string().uuid().optional(),
});

// ─── Email Schema ───────────────────────────────────────────────────────────

export const sendInvoiceEmailSchema = z.object({
  id: z.string().uuid(),
  to: z.string().email().optional(), // Override client email
  message: z.string().optional(),
});

// ─── Organization Schemas ────────────────────────────────────────────────────

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
});

export const switchOrganizationSchema = z.object({
  organizationId: z.string().uuid(),
});
