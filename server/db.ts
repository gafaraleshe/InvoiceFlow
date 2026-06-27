/**
 * InvoiceFlow data + service layer (Supabase Postgres, multi-tenant).
 *
 * Every function is scoped to an `organizationId`. The tRPC layer resolves the
 * caller's active org from their Supabase identity (see _core/context.ts) and
 * passes it here — business logic never trusts a client-supplied org.
 *
 * Money is stored as Postgres numeric (strings); we convert to Number only for
 * arithmetic to avoid float drift.
 */
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "./db/client";
import {
  clients,
  invoices,
  lineItems,
  memberships,
  organizations,
  users,
  type InsertClient,
  type InsertInvoice,
} from "./db/schema";

/* ── pure helpers (unit-tested) ─────────────────────────────────────────── */

export function calculateVat(subtotal: number, vatRate: number = 20) {
  const vatAmount = Number(((subtotal * vatRate) / 100).toFixed(2));
  const total = Number((subtotal + vatAmount).toFixed(2));
  return { subtotal, vatRate, vatAmount, total };
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "team"
  );
}

/* ── identity & organizations ───────────────────────────────────────────── */

export type Role = "owner" | "admin" | "member" | "viewer";

export interface ActiveContext {
  userId: string;
  organizationId: string;
  organizationName: string;
  role: Role;
}

/** Mirror a Supabase auth user into our `users` table (idempotent). */
export async function syncUser(u: {
  id: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}) {
  await db
    .insert(users)
    .values({
      id: u.id,
      email: u.email,
      fullName: u.fullName ?? null,
      avatarUrl: u.avatarUrl ?? null,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: u.email, updatedAt: new Date() },
    });
}

export async function getMemberships(userId: string) {
  return db
    .select({
      organizationId: memberships.organizationId,
      role: memberships.role,
      name: organizations.name,
      slug: organizations.slug,
      plan: organizations.plan,
    })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
    .where(eq(memberships.userId, userId))
    .orderBy(asc(organizations.createdAt));
}

/** Create an organization and make `ownerUserId` its owner. */
export async function createOrganization(name: string, ownerUserId: string) {
  return db.transaction(async tx => {
    let slug = slugify(name);
    const exists = await tx
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);
    if (exists.length)
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    const [org] = await tx
      .insert(organizations)
      .values({ name, slug })
      .returning();
    await tx
      .insert(memberships)
      .values({ organizationId: org.id, userId: ownerUserId, role: "owner" });
    return org;
  });
}

/**
 * Resolve the caller's active organization, bootstrapping a personal workspace
 * on first login. Returns the context used to scope every query.
 */
export async function resolveActiveContext(
  user: { id: string; email: string; fullName?: string | null },
  requestedOrgId?: string | null
): Promise<ActiveContext> {
  await syncUser(user);
  let mine = await getMemberships(user.id);

  if (mine.length === 0) {
    const defaultName = user.fullName?.trim()
      ? `${user.fullName.split(" ")[0]}'s workspace`
      : "My workspace";
    await createOrganization(defaultName, user.id);
    mine = await getMemberships(user.id);
  }

  const chosen =
    (requestedOrgId && mine.find(m => m.organizationId === requestedOrgId)) ||
    mine[0];

  return {
    userId: user.id,
    organizationId: chosen.organizationId,
    organizationName: chosen.name,
    role: chosen.role,
  };
}

/* ── clients ────────────────────────────────────────────────────────────── */

export async function getClients(
  orgId: string,
  opts?: { search?: string; limit?: number; offset?: number }
) {
  const conditions = [eq(clients.organizationId, orgId)];
  if (opts?.search) {
    const q = `%${opts.search}%`;
    conditions.push(
      or(
        ilike(clients.name, q),
        ilike(clients.email, q),
        ilike(clients.company, q)
      )!
    );
  }
  return db
    .select()
    .from(clients)
    .where(and(...conditions))
    .orderBy(desc(clients.updatedAt))
    .limit(opts?.limit ?? 50)
    .offset(opts?.offset ?? 0);
}

export async function getClientCount(orgId: string, search?: string) {
  const conditions = [eq(clients.organizationId, orgId)];
  if (search) {
    const q = `%${search}%`;
    conditions.push(
      or(
        ilike(clients.name, q),
        ilike(clients.email, q),
        ilike(clients.company, q)
      )!
    );
  }
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clients)
    .where(and(...conditions));
  return row?.count ?? 0;
}

export async function getClientById(id: string, orgId: string) {
  const [row] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.organizationId, orgId)))
    .limit(1);
  return row;
}

