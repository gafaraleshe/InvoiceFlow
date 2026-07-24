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
  createApiKeySchema,
  apiKeyIdSchema,
  createBookingSchema,
  updateBookingStatusSchema,
  bookingIdSchema,
  bookingListQuerySchema,
  convertBookingSchema,
} from "@shared/validation";
import { systemRouter } from "./_core/systemRouter";
import {
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  router,
} from "./_core/trpc";
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

// ─── API Keys Router ──────────────────────────────────────────────────────────
// Managed via the web session (owner/admin), NOT via an API key — this is the
// chicken-and-egg path that mints the keys the public REST API accepts.

const apiKeysRouter = router({
  list: adminProcedure.query(async ({ ctx }) => {
    return db.listApiKeys(ctx.active.organizationId);
  }),
  create: adminProcedure
    .input(createApiKeySchema)
    .mutation(async ({ ctx, input }) => {
      // Returns the plaintext key exactly once — the client must store it.
      return db.createApiKey(ctx.active.organizationId, input.name, {
        test: input.test,
        scopes: input.scopes,
      });
    }),
  revoke: adminProcedure
    .input(apiKeyIdSchema)
    .mutation(async ({ ctx, input }) => {
      const row = await db.revokeApiKey(ctx.active.organizationId, input.id);
      if (!row)
        throw new TRPCError({ code: "NOT_FOUND", message: "API key not found" });
      return { success: true } as const;
    }),
});

// ─── Booking Router (CRM) ─────────────────────────────────────────────────────
// Bookings are enquiries captured from a booking site (e.g. SHOTBYGAFAR) or
// entered by hand. They can be auto-converted into invoices and emailed.

/** Generate + email an invoice (mirrors invoice.sendEmail, reusable here). */
async function emailInvoice(
  invoiceId: string,
  orgId: string,
  message?: string
): Promise<{ sentTo: string | null }> {
  const invoice = await db.getInvoiceById(invoiceId, orgId);
  if (!invoice) throw new Error("Invoice not found");
  const recipient = invoice.clientEmail;
  if (!recipient) return { sentTo: null };

  let pdfPath = invoice.pdfPath;
  if (!pdfPath) {
    const { generateInvoicePdf } = await import("./pdfGenerator");
    const result = await generateInvoicePdf(invoice);
    pdfPath = result.pdfPath;
    await db.updateInvoicePdf(invoiceId, orgId, result.pdfPath);
  }
  const { sendInvoiceEmail } = await import("./emailService");
  await sendInvoiceEmail({
    to: recipient,
    invoiceNumber: invoice.number,
    clientName: invoice.clientName || "Client",
    total: invoice.total,
    dueDate: invoice.dueDate,
    pdfUrl: pdfPath ?? "",
    message,
  });
  if (invoice.status === "draft") {
    await db.updateInvoiceStatus(invoiceId, orgId, "sent");
  }
  return { sentTo: recipient };
}

const bookingRouter = router({
  list: protectedProcedure
    .input(bookingListQuerySchema)
    .query(async ({ ctx, input }) => {
      const org = ctx.active.organizationId;
      const [items, total] = await Promise.all([
        db.getBookings(org, input),
        db.getBookingCount(org, input.status),
      ]);
      return { items, total, limit: input.limit, offset: input.offset };
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    return db.getBookingStats(ctx.active.organizationId);
  }),

  getById: protectedProcedure
    .input(bookingIdSchema)
    .query(async ({ ctx, input }) => {
      const booking = await db.getBookingById(
        input.id,
        ctx.active.organizationId
      );
      if (!booking)
        throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
      return booking;
    }),

  create: protectedProcedure
    .input(createBookingSchema)
    .mutation(async ({ ctx, input }) => {
      const org = ctx.active.organizationId;
      const { autoInvoice, autoSend, ...data } = input;
      const booking = await db.createBooking(org, data);

      let invoice = null;
      let emailed = false;
      // Auto-raise an invoice when asked and a quoted amount is present.
      if ((autoInvoice || autoSend) && data.amount && data.amount > 0) {
        invoice = await db.convertBookingToInvoice(booking.id, org, {
          amount: data.amount,
        });
        if (autoSend && invoice) {
          try {
            const { sentTo } = await emailInvoice(invoice.id, org);
            emailed = !!sentTo;
            if (emailed) await db.updateBookingStatus(booking.id, org, "quoted");
          } catch (err) {
            // Delivery is best-effort — the booking + invoice still persist.
            console.error("[booking] auto-send failed:", err);
          }
        }
      }

      const fresh = await db.getBookingById(booking.id, org);
      return { booking: fresh ?? booking, invoice, emailed };
    }),

  updateStatus: adminProcedure
    .input(updateBookingStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const org = ctx.active.organizationId;
      const existing = await db.getBookingById(input.id, org);
      if (!existing)
        throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
      return db.updateBookingStatus(input.id, org, input.status);
    }),

  convertToInvoice: adminProcedure
    .input(convertBookingSchema)
    .mutation(async ({ ctx, input }) => {
      const org = ctx.active.organizationId;
      try {
        const invoice = await db.convertBookingToInvoice(input.id, org, {
          amount: input.amount,
        });
        let emailed = false;
        if (input.send && invoice) {
          const { sentTo } = await emailInvoice(invoice.id, org);
          emailed = !!sentTo;
        }
        return { invoice, emailed };
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: err instanceof Error ? err.message : "Could not convert booking",
        });
      }
    }),

  delete: adminProcedure
    .input(bookingIdSchema)
    .mutation(async ({ ctx, input }) => {
      const org = ctx.active.organizationId;
      const existing = await db.getBookingById(input.id, org);
      if (!existing)
        throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
      return db.deleteBooking(input.id, org);
    }),
});

// ─── App Router ─────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => {
      // Valid Clerk session but the workspace couldn't be loaded — report the
      // real reason so the client can show it instead of spinning forever.
      if (ctx.user && !ctx.active && ctx.authError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Couldn't load your workspace: ${ctx.authError}`,
        });
      }
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
    // Sign-out is handled client-side via the Clerk SDK; this is a no-op
    // kept for API compatibility.
    logout: publicProcedure.mutation(() => {
      return { success: true } as const;
    }),
  }),
  organization: orgRouter,
  clients: clientRouter,
  invoice: invoiceRouter,
  booking: bookingRouter,
  dashboard: dashboardRouter,
  apiKeys: apiKeysRouter,
});

export type AppRouter = typeof appRouter;
