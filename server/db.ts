import { eq, and, desc, asc, sql, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  clients,
  invoices,
  lineItems,
  type InsertClient,
  type InsertInvoice,
  type InsertLineItem,
  type Client,
  type Invoice,
  type LineItem,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ──────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values)
      .onDuplicateKeyUpdate({
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Clients ────────────────────────────────────────────────────────────────

export async function getClients(
  userId: number,
  opts?: { search?: string; limit?: number; offset?: number }
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(clients.userId, userId)];
  if (opts?.search) {
    conditions.push(
      sql`(${clients.name} LIKE ${`%${opts.search}%`} OR ${clients.email} LIKE ${`%${opts.search}%`} OR ${clients.company} LIKE ${`%${opts.search}%`})`
    );
  }

  const query = db
    .select()
    .from(clients)
    .where(and(...conditions))
    .orderBy(desc(clients.updatedAt));

  if (opts?.limit) query.limit(opts.limit);
  if (opts?.offset) query.offset(opts.offset);

  return query;
}

export async function getClientCount(userId: number, search?: string) {
  const db = await getDb();
  if (!db) return 0;

  const conditions = [eq(clients.userId, userId)];
  if (search) {
    conditions.push(
      sql`(${clients.name} LIKE ${`%${search}%`} OR ${clients.email} LIKE ${`%${search}%`} OR ${clients.company} LIKE ${`%${search}%`})`
    );
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(clients)
    .where(and(...conditions));

  return result[0]?.count ?? 0;
}

export async function getClientById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, userId)))
    .limit(1);

  return result[0];
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(clients).values(data);
  const insertId = result[0].insertId;
  return getClientById(insertId, data.userId);
}

export async function updateClient(
  id: number,
  userId: number,
  data: Partial<Omit<InsertClient, "id" | "userId" | "createdAt">>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(clients)
    .set(data)
    .where(and(eq(clients.id, id), eq(clients.userId, userId)));

  return getClientById(id, userId);
}

export async function deleteClient(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if client has invoices
  const invoiceCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .where(and(eq(invoices.clientId, id), eq(invoices.userId, userId)));

  if ((invoiceCount[0]?.count ?? 0) > 0) {
    throw new Error("Cannot delete client with existing invoices");
  }

  await db
    .delete(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, userId)));

  return { success: true };
}

// ─── Invoices ───────────────────────────────────────────────────────────────

export async function getInvoices(
  userId: number,
  opts?: {
    status?: string;
    clientId?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(invoices.userId, userId)];
  if (opts?.status && opts.status !== "all") {
    conditions.push(eq(invoices.status, opts.status as any));
  }
  if (opts?.clientId) {
    conditions.push(eq(invoices.clientId, opts.clientId));
  }
  if (opts?.search) {
    conditions.push(
      sql`(${invoices.invoiceNumber} LIKE ${`%${opts.search}%`})`
    );
  }

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

  return rows.map((r) => ({
    ...r.invoice,
    clientName: r.clientName,
    clientEmail: r.clientEmail,
    clientCompany: r.clientCompany,
  }));
}

export async function getInvoiceCount(
  userId: number,
  status?: string,
  clientId?: number
) {
  const db = await getDb();
  if (!db) return 0;

  const conditions = [eq(invoices.userId, userId)];
  if (status && status !== "all") {
    conditions.push(eq(invoices.status, status as any));
  }
  if (clientId) {
    conditions.push(eq(invoices.clientId, clientId));
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .where(and(...conditions));

  return result[0]?.count ?? 0;
}

export async function getInvoiceById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const rows = await db
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
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
    .limit(1);

  if (!rows[0]) return undefined;

  const items = await db
    .select()
    .from(lineItems)
    .where(eq(lineItems.invoiceId, id))
    .orderBy(asc(lineItems.sortOrder));

  return {
    ...rows[0].invoice,
    clientName: rows[0].clientName,
    clientEmail: rows[0].clientEmail,
    clientCompany: rows[0].clientCompany,
    clientAddressLine1: rows[0].clientAddressLine1,
    clientAddressLine2: rows[0].clientAddressLine2,
    clientCity: rows[0].clientCity,
    clientPostcode: rows[0].clientPostcode,
    clientCountry: rows[0].clientCountry,
    lineItems: items,
  };
}

