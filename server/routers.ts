import {
  createClientSchema,
  updateClientSchema,
  clientIdSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  invoiceIdSchema,
  invoiceStatusSchema,
  listQuerySchema,
  invoiceListQuerySchema,
  sendInvoiceEmailSchema,
  createOrganizationSchema,
} from "@shared/validation";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

/** Convert a UTC millisecond timestamp to a Postgres `YYYY-MM-DD` date. */
const toDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);

// ─── Client Router ──────────────────────────────────────────────────────────

const clientRouter = router({
  list: protectedProcedure
    .input(listQuerySchema)
    .query(async ({ ctx, input }) => {
      const org = ctx.active.organizationId;
      const [items, total] = await Promise.all([
        db.getClients(org, input),
        db.getClientCount(org, input.search),
      ]);
      return { items, total, limit: input.limit, offset: input.offset };
    }),

  getById: protectedProcedure
    .input(clientIdSchema)
    .query(async ({ ctx, input }) => {
      const client = await db.getClientById(
        input.id,
        ctx.active.organizationId
      );
      if (!client)
        throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      return client;
    }),

  create: protectedProcedure
    .input(createClientSchema)
    .mutation(async ({ ctx, input }) => {
      return db.createClient(ctx.active.organizationId, input);
    }),

  update: protectedProcedure
    .input(clientIdSchema.merge(updateClientSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const org = ctx.active.organizationId;
      const existing = await db.getClientById(id, org);
      if (!existing)
        throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      return db.updateClient(id, org, data);
    }),

  delete: protectedProcedure
    .input(clientIdSchema)
    .mutation(async ({ ctx, input }) => {
      const org = ctx.active.organizationId;
      const existing = await db.getClientById(input.id, org);
      if (!existing)
        throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      try {
        return await db.deleteClient(input.id, org);
      } catch (err) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: err instanceof Error ? err.message : "Cannot delete client",
        });
      }
    }),
});

// ─── Invoice Router ─────────────────────────────────────────────────────────

