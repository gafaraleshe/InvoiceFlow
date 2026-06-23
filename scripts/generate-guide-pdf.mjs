// Generates docs/InvoiceFlow-Product-Guide.pdf from a structured content model.
// Pure JS (pdfkit) — no browser or native deps. Run: node scripts/generate-guide-pdf.mjs
import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "docs", "InvoiceFlow-Product-Guide.pdf");

// ── palette ──────────────────────────────────────────────────────────────────
const INK = "#1c1d22";
const DARK = "#11121a";
const ACCENT = "#5e6ad2";
const MUTED = "#6a6d78";
const RULE = "#d8dae2";
const THBG = "#f4f5fa";
const CALLBG = "#f6f7fc";

const M = 54; // page margin
const doc = new PDFDocument({ size: "A4", margins: { top: M, bottom: M, left: M, right: M } });
doc.pipe(fs.createWriteStream(OUT));

const PAGE_W = doc.page.width;
const CONTENT_W = PAGE_W - M * 2;
const BOTTOM = doc.page.height - M;

const F = "Helvetica";
const FB = "Helvetica-Bold";
const FI = "Helvetica-Oblique";

function ensure(h) {
  if (doc.y + h > BOTTOM) doc.addPage();
}
function gap(h = 8) {
  doc.y += h;
}
function h2(text) {
  ensure(46);
  gap(10);
  doc.font(FB).fontSize(16).fillColor(DARK).text(text, M, doc.y);
  const y = doc.y + 3;
  doc.moveTo(M, y).lineTo(M + CONTENT_W, y).lineWidth(1.5).strokeColor(ACCENT).stroke();
  doc.y = y + 8;
}
function h3(text) {
  ensure(28);
  gap(6);
  doc.font(FB).fontSize(11.5).fillColor("#2a2b35").text(text, M, doc.y);
  doc.y += 2;
}
function para(text, opts = {}) {
  doc.font(opts.font || F).fontSize(opts.size || 10.5).fillColor(opts.color || INK);
  const h = doc.heightOfString(text, { width: CONTENT_W });
  ensure(h);
  doc.text(text, M, doc.y, { width: CONTENT_W, align: opts.align || "left", lineGap: 1.5 });
  doc.y += 5;
}
function bullets(items) {
  doc.font(F).fontSize(10.5).fillColor(INK);
  for (const it of items) {
    const txt = `•  ${it}`;
    const h = doc.heightOfString(txt, { width: CONTENT_W - 12 });
    ensure(h + 2);
    doc.text(txt, M + 6, doc.y, { width: CONTENT_W - 12, lineGap: 1.5 });
    doc.y += 2;
  }
  doc.y += 4;
}
function callout(text) {
  doc.font(F).fontSize(10.5).fillColor(INK);
  const innerW = CONTENT_W - 24;
  const th = doc.heightOfString(text, { width: innerW });
  const boxH = th + 16;
  ensure(boxH + 6);
  const y0 = doc.y;
  doc.save().rect(M, y0, CONTENT_W, boxH).fill(CALLBG).restore();
  doc.save().rect(M, y0, 3, boxH).fill(ACCENT).restore();
  doc.fillColor(INK).text(text, M + 14, y0 + 8, { width: innerW, lineGap: 1.5 });
  doc.y = y0 + boxH + 8;
}
// Simple table with fixed column proportions.
function table(headers, rows, props) {
  const pad = 6;
  const widths = props.map((p) => p * CONTENT_W);
  const rowHeight = (cells) => {
    let max = 0;
    cells.forEach((c, i) => {
      doc.font(F).fontSize(9.5);
      const h = doc.heightOfString(String(c), { width: widths[i] - pad * 2 });
      if (h > max) max = h;
    });
    return max + pad * 2;
  };
  const drawRow = (cells, isHeader) => {
    const hgt = rowHeight(cells);
    ensure(hgt);
    const y0 = doc.y;
    let x = M;
    cells.forEach((c, i) => {
      if (isHeader) doc.save().rect(x, y0, widths[i], hgt).fill(THBG).restore();
      doc.rect(x, y0, widths[i], hgt).lineWidth(0.6).strokeColor(RULE).stroke();
      doc
        .font(isHeader ? FB : F)
        .fontSize(9.5)
        .fillColor(isHeader ? "#2a2b35" : INK)
        .text(String(c), x + pad, y0 + pad, { width: widths[i] - pad * 2, lineGap: 1 });
      x += widths[i];
    });
    doc.y = y0 + hgt;
  };
  ensure(rowHeight(headers) + 24);
  drawRow(headers, true);
  rows.forEach((r) => drawRow(r, false));
  doc.y += 8;
}

