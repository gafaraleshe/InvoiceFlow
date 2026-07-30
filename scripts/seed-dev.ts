/**
 * Seed a local development workspace with realistic data to click through.
 *
 *   DATABASE_URL=… DEV_AUTH=1 pnpm seed:dev
 *
 * Provisions the workspace belonging to the dev sign-in identity (default
 * dev@example.com — the same email the login form pre-fills), then fills it with
 * clients, invoices across every status, and bookings. Everything goes through
 * the same db helpers the API uses, so VAT, totals, and invoice numbering are
 * produced exactly as they are in the product rather than hand-written.
 *
 * Idempotent: if the workspace already has clients it stops instead of stacking
 * duplicate data. Pass --reset to delete the workspace's rows and reseed.
 *
 * Env (all optional):
 *   DEV_SEED_EMAIL   identity to seed for   (default: dev@example.com)
 *   DEV_SEED_NAME    display name          (default: "Dev User")
 */
import { eq, inArray } from "drizzle-orm";
import { db } from "../server/db/client";
import { bookings, clients, invoices, lineItems } from "../server/db/schema";
import {
  createBooking,
  createClient,
  createInvoice,
  flagOverdueInvoices,
  resolveActiveContext,
  updateInvoiceStatus,
} from "../server/db";
import { devUserId } from "../server/auth/devAuth";

const email = (process.env.DEV_SEED_EMAIL || "dev@example.com").toLowerCase();
const fullName = process.env.DEV_SEED_NAME || "Dev User";
const reset = process.argv.includes("--reset");