const invoiceRouter = router({
  list: protectedProcedure
    .input(invoiceListQuerySchema)
    .query(async ({ ctx, input }) => {
      const org = ctx.active.organizationId;
      const [items, total] = await Promise.all([
        db.getInvoices(org, input),
        db.getInvoiceCount(org, input.status, input.clientId),
      ]);
      return { items, total, limit: input.limit, offset: input.offset };
    }),

  getById: protectedProcedure
    .input(invoiceIdSchema)
    .query(async ({ ctx, input }) => {
      const invoice = await db.getInvoiceById(
        input.id,
        ctx.active.organizationId
      );
      if (!invoice)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      return invoice;
    }),

  create: protectedProcedure
    .input(createInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      const org = ctx.active.organizationId;
      const client = await db.getClientById(input.clientId, org);
      if (!client)
        throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });

      const { lineItems: items, ...inv } = input;
      return db.createInvoice(
        org,
        {
          clientId: inv.clientId,
          issueDate: toDate(inv.issueDate),
          dueDate: toDate(inv.dueDate),
          vatRate: inv.vatRate,
          notes: inv.notes ?? null,
        },
        items
      );
    }),

  update: protectedProcedure
    .input(invoiceIdSchema.merge(updateInvoiceSchema))
    .mutation(async ({ ctx, input }) => {
      const org = ctx.active.organizationId;
      const { id, lineItems: items, status: _status, ...data } = input;

      const existing = await db.getInvoiceById(id, org);
      if (!existing)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      if (existing.status === "paid") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot edit a paid invoice",
        });
      }
      if (data.clientId) {
        const client = await db.getClientById(data.clientId, org);
        if (!client)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Client not found",
          });
      }

      return db.updateInvoice(
        id,
        org,
        {
          clientId: data.clientId,
          issueDate: data.issueDate ? toDate(data.issueDate) : undefined,
          dueDate: data.dueDate ? toDate(data.dueDate) : undefined,
          vatRate: data.vatRate,
          notes: data.notes ?? undefined,
        },
        items
      );
    }),

  updateStatus: protectedProcedure
    .input(invoiceStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const org = ctx.active.organizationId;
      const existing = await db.getInvoiceById(input.id, org);
      if (!existing)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      return db.updateInvoiceStatus(input.id, org, input.status);
    }),

  delete: protectedProcedure
    .input(invoiceIdSchema)
    .mutation(async ({ ctx, input }) => {
      const org = ctx.active.organizationId;
      const existing = await db.getInvoiceById(input.id, org);
      if (!existing)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      if (existing.status === "paid") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot delete a paid invoice",
        });
      }
      return db.deleteInvoice(input.id, org);
    }),

  generatePdf: protectedProcedure
    .input(invoiceIdSchema)
    .mutation(async ({ ctx, input }) => {
      const org = ctx.active.organizationId;
      const invoice = await db.getInvoiceById(input.id, org);
      if (!invoice)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      try {
        const { generateInvoicePdf } = await import("./pdfGenerator");
        const { pdfPath } = await generateInvoicePdf(invoice);
        await db.updateInvoicePdf(input.id, org, pdfPath);
        return { pdfPath };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `PDF generation failed: ${err instanceof Error ? err.message : "unknown"}`,
        });
      }
    }),

  sendEmail: protectedProcedure
    .input(sendInvoiceEmailSchema)
    .mutation(async ({ ctx, input }) => {
      const org = ctx.active.organizationId;
      const invoice = await db.getInvoiceById(input.id, org);
      if (!invoice)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });

      const recipientEmail = input.to || invoice.clientEmail;
      if (!recipientEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No recipient email address",
        });
      }

      try {
        let pdfPath = invoice.pdfPath;
        if (!pdfPath) {
          const { generateInvoicePdf } = await import("./pdfGenerator");
          const result = await generateInvoicePdf(invoice);
          pdfPath = result.pdfPath;
          await db.updateInvoicePdf(input.id, org, result.pdfPath);
        }

        const { sendInvoiceEmail } = await import("./emailService");
        await sendInvoiceEmail({
          to: recipientEmail,
          invoiceNumber: invoice.number,
          clientName: invoice.clientName || "Client",
          total: invoice.total,
          dueDate: invoice.dueDate,
          pdfUrl: pdfPath ?? "",
          message: input.message,
        });

        if (invoice.status === "draft") {
          await db.updateInvoiceStatus(input.id, org, "sent");
        }
        return { success: true, sentTo: recipientEmail };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Email sending failed: ${err instanceof Error ? err.message : "unknown"}`,
        });
      }
    }),
});

// ─── Dashboard Router ───────────────────────────────────────────────────────

const dashboardRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => {
    return db.getDashboardStats(ctx.active.organizationId);
  }),
  recentInvoices: protectedProcedure.query(async ({ ctx }) => {
    return db.getInvoices(ctx.active.organizationId, { limit: 5 });
  }),
  flagOverdue: protectedProcedure.mutation(async () => {
    const count = await db.flagOverdueInvoices();
    return { flagged: count };
  }),
});

// ─── Organization Router ──────────────────────────────────────────────────────

const orgRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getMemberships(ctx.user.id);
  }),
  create: protectedProcedure
    .input(createOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      return db.createOrganization(input.name, ctx.user.id);
    }),
});

// ─── App Router ─────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => {
      if (!ctx.user || !ctx.active) return null;
      return {
        id: ctx.user.id,
        email: ctx.user.email,
        name: ctx.user.fullName,
        organizationId: ctx.active.organizationId,
        organizationName: ctx.active.organizationName,
        role: ctx.active.role,
      };
    }),
    // Sign-out is handled client-side via the Supabase SDK; this is a no-op
    // kept for API compatibility.
    logout: publicProcedure.mutation(() => {
      return { success: true } as const;
    }),
  }),
  organization: orgRouter,
  clients: clientRouter,
  invoice: invoiceRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