// ── COVER ──────────────────────────────────────────────────────────────────
doc.save().roundedRect(M, M + 30, 40, 40, 8).fill(ACCENT).restore();
doc.font(FB).fontSize(22).fillColor("#ffffff").text("I", M + 13, M + 40);
doc.font(FB).fontSize(34).fillColor(DARK).text("InvoiceFlow", M, M + 90);
doc
  .font(F)
  .fontSize(14)
  .fillColor("#4a4d59")
  .text(
    "Product & Launch Guide — everything you and your clients need to know about what we're building, how it works, and what's required to ship it.",
    M,
    M + 132,
    { width: CONTENT_W - 60, lineGap: 3 },
  );

const metaY = M + 220;
doc.roundedRect(M, metaY, CONTENT_W, 150, 8).lineWidth(1).strokeColor(RULE).stroke();
const meta = [
  ["Prepared for", "InvoiceFlow stakeholders & clients"],
  ["Product", "InvoiceFlow — online invoicing SaaS"],
  ["Stage", "Marketing site live; building the product"],
  ["Stack", "TypeScript · React · Supabase · Polar.sh · Stripe · Resend · Vercel"],
  ["Date", "June 2026"],
];
let my = metaY + 16;
meta.forEach(([k, v]) => {
  doc.font(FB).fontSize(10).fillColor(DARK).text(k, M + 16, my, { width: 120, continued: false });
  doc.font(F).fontSize(10).fillColor(INK).text(v, M + 145, my, { width: CONTENT_W - 160 });
  my += 25;
});
doc
  .font(FI)
  .fontSize(8.5)
  .fillColor("#8a8d98")
  .text(
    "Confidential — for internal and client use. Companion technical docs: PRODUCT_PLAN.md, SETUP_GUIDE.md, API.md.",
    M,
    metaY + 168,
    { width: CONTENT_W },
  );

// ── 1. EXECUTIVE SUMMARY ─────────────────────────────────────────────────────
doc.addPage();
h2("1. Executive summary");
para(
  "InvoiceFlow is a fast, focused online invoicing platform for freelancers, agencies, and small finance teams. Users create polished, branded invoices, send them by email with a built-in payment link, and get paid faster through automated reminders — all from a clean, Linear-grade dashboard.",
);
para(
  "The public marketing website is already built and deployable. This guide covers building the actual product: a secure, multi-tenant SaaS with accounts, subscription billing, online payments, automation, and a public API — engineered with modern, scalable best practices in TypeScript.",
);
callout(
  'What "done" looks like (v1): a customer signs up, creates their organization, adds clients, issues invoices, gets paid online, and is billed monthly for their plan — with email automation and a documented API, on infrastructure that scales automatically.',
);
h3("Who this is for");
bullets([
  "You (owner): understand scope, timeline, costs, and exactly what to set up.",
  "Your clients / customers: understand what the product does, how data is protected, and how billing & payments work.",
]);

// ── 2. PRODUCT ───────────────────────────────────────────────────────────────
h2("2. What the product does");
table(
  ["Capability", "Description"],
  [
    ["Accounts & teams", "Sign up, create an organization, invite teammates with roles (owner, admin, member, viewer)."],
    ["Clients", "Manage customers, contacts, addresses, and payment terms with full invoice history."],
    ["Invoices", "Branded invoices with line items, automatic VAT/tax, multi-currency totals, and PDF export."],
    ["Send & get paid", "Email invoices with a secure online payment link; clients pay by card/bank; status flips to paid."],
    ["Automation", "Scheduled reminders before/after due dates; automatic overdue flagging."],
    ["Dashboard", "Live revenue, outstanding balances, and overdue counts at a glance."],
    ["Subscriptions", "Self-serve plans (Starter free, Pro, Business) with upgrade/downgrade and tax handled for you."],
    ["Public API", "Programmatic access to clients, invoices, and payments for integrations."],
  ],
  [0.26, 0.74],
);

// ── 3. ARCHITECTURE ──────────────────────────────────────────────────────────
h2("3. How it works (architecture)");
para(
  "The product is built as a single, typed system with one shared business-logic core serving three entry points: the app UI, a public API, and payment webhooks. It runs on serverless infrastructure that scales automatically with demand.",
);
table(
  ["Layer", "Technology", "Role"],
  [
    ["Web app", "React + Vite + Tailwind", "The dashboard & marketing site (already built)."],
    ["API", "tRPC + REST (TypeScript)", "Typed first-party API + public REST API for integrations."],
    ["Database", "Supabase Postgres", "All data, isolated per organization with row-level security."],
    ["Authentication", "Supabase Auth", "Email, magic link, and Google sign-in with secure tokens."],
    ["Subscriptions", "Polar.sh", "Bills customers for their plan; handles sales tax/VAT as merchant of record."],
    ["Invoice payments", "Stripe", "Lets your customers' clients pay invoices online by card/bank."],
    ["Email", "Resend", "Invoices, receipts, reminders, and team invites."],
    ["Files", "Supabase Storage", "Stores generated invoice PDFs securely."],
    ["Hosting & jobs", "Vercel + Vercel Cron", "Global serverless hosting and scheduled automation."],
  ],
  [0.2, 0.27, 0.53],
);
h3("Engineering principles");
bullets([
  "One service layer, three doors. App, API, and webhooks share the same validated logic — no duplication.",
  "Multi-tenant & isolated. Every record belongs to an organization; the database guarantees isolation.",
  "Stateless & serverless. Scales horizontally and automatically; no servers to babysit.",
  "Typed end to end. TypeScript + schema validation catch errors before production.",
]);

