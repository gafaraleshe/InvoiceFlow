/**
 * Public REST API (`/api/v1`).
 *
 * Every route authenticates via API key and then calls the existing tRPC
 * procedures through `appRouter.createCaller(ctx)` — so VAT calculation,
 * invoice numbering, validation and tenancy scoping are never duplicated.
 */
import {
  Router,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import { TRPCError } from "@trpc/server";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import { requireApiKey, type RestRequest } from "./auth";
import { handleError } from "./errors";
import { openapiSpec } from "./openapi";

type Body = Record<string, unknown>;

function callerFor(req: Request, res: Response) {
  const { user, active } = (req as RestRequest).apiCtx!;
  const ctx: TrpcContext = { req, res, user, active };
  return appRouter.createCaller(ctx);
}

const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response) => {
    fn(req, res).catch(err => handleError(res, err));
  };

export function pagination(q: Request["query"]) {
  const limit = Math.min(
    Math.max(parseInt(String(q.limit ?? ""), 10) || 25, 1),
    100
  );
  const page = Math.max(parseInt(String(q.page ?? ""), 10) || 1, 1);
  return { page, limit, offset: (page - 1) * limit };
}

export function pageResult<T>(
  result: { items: T[]; total: number },
  page: number,
  limit: number
) {
  return {
    data: result.items,
    page,
    limit,
    total: result.total,
    total_pages: Math.max(1, Math.ceil(result.total / limit)),
  };
}

