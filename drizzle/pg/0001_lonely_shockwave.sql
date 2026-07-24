-- Bookings (CRM) + Clerk string ids.
--
-- Written to be safe to re-run. Editing this file changes its hash, so any
-- database that recorded the previous version will replay it; every statement
-- below therefore tolerates the objects already existing.
DO $$ BEGIN
	CREATE TYPE "public"."booking_status" AS ENUM('new', 'contacted', 'quoted', 'confirmed', 'completed', 'cancelled');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"client_id" uuid,
	"invoice_id" uuid,
	"name" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(50),
	"service_type" varchar(120),
	"package_name" varchar(120),
	"event_date" date,
	"location" varchar(255),
	"message" text,
	"amount" numeric(14, 2),
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"status" "booking_status" DEFAULT 'new' NOT NULL,
	"source" varchar(80) DEFAULT 'api' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- users.id and memberships.user_id move from uuid to varchar together (Clerk
-- ids are strings). Postgres re-validates the foreign key when either side is
-- retyped, so retyping one while the other is still uuid fails with
-- "key columns are of incompatible types". Drop the constraint, retype both,
-- then put it back.
ALTER TABLE "memberships" DROP CONSTRAINT IF EXISTS "memberships_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "memberships" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_organization_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_client_id_clients_id_fk";--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_invoice_id_invoices_id_fk";--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_org_idx" ON "bookings" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_email_idx" ON "bookings" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_created_idx" ON "bookings" USING btree ("created_at");