export async function createClient(
  orgId: string,
  data: Omit<InsertClient, "id" | "organizationId" | "createdAt" | "updatedAt">
) {
  const [row] = await db
    .insert(clients)
    .values({ ...data, organizationId: orgId })
    .returning();
  return row;
}

export async function updateClient(
  id: string,
  orgId: string,
  data: Partial<Omit<InsertClient, "id" | "organizationId" | "createdAt">>
) {
  const [row] = await db
    .update(clients)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(clients.id, id), eq(clients.organizationId, orgId)))
    .returning();
  return row;
}

export async function deleteClient(id: string, orgId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(and(eq(invoices.clientId, id), eq(invoices.organizationId, orgId)));
  if ((row?.count ?? 0) > 0) {
    throw new Error("Cannot delete client with existing invoices");
  }
  await db
    .delete(clients)
    .where(and(eq(clients.id, id), eq(clients.organizationId, orgId)));
  return { success: true };
}

/* ── invoices ───────────────────────────────────────────────────────────── */

type InvoiceInput = {
  clientId: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  vatRate: number;
  currency?: string;
  notes?: string | null;
};
type LineItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
  sortOrder?: number;
};

function priceLineItems(items: LineItemInput[]) {
  let subtotal = 0;
  const processed = items.map((item, idx) => {
    const amount = Number((item.quantity * item.unitPrice).toFixed(2));
    subtotal += amount;
    return {
      description: item.description,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
      amount: String(amount),
      sortOrder: item.sortOrder ?? idx,
    };
  });
  return { subtotal: Number(subtotal.toFixed(2)), processed };
}