export async function generateInvoiceNumber(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const result = await db
    .select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .where(
      and(
        eq(invoices.userId, userId),
        sql`${invoices.invoiceNumber} LIKE ${`${prefix}%`}`
      )
    )
    .orderBy(desc(invoices.invoiceNumber))
    .limit(1);

  let nextNum = 1;
  if (result[0]) {
    const lastNum = parseInt(result[0].invoiceNumber.replace(prefix, ""), 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(3, "0")}`;
}

export function calculateVat(subtotal: number, vatRate: number = 20) {
  const vatAmount = Number(((subtotal * vatRate) / 100).toFixed(2));
  const total = Number((subtotal + vatAmount).toFixed(2));
  return { subtotal, vatRate, vatAmount, total };
}

export async function createInvoice(
  data: Omit<InsertInvoice, "id" | "createdAt" | "updatedAt">,
  items: Omit<InsertLineItem, "id" | "invoiceId" | "createdAt">[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calculate line item amounts and subtotal
  let subtotal = 0;
  const processedItems = items.map((item, idx) => {
    const amount = Number(
      (Number(item.quantity) * Number(item.unitPrice)).toFixed(2)
    );
    subtotal += amount;
    return {
      ...item,
      amount: String(amount),
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
      sortOrder: item.sortOrder ?? idx,
    };
  });

  const { vatRate, vatAmount, total } = calculateVat(
    subtotal,
    Number(data.vatRate ?? 20)
  );

  const result = await db.insert(invoices).values({
    ...data,
    subtotal: String(subtotal),
    vatRate: String(vatRate),
    vatAmount: String(vatAmount),
    total: String(total),
  });

  const invoiceId = result[0].insertId;

  if (processedItems.length > 0) {
    await db.insert(lineItems).values(
      processedItems.map((item) => ({
        ...item,
        invoiceId,
      }))
    );
  }

  return getInvoiceById(invoiceId, data.userId);
}

export async function updateInvoice(
  id: number,
  userId: number,
  data: Partial<Omit<InsertInvoice, "id" | "userId" | "createdAt">>,
  items?: Omit<InsertLineItem, "id" | "invoiceId" | "createdAt">[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (items !== undefined) {
    // Recalculate totals from line items
    let subtotal = 0;
    const processedItems = items.map((item, idx) => {
      const amount = Number(
        (Number(item.quantity) * Number(item.unitPrice)).toFixed(2)
      );
      subtotal += amount;
      return {
        ...item,
        amount: String(amount),
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        sortOrder: item.sortOrder ?? idx,
      };
    });

    const { vatRate, vatAmount, total } = calculateVat(
      subtotal,
      Number(data.vatRate ?? 20)
    );

    // Delete old line items and insert new ones
    await db.delete(lineItems).where(eq(lineItems.invoiceId, id));

    if (processedItems.length > 0) {
      await db.insert(lineItems).values(
        processedItems.map((item) => ({
          ...item,
          invoiceId: id,
        }))
      );
    }

    await db
      .update(invoices)
      .set({
        ...data,
        subtotal: String(subtotal),
        vatRate: String(vatRate),
        vatAmount: String(vatAmount),
        total: String(total),
      })
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
  } else {
    await db
      .update(invoices)
      .set(data)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
  }

  return getInvoiceById(id, userId);
}

export async function updateInvoiceStatus(
  id: number,
  userId: number,
  status: "draft" | "sent" | "paid" | "overdue"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, any> = { status };
  if (status === "sent") updateData.sentAt = new Date();
  if (status === "paid") updateData.paidAt = new Date();

  await db
    .update(invoices)
    .set(updateData)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

  return getInvoiceById(id, userId);
}

export async function deleteInvoice(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete line items first
  await db.delete(lineItems).where(eq(lineItems.invoiceId, id));
  // Delete invoice
  await db
    .delete(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

  return { success: true };
}

// ─── Dashboard Stats ────────────────────────────────────────────────────────

export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db)
    return {
      totalRevenue: 0,
      outstanding: 0,
      overdueCount: 0,
      paidCount: 0,
      clientCount: 0,
      invoiceCount: 0,
    };

  const [revenueResult] = await db
    .select({
      totalPaid: sql<string>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} ELSE 0 END), 0)`,
      totalOutstanding: sql<string>`COALESCE(SUM(CASE WHEN ${invoices.status} IN ('sent', 'overdue') THEN ${invoices.total} ELSE 0 END), 0)`,
      overdueCount: sql<number>`SUM(CASE WHEN ${invoices.status} = 'overdue' THEN 1 ELSE 0 END)`,
      paidCount: sql<number>`SUM(CASE WHEN ${invoices.status} = 'paid' THEN 1 ELSE 0 END)`,
      invoiceCount: sql<number>`count(*)`,
    })
    .from(invoices)
    .where(eq(invoices.userId, userId));

  const [clientResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(clients)
    .where(eq(clients.userId, userId));

  return {
    totalRevenue: Number(revenueResult?.totalPaid ?? 0),
    outstanding: Number(revenueResult?.totalOutstanding ?? 0),
    overdueCount: Number(revenueResult?.overdueCount ?? 0),
    paidCount: Number(revenueResult?.paidCount ?? 0),
    clientCount: Number(clientResult?.count ?? 0),
    invoiceCount: Number(revenueResult?.invoiceCount ?? 0),
  };
}

// ─── Overdue Check ──────────────────────────────────────────────────────────

export async function flagOverdueInvoices() {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .update(invoices)
    .set({ status: "overdue" })
    .where(
      and(
        eq(invoices.status, "sent"),
        sql`${invoices.dueDate} < NOW()`
      )
    );

  return result[0].affectedRows ?? 0;
}

export async function updateInvoicePdf(
  id: number,
  userId: number,
  pdfUrl: string,
  pdfKey: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(invoices)
    .set({ pdfUrl, pdfKey })
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
}