/** YYYY-MM-DD, `days` from today (negative = past). */
function isoDate(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function wipe(orgId: string) {
  const ids = await db
    .select({ id: invoices.id })
    .from(invoices)
    .where(eq(invoices.organizationId, orgId));
  if (ids.length) {
    await db.delete(lineItems).where(
      inArray(
        lineItems.invoiceId,
        ids.map(i => i.id)
      )
    );
  }
  await db.delete(invoices).where(eq(invoices.organizationId, orgId));
  await db.delete(bookings).where(eq(bookings.organizationId, orgId));
  await db.delete(clients).where(eq(clients.organizationId, orgId));
  console.log("✓ cleared existing clients, invoices, and bookings");
}

async function main() {
  // Same call the request context makes on first sign-in: creates the user row
  // and a default workspace if they don't exist yet.
  const active = await resolveActiveContext(
    { id: devUserId(email), email, fullName },
    null
  );
  console.log(
    `✓ workspace "${active.organizationName}" (${active.organizationId}) — ${email} is ${active.role}`
  );

  const orgId = active.organizationId;

  const existing = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.organizationId, orgId));

  if (existing.length && !reset) {
    console.log(
      `\nWorkspace already has ${existing.length} client(s) — nothing to do.` +
        `\nRe-run with --reset to wipe and reseed.`
    );
    process.exit(0);
  }
  if (reset) await wipe(orgId);

  /* ── clients ──────────────────────────────────────────────────────────── */
  const clientSeeds = [
    {
      name: "Amara Okafor",
      email: "amara@northlightstudio.co.uk",
      company: "Northlight Studio",
      addressLine1: "44 Bermondsey Street",
      city: "London",
      postcode: "SE1 3UD",
      country: "United Kingdom",
      phone: "+44 20 7946 0812",
      paymentTerms: 30,
      notes: "Prefers invoices on the 1st. Long-standing retainer client.",
    },
    {
      name: "Tom Whitfield",
      email: "tom@harbourandcopress.com",
      company: "Harbour & Co Press",
      addressLine1: "12 Quay Road",
      city: "Bristol",
      postcode: "BS1 5TY",
      country: "United Kingdom",
      phone: "+44 117 496 0233",
      paymentTerms: 14,
    },
    {
      name: "Priya Raman",
      email: "priya@fernandflint.co.uk",
      company: "Fern & Flint",
      addressLine1: "3 Cobden Works",
      addressLine2: "Unit 7",
      city: "Manchester",
      postcode: "M4 6JG",
      country: "United Kingdom",
      paymentTerms: 30,
    },
    {
      name: "Daniel Boateng",
      email: "hello@boatengcycles.com",
      company: "Boateng Cycles",
      city: "Leeds",
      postcode: "LS1 4AP",
      country: "United Kingdom",
      paymentTerms: 7,
      notes: "New client — first project is a brand refresh.",
    },
  ];

  const created = [];
  for (const seed of clientSeeds) {
    created.push(await createClient(orgId, seed));
  }
  console.log(`✓ ${created.length} clients`);

  /* ── invoices, one per status ─────────────────────────────────────────── */
  const invoiceSeeds: Array<{
    clientIdx: number;
    issue: number;
    due: number;
    status?: "sent" | "paid";
    notes?: string;
    items: Array<{ description: string; quantity: number; unitPrice: number }>;
  }> = [
    {
      // paid
      clientIdx: 0,
      issue: -52,
      due: -22,
      status: "paid",
      notes: "Q2 retainer — thanks as always.",
      items: [
        {
          description: "Monthly design retainer — April",
          quantity: 1,
          unitPrice: 2400,
        },
        {
          description: "Additional artwork rounds",
          quantity: 3,
          unitPrice: 180,
        },
      ],
    },
    {
      // sent, not yet due
      clientIdx: 1,
      issue: -6,
      due: 8,
      status: "sent",
      notes: "Payment by bank transfer, details below.",
      items: [
        {
          description: "Cover design — autumn catalogue",
          quantity: 1,
          unitPrice: 1450,
        },
        {
          description: "Typesetting (per page)",
          quantity: 96,
          unitPrice: 12.5,
        },
      ],
    },
    {
      // sent and past due — `dashboard.flagOverdue` will move this to overdue
      clientIdx: 2,
      issue: -46,
      due: -16,
      status: "sent",
      notes: "Second reminder sent.",
      items: [
        {
          description: "Packaging illustration set",
          quantity: 1,
          unitPrice: 3200,
        },
        { description: "Print-ready file prep", quantity: 1, unitPrice: 275 },
      ],
    },
    {
      // draft
      clientIdx: 3,
      issue: 0,
      due: 7,
      items: [
        {
          description: "Brand discovery workshop",
          quantity: 1,
          unitPrice: 950,
        },
        {
          description: "Logo concepts (3 routes)",
          quantity: 3,
          unitPrice: 400,
        },
        {
          description: "Brand guidelines document",
          quantity: 1,
          unitPrice: 1200,
        },
      ],
    },
  ];

  for (const seed of invoiceSeeds) {
    const invoice = await createInvoice(
      orgId,
      {
        clientId: created[seed.clientIdx].id,
        issueDate: isoDate(seed.issue),
        dueDate: isoDate(seed.due),
        vatRate: 20,
        notes: seed.notes ?? null,
      },
      seed.items
    );
    if (seed.status && invoice) {
      await updateInvoiceStatus(invoice.id, orgId, seed.status);
    }
    console.log(
      `  ${invoice?.number}  ${(seed.status ?? "draft").padEnd(5)}  £${invoice?.total}`
    );
  }
  console.log(`✓ ${invoiceSeeds.length} invoices`);

  // One seeded invoice is sent and past its due date. Overdue is a derived state
  // applied by a job (dashboard.flagOverdue / the cron endpoint), so run it here
  // — otherwise the seed leaves data the dashboard reports as not-yet-overdue.
  const flagged = await flagOverdueInvoices();
  console.log(`✓ flagged ${flagged} invoice(s) overdue`);

  /* ── bookings (inbound enquiries from a booking site) ─────────────────── */
  const bookingSeeds = [
    {
      name: "Rosie Hart",
      email: "rosie.hart@example.com",
      phone: "+44 7700 900321",
      serviceType: "Wedding photography",
      packageName: "Full day",
      eventDate: isoDate(64),
      location: "Hedsor House, Buckinghamshire",
      message:
        "Ceremony at 1pm, roughly 120 guests. Do you offer a second shooter?",
      amount: 2850,
      source: "website",
    },
    {
      name: "Michael Adeyemi",
      email: "m.adeyemi@example.com",
      serviceType: "Brand shoot",
      packageName: "Half day",
      eventDate: isoDate(21),
      location: "Studio",
      message: "Need headshots and product shots for a new site.",
      amount: 720,
      source: "website",
    },
    {
      name: "Clara Nunes",
      email: "clara@example.com",
      phone: "+44 7700 900654",
      serviceType: "Event coverage",
      eventDate: isoDate(-9),
      location: "Barbican Centre",
      message: "Conference, two days. Sending the brief over shortly.",
      amount: 1600,
      source: "referral",
    },
  ];

  for (const seed of bookingSeeds) {
    await createBooking(orgId, seed);
  }
  console.log(`✓ ${bookingSeeds.length} bookings`);

  console.log(`\nDone. Sign in at /login as ${email} (any name) to see it.`);
  process.exit(0);
}

main().catch(err => {
  console.error("seed:dev failed:", err);
  process.exit(1);
});