export async function getInvoices(
  orgId: string,
  opts?: {
    status?: string;
    clientId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
) {
  const conditions = [eq(invoices.organizationId, orgId)];
  if (opts?.status && opts.status !== "all") {
    conditions.push(eq(invoices.status, opts.status as never));
  }
  if (opts?.clientId) conditions.push(eq(invoices.clientId, opts.clientId));
  if (opts?.search) conditions.push(ilike(invoices.number, `%${opts.search}%`));

  const rows = await db
    .select({
      invoice: invoices,
      clientName: clients.name,
      clientEmail: clients.email,
      clientCompany: clients.company,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(and(...conditions))
    .orderBy(desc(invoices.createdAt))
    .limit(opts?.limit ?? 50)
    .offset(opts?.offset ?? 0);

  return rows.map(r => ({
    ...r.invoice,
    clientName: r.clientName,
    clientEmail: r.clientEmail,
    clientCompany: r.clientCompany,
  }));
}

export async function getInvoiceCount(
  orgId: string,
  status?: string,
  clientId?: string
) {
  const conditions = [eq(invoices.organizationId, orgId)];
  if (status && status !== "all") {
    conditions.push(eq(invoices.status, status as never));
  }
  if (clientId) conditions.push(eq(invoices.clientId, clientId));
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(and(...conditions));
  return row?.count ?? 0;
}

export async function getInvoiceById(id: string, orgId: string) {
  const [row] = await db
    .select({
      invoice: invoices,
      clientName: clients.name,
      clientEmail: clients.email,
      clientCompany: clients.company,
      clientAddressLine1: clients.addressLine1,
      clientAddressLine2: clients.addressLine2,
      clientCity: clients.city,
      clientPostcode: clients.postcode,
      clientCountry: clients.country,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(and(eq(invoices.id, id), eq(invoices.organizationId, orgId)))
    .limit(1);
  if (!row) return undefined;

  const items = await db
    .select()
    .from(lineItems)
    .where(eq(lineItems.invoiceId, id))
    .orderBy(asc(lineItems.sortOrder));

  return {
    ...row.invoice,
    clientName: row.clientName,
    clientEmail: row.clientEmail,
    clientCompany: row.clientCompany,
    clientAddressLine1: row.clientAddressLine1,
    clientAddressLine2: row.clientAddressLine2,
    clientCity: row.clientCity,
    clientPostcode: row.clientPostcode,
    clientCountry: row.clientCountry,
    lineItems: items,
  };
}

async function nextInvoiceNumber(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  orgId: string
): Promise<string> {
  const [org] = await tx
    .update(organizations)
    .set({ invoiceSeq: sql`${organizations.invoiceSeq} + 1` })
    .where(eq(organizations.id, orgId))
    .returning({ seq: organizations.invoiceSeq });
  const year = new Date().getFullYear();
  return `INV-${year}-${String(org.seq).padStart(3, "0")}`;
}

export async function createInvoice(
  orgId: string,
  data: InvoiceInput,
  items: LineItemInput[]
) {
  const { subtotal, processed } = priceLineItems(items);
  const { vatRate, vatAmount, total } = calculateVat(subtotal, data.vatRate);

  const id = await db.transaction(async tx => {
    const number = await nextInvoiceNumber(tx, orgId);
    const [inv] = await tx
      .insert(invoices)
      .values({
        organizationId: orgId,
        clientId: data.clientId,
        number,
        currency: data.currency ?? "GBP",
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        notes: data.notes ?? null,
        subtotal: String(subtotal),
        taxRate: String(vatRate),
        taxAmount: String(vatAmount),
        total: String(total),
      } satisfies InsertInvoice)
      .returning({ id: invoices.id });
    if (processed.length) {
      await tx
        .insert(lineItems)
        .values(processed.map(p => ({ ...p, invoiceId: inv.id })));
    }
    return inv.id;
  });

  return getInvoiceById(id, orgId);
}

export async function updateInvoice(
  id: string,
  orgId: string,
  data: Partial<InvoiceInput>,
  items?: LineItemInput[]
) {
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (data.clientId) patch.clientId = data.clientId;
  if (data.issueDate) patch.issueDate = data.issueDate;
  if (data.dueDate) patch.dueDate = data.dueDate;
  if (data.notes !== undefined) patch.notes = data.notes;

  if (items !== undefined) {
    const { subtotal, processed } = priceLineItems(items);
    const { vatRate, vatAmount, total } = calculateVat(
      subtotal,
      data.vatRate ?? 20
    );
    await db.transaction(async tx => {
      await tx.delete(lineItems).where(eq(lineItems.invoiceId, id));
      if (processed.length) {
        await tx
          .insert(lineItems)
          .values(processed.map(p => ({ ...p, invoiceId: id })));
      }
      await tx
        .update(invoices)
        .set({
          ...patch,
          subtotal: String(subtotal),
          taxRate: String(vatRate),
          taxAmount: String(vatAmount),
          total: String(total),
        })
        .where(and(eq(invoices.id, id), eq(invoices.organizationId, orgId)));
    });
  } else {
    await db
      .update(invoices)
      .set(patch)
      .where(and(eq(invoices.id, id), eq(invoices.organizationId, orgId)));
  }
  return getInvoiceById(id, orgId);
}

export async function updateInvoiceStatus(
  id: string,
  orgId: string,
  status: "draft" | "sent" | "paid" | "overdue"
) {
  const patch: Record<string, unknown> = { status, updatedAt: new Date() };
  if (status === "sent") patch.sentAt = new Date();
  if (status === "paid") patch.paidAt = new Date();
  await db
    .update(invoices)
    .set(patch)
    .where(and(eq(invoices.id, id), eq(invoices.organizationId, orgId)));
  return getInvoiceById(id, orgId);
}

export async function deleteInvoice(id: string, orgId: string) {
  await db
    .delete(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.organizationId, orgId)));
  return { success: true };
}

export async function updateInvoicePdf(
  id: string,
  orgId: string,
  pdfPath: string
) {
  await db
    .update(invoices)
    .set({ pdfPath })
    .where(and(eq(invoices.id, id), eq(invoices.organizationId, orgId)));
}

/* ── dashboard & jobs ───────────────────────────────────────────────────── */

export async function getDashboardStats(orgId: string) {
  const [rev] = await db
    .select({
      totalPaid: sql<string>`coalesce(sum(case when ${invoices.status} = 'paid' then ${invoices.total} else 0 end), 0)`,
      totalOutstanding: sql<string>`coalesce(sum(case when ${invoices.status} in ('sent','overdue') then ${invoices.total} else 0 end), 0)`,
      overdueCount: sql<number>`coalesce(sum(case when ${invoices.status} = 'overdue' then 1 else 0 end), 0)::int`,
      paidCount: sql<number>`coalesce(sum(case when ${invoices.status} = 'paid' then 1 else 0 end), 0)::int`,
      invoiceCount: sql<number>`count(*)::int`,
    })
    .from(invoices)
    .where(eq(invoices.organizationId, orgId));

  const [cl] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clients)
    .where(eq(clients.organizationId, orgId));

  return {
    totalRevenue: Number(rev?.totalPaid ?? 0),
    outstanding: Number(rev?.totalOutstanding ?? 0),
    overdueCount: Number(rev?.overdueCount ?? 0),
    paidCount: Number(rev?.paidCount ?? 0),
    clientCount: Number(cl?.count ?? 0),
    invoiceCount: Number(rev?.invoiceCount ?? 0),
  };
}

/** Flip sent invoices past their due date to overdue (all orgs). */
export async function flagOverdueInvoices() {
  const rows = await db
    .update(invoices)
    .set({ status: "overdue" })
    .where(
      and(eq(invoices.status, "sent"), sql`${invoices.dueDate} < current_date`)
    )
    .returning({ id: invoices.id });
  return rows.length;
}