/** ISO date string → UTC ms; throws a 400 on malformed input. */
export function isoToMs(v: unknown, fallback?: number): number {
  if (v == null || v === "") {
    if (fallback != null) return fallback;
    throw new TRPCError({ code: "BAD_REQUEST", message: "Missing date" });
  }
  const ms = new Date(String(v)).getTime();
  if (Number.isNaN(ms)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Invalid date: ${v}` });
  }
  return ms;
}

/** Map a REST invoice body (snake_case, ISO dates) → createInvoiceSchema shape. */
export function toCreateInvoice(body: Body) {
  const now = Date.now();
  const items = (body.line_items ?? body.lineItems ?? []) as Body[];
  return {
    clientId: body.client_id ?? body.clientId,
    issueDate: isoToMs(body.issue_date ?? body.issueDate, now),
    dueDate: isoToMs(body.due_date ?? body.dueDate, now + 30 * 86_400_000),
    vatRate: body.tax_rate ?? body.vatRate ?? 20,
    notes: body.notes ?? null,
    lineItems: items.map(li => ({
      description: li.description,
      quantity: Number(li.quantity),
      unitPrice: Number(li.unit_price ?? li.unitPrice),
      ...(li.sort_order ?? li.sortOrder
        ? { sortOrder: Number(li.sort_order ?? li.sortOrder) }
        : {}),
    })),
  };
}

/** Map a REST invoice PATCH body → updateInvoiceSchema shape (only provided). */
export function toUpdateInvoice(body: Body) {
  const out: Body = {};
  if ("client_id" in body || "clientId" in body)
    out.clientId = body.client_id ?? body.clientId;
  if ("issue_date" in body || "issueDate" in body)
    out.issueDate = isoToMs(body.issue_date ?? body.issueDate);
  if ("due_date" in body || "dueDate" in body)
    out.dueDate = isoToMs(body.due_date ?? body.dueDate);
  if ("tax_rate" in body || "vatRate" in body)
    out.vatRate = body.tax_rate ?? body.vatRate;
  if ("notes" in body) out.notes = body.notes;
  if ("line_items" in body || "lineItems" in body) {
    const items = (body.line_items ?? body.lineItems ?? []) as Body[];
    out.lineItems = items.map(li => ({
      description: li.description,
      quantity: Number(li.quantity),
      unitPrice: Number(li.unit_price ?? li.unitPrice),
    }));
  }
  return out;
}

export function createRestApi(auth: RequestHandler = requireApiKey): Router {
  const api = Router();

  // Public: the spec itself needs no key.
  api.get("/openapi.json", (_req, res) => res.json(openapiSpec));

  // Everything else requires a valid API key.
  api.use(auth);

  api.get(
    "/me",
    asyncHandler(async (req, res) => {
      const { active } = (req as RestRequest).apiCtx!;
      res.json({
        organization: {
          id: active.organizationId,
          name: active.organizationName,
        },
        role: active.role,
      });
    })
  );

  // ── Clients ──────────────────────────────────────────────────────────────
  api.get(
    "/clients",
    asyncHandler(async (req, res) => {
      const { page, limit, offset } = pagination(req.query);
      const result = await callerFor(req, res).clients.list({
        search: req.query.search ? String(req.query.search) : undefined,
        limit,
        offset,
      });
      res.json(pageResult(result, page, limit));
    })
  );

  api.post(
    "/clients",
    asyncHandler(async (req, res) => {
      const created = await callerFor(req, res).clients.create(
        (req.body ?? {}) as never
      );
      res.status(201).json(created);
    })
  );

  api.get(
    "/clients/:id",
    asyncHandler(async (req, res) => {
      res.json(await callerFor(req, res).clients.getById({ id: req.params.id }));
    })
  );

  api.patch(
    "/clients/:id",
    asyncHandler(async (req, res) => {
      const updated = await callerFor(req, res).clients.update({
        id: req.params.id,
        ...((req.body ?? {}) as Body),
      } as never);
      res.json(updated);
    })
  );

  api.delete(
    "/clients/:id",
    asyncHandler(async (req, res) => {
      await callerFor(req, res).clients.delete({ id: req.params.id });
      res.json({ deleted: true });
    })
  );

  // ── Invoices ─────────────────────────────────────────────────────────────
  api.get(
    "/invoices",
    asyncHandler(async (req, res) => {
      const { page, limit, offset } = pagination(req.query);
      const status = (req.query.status as string) || "all";
      const clientId = req.query.client_id
        ? String(req.query.client_id)
        : undefined;
      const result = await callerFor(req, res).invoice.list({
        status: status as never,
        clientId,
        limit,
        offset,
      });
      res.json(pageResult(result, page, limit));
    })
  );

  api.post(
    "/invoices",
    asyncHandler(async (req, res) => {
      const created = await callerFor(req, res).invoice.create(
        toCreateInvoice((req.body ?? {}) as Body) as never
      );
      res.status(201).json(created);
    })
  );

  api.get(
    "/invoices/:id",
    asyncHandler(async (req, res) => {
      res.json(await callerFor(req, res).invoice.getById({ id: req.params.id }));
    })
  );

  api.patch(
    "/invoices/:id",
    asyncHandler(async (req, res) => {
      const id = req.params.id;
      const body = (req.body ?? {}) as Body;
      const caller = callerFor(req, res);
      const editable = toUpdateInvoice(body);

      let result: unknown;
      if (Object.keys(editable).length > 0) {
        result = await caller.invoice.update({ id, ...editable } as never);
      }
      if (typeof body.status === "string") {
        result = await caller.invoice.updateStatus({
          id,
          status: body.status as never,
        });
      }
      if (!result) result = await caller.invoice.getById({ id });
      res.json(result);
    })
  );

  api.delete(
    "/invoices/:id",
    asyncHandler(async (req, res) => {
      await callerFor(req, res).invoice.delete({ id: req.params.id });
      res.json({ deleted: true });
    })
  );

  api.post(
    "/invoices/:id/send",
    asyncHandler(async (req, res) => {
      const body = (req.body ?? {}) as Body;
      res.json(
        await callerFor(req, res).invoice.sendEmail({
          id: req.params.id,
          to: typeof body.to === "string" ? body.to : undefined,
          message: typeof body.message === "string" ? body.message : undefined,
        })
      );
    })
  );

  api.post(
    "/invoices/:id/pdf",
    asyncHandler(async (req, res) => {
      res.json(
        await callerFor(req, res).invoice.generatePdf({ id: req.params.id })
      );
    })
  );

  // ── Dashboard ────────────────────────────────────────────────────────────
  api.get(
    "/dashboard/stats",
    asyncHandler(async (req, res) => {
      res.json(await callerFor(req, res).dashboard.stats());
    })
  );

  return api;
}
