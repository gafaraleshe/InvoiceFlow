import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  index,
} from "drizzle-orm/mysql-core";

// ─── Users ──────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Clients ────────────────────────────────────────────────────────────────
export const clients = mysqlTable(
  "clients",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    company: varchar("company", { length: 255 }),
    addressLine1: varchar("addressLine1", { length: 255 }),
    addressLine2: varchar("addressLine2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    postcode: varchar("postcode", { length: 20 }),
    country: varchar("country", { length: 100 }).default("United Kingdom"),
    phone: varchar("phone", { length: 50 }),
    paymentTerms: int("paymentTerms").default(30).notNull(), // days
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("clients_userId_idx").on(table.userId),
    index("clients_email_idx").on(table.email),
  ]
);

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ─── Invoices ───────────────────────────────────────────────────────────────
export const invoices = mysqlTable(
  "invoices",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    clientId: int("clientId").notNull(),
    invoiceNumber: varchar("invoiceNumber", { length: 20 }).notNull().unique(),
    status: mysqlEnum("status", ["draft", "sent", "paid", "overdue"])
      .default("draft")
      .notNull(),
    issueDate: timestamp("issueDate").notNull(),
    dueDate: timestamp("dueDate").notNull(),
    subtotal: decimal("subtotal", { precision: 12, scale: 2 })
      .default("0.00")
      .notNull(),
    vatRate: decimal("vatRate", { precision: 5, scale: 2 })
      .default("20.00")
      .notNull(),
    vatAmount: decimal("vatAmount", { precision: 12, scale: 2 })
      .default("0.00")
      .notNull(),
    total: decimal("total", { precision: 12, scale: 2 })
      .default("0.00")
      .notNull(),
    notes: text("notes"),
    pdfUrl: varchar("pdfUrl", { length: 512 }),
    pdfKey: varchar("pdfKey", { length: 256 }),
    sentAt: timestamp("sentAt"),
    paidAt: timestamp("paidAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("invoices_userId_idx").on(table.userId),
    index("invoices_clientId_idx").on(table.clientId),
    index("invoices_status_idx").on(table.status),
    index("invoices_dueDate_idx").on(table.dueDate),
    index("invoices_invoiceNumber_idx").on(table.invoiceNumber),
  ]
);

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ─── Line Items ─────────────────────────────────────────────────────────────
export const lineItems = mysqlTable(
  "line_items",
  {
    id: int("id").autoincrement().primaryKey(),
    invoiceId: int("invoiceId").notNull(),
    description: varchar("description", { length: 500 }).notNull(),
    quantity: decimal("quantity", { precision: 10, scale: 2 })
      .default("1.00")
      .notNull(),
    unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("lineItems_invoiceId_idx").on(table.invoiceId),
  ]
);

export type LineItem = typeof lineItems.$inferSelect;
export type InsertLineItem = typeof lineItems.$inferInsert;
