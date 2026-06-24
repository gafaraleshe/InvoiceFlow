/**
 * InvoiceFlow — multi-tenant Postgres schema (Supabase).
 *
 * This is the Phase 1 data model from docs/PRODUCT_PLAN.md. Every tenant row is
 * owned by an `organization`; access is scoped by membership and backstopped by
 * Row-Level Security (see drizzle/pg/policies.sql). Money is stored as
 * numeric(14,2) with an explicit ISO-4217 currency — never floats.
 *
 * `users.id` mirrors Supabase `auth.users.id` (uuid).
 */
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  timestamp,
  numeric,
  integer,
  boolean,
  jsonb,
  date,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";

/* ── enums ──────────────────────────────────────────────────────────────── */
export const memberRole = pgEnum("member_role", [
  "owner",
  "admin",
  "member",
  "viewer",
]);
export const planTier = pgEnum("plan_tier", ["starter", "pro", "business"]);
export const invoiceStatus = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
  "void",
]);
export const subscriptionStatus = pgEnum("subscription_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "incomplete",
]);
export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

/* ── users (mirror of Supabase auth.users) ──────────────────────────────── */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // = auth.users.id
  email: varchar("email", { length: 320 }).notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  ...timestamps,
});

/* ── organizations ──────────────────────────────────────────────────────── */
export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
    plan: planTier("plan").default("starter").notNull(),
    billingEmail: varchar("billing_email", { length: 320 }),
    logoUrl: text("logo_url"),
    defaultCurrency: varchar("default_currency", { length: 3 })
      .default("GBP")
      .notNull(),
    defaultVatRate: numeric("default_vat_rate", { precision: 5, scale: 2 })
      .default("20.00")
      .notNull(),
    // running counter used to mint sequential invoice numbers per org
    invoiceSeq: integer("invoice_seq").default(0).notNull(),
    ...timestamps,
  },
  t => [uniqueIndex("organizations_slug_idx").on(t.slug)]
);

/* ── memberships (user ↔ organization, with role) ───────────────────────── */
export const memberships = pgTable(
  "memberships",
  {
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: memberRole("role").default("member").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  t => [
    primaryKey({ columns: [t.organizationId, t.userId] }),
    index("memberships_user_idx").on(t.userId),
  ]
);

/* ── clients ────────────────────────────────────────────────────────────── */
export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    company: varchar("company", { length: 255 }),
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    postcode: varchar("postcode", { length: 20 }),
    country: varchar("country", { length: 100 }).default("United Kingdom"),
    phone: varchar("phone", { length: 50 }),
    paymentTerms: integer("payment_terms").default(30).notNull(), // days
    notes: text("notes"),
    ...timestamps,
  },
  t => [
    index("clients_org_idx").on(t.organizationId),
    index("clients_email_idx").on(t.email),
  ]
);

/* ── invoices ───────────────────────────────────────────────────────────── */
export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    number: varchar("number", { length: 32 }).notNull(),
    status: invoiceStatus("status").default("draft").notNull(),
    currency: varchar("currency", { length: 3 }).default("GBP").notNull(),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    subtotal: numeric("subtotal", { precision: 14, scale: 2 })
      .default("0.00")
      .notNull(),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 })
      .default("20.00")
      .notNull(),
    taxAmount: numeric("tax_amount", { precision: 14, scale: 2 })
      .default("0.00")
      .notNull(),
    total: numeric("total", { precision: 14, scale: 2 })
      .default("0.00")
      .notNull(),
    notes: text("notes"),
    pdfPath: text("pdf_path"),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
    paymentLinkUrl: text("payment_link_url"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    ...timestamps,
  },
  t => [
    uniqueIndex("invoices_org_number_idx").on(t.organizationId, t.number),
    index("invoices_org_idx").on(t.organizationId),
    index("invoices_client_idx").on(t.clientId),
    index("invoices_status_idx").on(t.status),
    index("invoices_due_date_idx").on(t.dueDate),
  ]
);

/* ── line items ─────────────────────────────────────────────────────────── */
export const lineItems = pgTable(
  "line_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: varchar("description", { length: 500 }).notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 2 })
      .default("1.00")
      .notNull(),
    unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  t => [index("line_items_invoice_idx").on(t.invoiceId)]
);

/* ── api keys (public REST API auth) ────────────────────────────────────── */
export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    prefix: varchar("prefix", { length: 20 }).notNull(),
    hashedKey: varchar("hashed_key", { length: 128 }).notNull(),
    scopes: jsonb("scopes").$type<string[]>().default([]).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  t => [
    uniqueIndex("api_keys_hashed_idx").on(t.hashedKey),
    index("api_keys_org_idx").on(t.organizationId),
  ]
);

/* ── subscriptions (Polar.sh) ───────────────────────────────────────────── */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    polarSubscriptionId: varchar("polar_subscription_id", { length: 255 }),
    polarCustomerId: varchar("polar_customer_id", { length: 255 }),
    plan: planTier("plan").default("starter").notNull(),
    status: subscriptionStatus("status").default("active").notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    ...timestamps,
  },
  t => [uniqueIndex("subscriptions_org_idx").on(t.organizationId)]
);

/* ── payments (Stripe invoice payments) ─────────────────────────────────── */
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 32 }).default("stripe").notNull(),
    providerRef: varchar("provider_ref", { length: 255 }),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("GBP").notNull(),
    status: paymentStatus("status").default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  t => [
    index("payments_org_idx").on(t.organizationId),
    index("payments_invoice_idx").on(t.invoiceId),
  ]
);

/* ── webhook events (idempotency for Polar + Stripe) ────────────────────── */
export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: varchar("provider", { length: 32 }).notNull(),
    eventId: varchar("event_id", { length: 255 }).notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  t => [
    uniqueIndex("webhook_events_provider_event_idx").on(t.provider, t.eventId),
  ]
);

/* ── inferred types ─────────────────────────────────────────────────────── */
export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export type LineItem = typeof lineItems.$inferSelect;
export type InsertLineItem = typeof lineItems.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Payment = typeof payments.$inferSelect;
