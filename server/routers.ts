import { COOKIE_NAME } from "@shared/const";
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
} from "@shared/validation";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

// ─── Client Router ──────────────────────────────────────────────────────────

const clientRouter = router({
  list: protectedProcedure.input(listQuerySchema).query(async ({ ctx, input }) => {
    const [items, total] = await Promise.all([
      db.getClients(ctx.user.id, input),
      db.getClientCount(ctx.user.id, input.search),
    ]);
    return { items, total, limit: input.limit, offset: input.offset };
  }),

  getById: protectedProcedure.input(clientIdSchema).query(async ({ ctx, input }) => {
    const client = await db.getClientById(input.id, ctx.user.id);
    if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
    return client;
  }),

  create: protectedProcedure.input(createClientSchema).mutation(async ({ ctx, input }) => {
    return db.createClient({ ...input, userId: ctx.user.id });
  }),

  update: protectedProcedure
    .input(clientIdSchema.merge(updateClientSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const existing = await db.getClientById(id, ctx.user.id);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      return db.updateClient(id, ctx.user.id, data);
    }),

  delete: protectedProcedure.input(clientIdSchema).mutation(async ({ ctx, input }) => {
    const existing = await db.getClientById(input.id, ctx.user.id);
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
    try {
      return await db.deleteClient(input.id, ctx.user.id);
    } catch (err: any) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: err.message || "Cannot delete client",
      });
    }
  }),
});

// ─── Invoice Router ─────────────────────────────────────────────────────────

const invoiceRouter = router({
  list: protectedProcedure.input(invoiceListQuerySchema).query(async ({ ctx, input }) => {
    const [items, total] = await Promise.all([
      db.getInvoices(ctx.user.id, input),
      db.getInvoiceCount(ctx.user.id, input.status, input.clientId),
    ]);
    return { items, total, limit: input.limit, offset: input.offset };
  }),

  getById: protectedProcedure.input(invoiceIdSchema).query(async ({ ctx, input }) => {
    const invoice = await db.getInvoiceById(input.id, ctx.user.id);
    if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
    return invoice;
  }),

  create: protectedProcedure.input(createInvoiceSchema).mutation(async ({ ctx, input }) => {
    // Verify client belongs to user
    const client = await db.getClientById(input.clientId, ctx.user.id);
    if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });

    const invoiceNumber = await db.generateInvoiceNumber(ctx.user.id);

    const { lineItems: items, ...invoiceData } = input;

    return db.createInvoice(
      {
        ...invoiceData,
        userId: ctx.user.id,
        invoiceNumber,
        issueDate: new Date(input.issueDate),
        dueDate: new Date(input.dueDate),
        vatRate: String(input.vatRate),
        status: "draft",
      },
      items.map((item, idx) => ({
        description: item.description,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        amount: String(Number((item.quantity * item.unitPrice).toFixed(2))),
        sortOrder: item.sortOrder ?? idx,
      }))
    );
  }),

  update: protectedProcedure
    .input(invoiceIdSchema.merge(updateInvoiceSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, lineItems: items, ...data } = input;

      const existing = await db.getInvoiceById(id, ctx.user.id);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });

      if (existing.status === "paid") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Cannot edit a paid invoice" });
      }

      if (data.clientId) {
        const client = await db.getClientById(data.clientId, ctx.user.id);
        if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      }

      const updateData: any = { ...data };
      if (data.issueDate) updateData.issueDate = new Date(data.issueDate);
      if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
      if (data.vatRate !== undefined) updateData.vatRate = String(data.vatRate);
      delete updateData.status; // Status changes go through updateStatus

      const processedItems = items?.map((item, idx) => ({
        description: item.description,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        amount: String(Number((item.quantity * item.unitPrice).toFixed(2))),
        sortOrder: item.sortOrder ?? idx,
      }));

      return db.updateInvoice(id, ctx.user.id, updateData, processedItems);
    }),

  updateStatus: protectedProcedure
    .input(invoiceStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await db.getInvoiceById(input.id, ctx.user.id);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      return db.updateInvoiceStatus(input.id, ctx.user.id, input.status);
    }),

  delete: protectedProcedure.input(invoiceIdSchema).mutation(async ({ ctx, input }) => {
    const existing = await db.getInvoiceById(input.id, ctx.user.id);
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
    if (existing.status === "paid") {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Cannot delete a paid invoice" });
    }
    return db.deleteInvoice(input.id, ctx.user.id);
  }),

  generatePdf: protectedProcedure.input(invoiceIdSchema).mutation(async ({ ctx, input }) => {
    const invoice = await db.getInvoiceById(input.id, ctx.user.id);
    if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });

    try {
      const { generateInvoicePdf } = await import("./pdfGenerator");
      const { pdfUrl, pdfKey } = await generateInvoicePdf(invoice);
      await db.updateInvoicePdf(input.id, ctx.user.id, pdfUrl, pdfKey);
      return { pdfUrl, pdfKey };
    } catch (err: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `PDF generation failed: ${err.message}`,
      });
    }
  }),

  sendEmail: protectedProcedure.input(sendInvoiceEmailSchema).mutation(async ({ ctx, input }) => {
    const invoice = await db.getInvoiceById(input.id, ctx.user.id);
    if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });

    const recipientEmail = input.to || invoice.clientEmail;
    if (!recipientEmail) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No recipient email address" });
    }

    try {
      // Generate PDF if not already generated
      let pdfUrl = invoice.pdfUrl;
      if (!pdfUrl) {
        const { generateInvoicePdf } = await import("./pdfGenerator");
        const result = await generateInvoicePdf(invoice);
        pdfUrl = result.pdfUrl;
        await db.updateInvoicePdf(input.id, ctx.user.id, result.pdfUrl, result.pdfKey);
      }

      const { sendInvoiceEmail } = await import("./emailService");
      await sendInvoiceEmail({
        to: recipientEmail,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName || "Client",
        total: invoice.total,
        dueDate: invoice.dueDate,
        pdfUrl: pdfUrl!,
        message: input.message,
      });

      // Update status to sent if currently draft
      if (invoice.status === "draft") {
        await db.updateInvoiceStatus(input.id, ctx.user.id, "sent");
      }

      return { success: true, sentTo: recipientEmail };
    } catch (err: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Email sending failed: ${err.message}`,
      });
    }
  }),
});

// ─── Dashboard Router ───────────────────────────────────────────────────────

const dashboardRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => {
    return db.getDashboardStats(ctx.user.id);
  }),

  recentInvoices: protectedProcedure.query(async ({ ctx }) => {
    return db.getInvoices(ctx.user.id, { limit: 5 });
  }),

  flagOverdue: protectedProcedure.mutation(async () => {
    const count = await db.flagOverdueInvoices();
    return { flagged: count };
  }),
});

// ─── App Router ─────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  clients: clientRouter,
  invoice: invoiceRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
