-- InvoiceFlow — full schema + RLS for Supabase.
-- Paste this whole file into Supabase → SQL Editor → Run.
-- Generated from server/db/schema.ts (drizzle) + drizzle/pg/policies.sql.

-- ============ 1) SCHEMA ============
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'paid', 'overdue', 'void');
CREATE TYPE "public"."member_role" AS ENUM('owner', 'admin', 'member', 'viewer');
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE "public"."plan_tier" AS ENUM('starter', 'pro', 'business');
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'trialing', 'past_due', 'canceled', 'incomplete');
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"prefix" varchar(20) NOT NULL,
	"hashed_key" varchar(128) NOT NULL,
	"scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"company" varchar(255),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"postcode" varchar(20),
	"country" varchar(100) DEFAULT 'United Kingdom',
	"phone" varchar(50),
	"payment_terms" integer DEFAULT 30 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"number" varchar(32) NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"subtotal" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '20.00' NOT NULL,
	"tax_amount" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"total" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"notes" text,
	"pdf_path" text,
	"stripe_payment_intent_id" varchar(255),
	"payment_link_url" text,
	"sent_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"description" varchar(500) NOT NULL,
	"quantity" numeric(12, 2) DEFAULT '1.00' NOT NULL,
	"unit_price" numeric(14, 2) NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "memberships" (
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memberships_organization_id_user_id_pk" PRIMARY KEY("organization_id","user_id")
);

CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(80) NOT NULL,
	"plan" "plan_tier" DEFAULT 'starter' NOT NULL,
	"billing_email" varchar(320),
	"logo_url" text,
	"default_currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"default_vat_rate" numeric(5, 2) DEFAULT '20.00' NOT NULL,
	"invoice_seq" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"provider" varchar(32) DEFAULT 'stripe' NOT NULL,
	"provider_ref" varchar(255),
	"amount" numeric(14, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"polar_subscription_id" varchar(255),
	"polar_customer_id" varchar(255),
	"plan" "plan_tier" DEFAULT 'starter' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(32) NOT NULL,
	"event_id" varchar(255) NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payments" ADD CONSTRAINT "payments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
CREATE UNIQUE INDEX "api_keys_hashed_idx" ON "api_keys" USING btree ("hashed_key");
CREATE INDEX "api_keys_org_idx" ON "api_keys" USING btree ("organization_id");
CREATE INDEX "clients_org_idx" ON "clients" USING btree ("organization_id");
CREATE INDEX "clients_email_idx" ON "clients" USING btree ("email");
CREATE UNIQUE INDEX "invoices_org_number_idx" ON "invoices" USING btree ("organization_id","number");
CREATE INDEX "invoices_org_idx" ON "invoices" USING btree ("organization_id");
CREATE INDEX "invoices_client_idx" ON "invoices" USING btree ("client_id");
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");
CREATE INDEX "invoices_due_date_idx" ON "invoices" USING btree ("due_date");
CREATE INDEX "line_items_invoice_idx" ON "line_items" USING btree ("invoice_id");
CREATE INDEX "memberships_user_idx" ON "memberships" USING btree ("user_id");
CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");
CREATE INDEX "payments_org_idx" ON "payments" USING btree ("organization_id");
CREATE INDEX "payments_invoice_idx" ON "payments" USING btree ("invoice_id");
CREATE UNIQUE INDEX "subscriptions_org_idx" ON "subscriptions" USING btree ("organization_id");
CREATE UNIQUE INDEX "webhook_events_provider_event_idx" ON "webhook_events" USING btree ("provider","event_id");
-- ============ 2) ROW-LEVEL SECURITY ============
-- Row-Level Security policies for InvoiceFlow (Supabase Postgres).
--
-- The API connects as the `postgres` role, which BYPASSES RLS, and enforces
-- tenant scoping in the application layer. These policies are defense-in-depth:
-- they protect the anon/authenticated (PostgREST) access path so that even a
-- leaked anon key can only ever read/write rows for organizations the signed-in
-- user belongs to.
--
-- Apply AFTER the generated schema migration (0000_*.sql).

-- Is the current Supabase user a member of the given organization?
create or replace function public.is_org_member(org uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = org
      and m.user_id = auth.uid()
  );
$$;

alter table public.users          enable row level security;
alter table public.organizations  enable row level security;
alter table public.memberships    enable row level security;
alter table public.clients        enable row level security;
alter table public.invoices       enable row level security;
alter table public.line_items     enable row level security;
alter table public.api_keys       enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.payments       enable row level security;

-- A user can see/update only their own profile row.
create policy users_self on public.users
  for all using (id = auth.uid()) with check (id = auth.uid());

-- Members can read their organizations and memberships.
create policy orgs_member_read on public.organizations
  for select using (public.is_org_member(id));

create policy memberships_read on public.memberships
  for select using (public.is_org_member(organization_id));

-- Org-scoped resources: full access limited to members of the owning org.
create policy clients_org on public.clients
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy invoices_org on public.invoices
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy api_keys_org on public.api_keys
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy subscriptions_org on public.subscriptions
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy payments_org on public.payments
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- Line items inherit their parent invoice's organization.
create policy line_items_org on public.line_items
  for all using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and public.is_org_member(i.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and public.is_org_member(i.organization_id)
    )
  );