// ── 4. SECURITY ──────────────────────────────────────────────────────────────
h2("4. Security & data protection");
bullets([
  "Per-tenant isolation enforced at the database level (row-level security).",
  "Secure auth via Supabase (industry-standard JWTs); secrets never in the browser.",
  "API keys stored hashed, shown once, scoped, and revocable.",
  "Verified, idempotent webhooks for all payment events.",
  "Input validation on every request; rate limiting on sensitive routes.",
  "Encrypted in transit and at rest; secrets managed in Vercel/Supabase, not in code.",
  "A security review is run before every release.",
]);

// ── 5. SETUP ─────────────────────────────────────────────────────────────────
h2("5. What you need to set up & connect");
para(
  "To go live, a few third-party accounts must be created and connected. Full click-by-click steps are in docs/SETUP_GUIDE.md; this is the summary and the order to do them in.",
);
table(
  ["Service", "Purpose", "What you provide", "Order"],
  [
    ["Supabase", "Database, auth, file storage", "Project URL + keys + DB connection", "1st"],
    ["Resend", "Sending email", "API key + verified sending domain", "2nd"],
    ["Polar.sh", "Subscription billing", "3 products + access token", "3rd"],
    ["Stripe", "Invoice payments", "API keys + webhook secret", "4th"],
    ["Vercel", "Hosting + automation", "Import repo + env vars + domain", "5th"],
    ["Domain", "Web + email address", "Domain + DNS to Vercel/Resend", "6th"],
    ["Sentry (optional)", "Error monitoring", "Project DSN", "7th"],
  ],
  [0.17, 0.28, 0.4, 0.15],
);
callout(
  "Do Supabase first. As soon as the Supabase project exists and its keys are shared, engineering begins Phase 1. The remaining accounts can be set up in parallel.",
);

// ── 6. ROADMAP ───────────────────────────────────────────────────────────────
h2("6. Build roadmap & timeline");
para(
  "We execute linearly and ship as we go — each phase is independently deployable, so progress is visible continuously rather than in one big-bang release.",
);
table(
  ["Phase", "Outcome", "Needs from you"],
  [
    ["0 — Done", "Marketing website + deployment config", "—"],
    ["1", "Database + accounts + organizations (multi-tenant foundation)", "Supabase keys"],
    ["2", "Core invoicing & clients live in the multi-tenant app", "—"],
    ["3", "Subscription billing (Polar) + online invoice payments (Stripe)", "Polar + Stripe keys"],
    ["4", "Public REST API + API keys + interactive docs", "—"],
    ["5", "Email automation, reminders, PDF storage", "Resend + domain"],
    ["6 — Launch", "Security review, testing, monitoring → go live", "Sentry (optional)"],
    ["7", "Recurring invoices, multi-currency, audit log, analytics", "—"],
  ],
  [0.16, 0.56, 0.28],
);

// ── 7. COSTS ─────────────────────────────────────────────────────────────────
h2("7. Running costs (estimate)");
para("The stack is chosen to start near-free and scale with revenue. Typical early-stage monthly cost:");
table(
  ["Service", "Free tier", "Paid (when you grow)"],
  [
    ["Supabase", "Yes (hobby)", "~$25/mo Pro"],
    ["Vercel", "Yes (hobby)", "~$20/mo Pro"],
    ["Resend", "3,000 emails/mo", "from ~$20/mo"],
    ["Polar.sh", "No monthly fee", "% of subscription revenue (merchant of record)"],
    ["Stripe", "No monthly fee", "~2.9% + 30c per payment"],
    ["Domain", "—", "~$12/year"],
    ["Sentry", "Yes", "from ~$26/mo"],
  ],
  [0.25, 0.3, 0.45],
);
para(
  "Payment processors only charge when you make money. You can launch on free tiers and upgrade as usage grows.",
  { color: MUTED, size: 9.5 },
);

// ── 8. NEXT STEPS ────────────────────────────────────────────────────────────
h2("8. Immediate next steps");
bullets([
  "You: create the Supabase project (Setup Guide §1) and share the keys.",
  "You (parallel): start Resend, Polar, and Stripe accounts.",
  "Engineering: begin Phase 1 (database, auth, organizations) once Supabase is ready.",
  "Together: review each phase as it ships; adjust scope toward launch.",
]);
gap(10);
doc
  .font(FI)
  .fontSize(8.5)
  .fillColor("#8a8d98")
  .text(
    "InvoiceFlow — Product & Launch Guide. Generated from the project repository. Full technical detail in PRODUCT_PLAN.md, SETUP_GUIDE.md, and API.md.",
    M,
    doc.y,
    { width: CONTENT_W },
  );

doc.end();
console.log("Wrote", OUT);
