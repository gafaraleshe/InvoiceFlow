import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import { Container, MButton } from "@/marketing/primitives";
import {
  ArrowRight,
  BookOpen,
  Rocket,
  Building2,
  Users,
  FileText,
  CreditCard,
  Bell,
  Gem,
  Code2,
  Server,
  HelpCircle,
} from "lucide-react";
import type { ReactNode } from "react";

/* ── doc primitives ─────────────────────────────────────────────────────── */

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-[5px] border border-[#23252a] bg-[#141516] px-1.5 py-0.5 font-mono text-[13px] text-[#aab2f5]">
      {children}
    </code>
  );
}

function Pre({ children }: { children: ReactNode }) {
  return (
    <pre className="my-4 overflow-x-auto rounded-xl border border-[#23252a] bg-[#0c0c0e] p-4 font-mono text-[12.5px] leading-relaxed text-[#d0d6e0]">
      {children}
    </pre>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 rounded-lg border-l-2 border-[#5e6ad2] bg-[#5e6ad2]/[0.06] py-3 pl-4 pr-4 text-[14px] leading-relaxed text-[#d0d6e0]">
      {children}
    </div>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-[15px] leading-relaxed text-[#c2c6cf]">
      {children}
    </p>
  );
}

function H({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="mkt-display scroll-mt-24 text-[26px] text-[#f7f8f8] [&:not(:first-child)]:mt-2"
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-2 mt-7 text-[16px] font-semibold tracking-tight text-[#f7f8f8]">
      {children}
    </h3>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: typeof BookOpen;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="scroll-mt-24 border-b border-[#161719] py-10 first:pt-0 last:border-0">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#23252a] bg-[#141516] text-[#828fff]">
          <Icon className="h-4 w-4" />
        </span>
        <H id={id}>{title}</H>
      </div>
      {children}
    </section>
  );
}

function FeatureList({ rows }: { rows: [string, string][] }) {
  return (
    <ul className="my-4 space-y-2.5">
      {rows.map(([term, desc]) => (
        <li key={term} className="text-[15px] leading-relaxed text-[#c2c6cf]">
          <span className="font-medium text-[#f7f8f8]">{term}</span>
          <span className="text-[#8a8f98]"> — {desc}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── navigation model ───────────────────────────────────────────────────── */

const nav: { group: string; items: { id: string; label: string }[] }[] = [
  {
    group: "Overview",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "quickstart", label: "Quickstart" },
    ],
  },
  {
    group: "Concepts",
    items: [
      { id: "organizations", label: "Organizations & teams" },
      { id: "clients", label: "Clients" },
      { id: "invoices", label: "Invoices" },
      { id: "payments", label: "Payments" },
      { id: "automation", label: "Automation" },
    ],
  },
  {
    group: "Platform",
    items: [{ id: "plans", label: "Plans & billing" }],
  },
  {
    group: "Developers",
    items: [
      { id: "api", label: "API reference" },
      { id: "setup", label: "Setup & deploy" },
    ],
  },
  { group: "Help", items: [{ id: "faq", label: "FAQ" }] },
];

const allIds = nav.flatMap(g => g.items.map(i => i.id));

/* ── page ───────────────────────────────────────────────────────────────── */

export default function Docs() {
  const [active, setActive] = useState<string>(allIds[0]);
  const observer = useRef<IntersectionObserver | null>(null);

  // Honor deep links like /docs#api on first load (SPA routing skips this).
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && allIds.includes(hash)) {
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ block: "start" });
        setActive(hash);
      });
    }
  }, []);

  useEffect(() => {
    observer.current?.disconnect();
    const visible = new Map<string, number>();
    observer.current = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
          else visible.delete(e.target.id);
        }
        // pick the section nearest the top that's on screen
        let best: string | null = null;
        for (const id of allIds) {
          if (visible.has(id)) {
            best = id;
            break;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: [0, 1] }
    );
    allIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.current!.observe(el);
    });
    return () => observer.current?.disconnect();
  }, []);

  return (
    <Container className="py-12 sm:py-16">
      {/* header */}
      <div className="mb-10 border-b border-[#1c1d20] pb-8">
        <div className="flex items-center gap-2 text-[13px] text-[#62666d]">
          <BookOpen className="h-3.5 w-3.5" /> Documentation
        </div>
        <h1 className="mkt-display mt-3 text-[clamp(32px,5vw,48px)] text-[#f7f8f8]">
          InvoiceFlow docs
        </h1>
        <p className="mt-3 max-w-[64ch] text-[17px] leading-relaxed text-[#8a8f98]">
          Everything you need to use InvoiceFlow — core concepts, plans, the
          REST API, and how the platform is built and deployed.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* sidebar */}
        <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
          <nav className="space-y-6">
            {nav.map(group => (
              <div key={group.group}>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#62666d]">
                  {group.group}
                </div>
                <ul className="space-y-0.5 border-l border-[#1c1d20]">
                  {group.items.map(item => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className={cn(
                          "-ml-px block border-l py-1.5 pl-3 text-[14px] transition-colors",
                          active === item.id
                            ? "border-[#5e6ad2] text-[#f7f8f8]"
                            : "border-transparent text-[#8a8f98] hover:text-[#d0d6e0]"
                        )}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* content */}
        <article className="min-w-0 max-w-[760px]">
          <Section id="introduction" icon={BookOpen} title="Introduction">
            <P>
              InvoiceFlow is a fast, focused invoicing platform for freelancers,
              agencies, and small finance teams. You create branded invoices,
              send them with a built-in payment link, and get paid faster — from
              one clean dashboard.
            </P>
            <P>
              These docs cover how the product works day to day, what each plan
              includes, the public REST API for integrations, and how the
              platform is built and deployed. New to InvoiceFlow? Start with the{" "}
              <a href="#quickstart" className="text-[#828fff] hover:underline">
                Quickstart
              </a>
              .
            </P>
          </Section>

          <Section id="quickstart" icon={Rocket} title="Quickstart">
            <P>Get your first invoice out the door in under two minutes.</P>
            <ol className="my-4 space-y-3 text-[15px] leading-relaxed text-[#c2c6cf]">
              {[
                [
                  "Create your account",
                  "Sign up with email or Google and create your organization.",
                ],
                [
                  "Add a client",
                  "Go to Clients → New, and enter their name, email, and payment terms.",
                ],
                [
                  "Create an invoice",
                  "Invoices → New: pick the client, add line items, set the due date. Totals and VAT calculate automatically.",
                ],
                [
                  "Send & get paid",
                  "Hit Send. Your client receives a branded email with a secure payment link and pays online.",
                ],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5e6ad2]/15 text-[12px] font-semibold text-[#828fff]">
                    {i + 1}
                  </span>
                  <span>
                    <span className="font-medium text-[#f7f8f8]">{t}</span> —{" "}
                    {d}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-5">
              <MButton href={getLoginUrl()}>
                Start for free <ArrowRight className="h-4 w-4" />
              </MButton>
            </div>
          </Section>

          <Section
            id="organizations"
            icon={Building2}
            title="Organizations & teams"
          >
            <P>
              Every account belongs to an <strong>organization</strong> — your
              workspace for clients, invoices, settings, and billing. Invite
              teammates and assign roles to control what they can do.
            </P>
            <FeatureList
              rows={[
                [
                  "Owner",
                  "full access, including billing and deleting the organization",
                ],
                ["Admin", "manage members, API keys, and settings"],
                ["Member", "create and edit clients and invoices"],
                ["Viewer", "read-only access to clients and invoices"],
              ]}
            />
            <Note>
              Data is fully isolated per organization at the database level —
              one organization can never see another's data.
            </Note>
          </Section>

          <Section id="clients" icon={Users} title="Clients">
            <P>
              A client is whoever you bill. Each client stores contact details,
              billing address, default <Code>payment terms</Code> (e.g. Net 30),
              and notes — plus their full invoice history.
            </P>
            <FeatureList
              rows={[
                [
                  "Payment terms",
                  "default number of days until an invoice is due",
                ],
                [
                  "Invoice history",
                  "every invoice for a client, with live status",
                ],
                [
                  "Safe deletes",
                  "a client with invoices can't be deleted by accident",
                ],
              ]}
            />
          </Section>

          <Section id="invoices" icon={FileText} title="Invoices">
            <P>
              Invoices move through a simple lifecycle and calculate themselves
              as you type.
            </P>
            <H3>Statuses</H3>
            <FeatureList
              rows={[
                ["Draft", "being edited; not yet sent"],
                ["Sent", "emailed to the client and awaiting payment"],
                ["Paid", "payment received (set automatically or manually)"],
                ["Overdue", "past the due date and still unpaid"],
              ]}
            />
            <H3>Numbering & totals</H3>
            <P>
              Invoice numbers are generated per organization in sequence (for
              example <Code>INV-2026-001</Code>). Subtotals, tax/VAT, and totals
              are computed automatically from line items, in your chosen
              currency. Every invoice can be exported as a branded PDF.
            </P>
          </Section>

          <Section id="payments" icon={CreditCard} title="Payments">
            <P>
              When you send an invoice you can attach a secure hosted payment
              link. Your client pays by card or bank transfer; the invoice flips
              to <Code>paid</Code> automatically and a receipt is emailed.
            </P>
            <Note>
              Online payments are powered by Stripe. InvoiceFlow never takes a
              percentage of the payments you collect.
            </Note>
          </Section>

          <Section id="automation" icon={Bell} title="Automation">
            <P>
              Stop chasing invoices. InvoiceFlow runs scheduled jobs that send
              reminders and keep statuses accurate without any manual work.
            </P>
            <FeatureList
              rows={[
                [
                  "Reminders",
                  "gentle nudges before the due date and firm follow-ups after",
                ],
                [
                  "Overdue sweep",
                  "sent invoices automatically flip to overdue once past due",
                ],
                [
                  "Auto paid",
                  "status updates the instant a payment is confirmed",
                ],
              ]}
            />
          </Section>

          <Section id="plans" icon={Gem} title="Plans & billing">
            <P>
              InvoiceFlow is free to start. Upgrade for automation, the API, and
              team seats. See the{" "}
              <Link href="/pricing" className="text-[#828fff] hover:underline">
                pricing page
              </Link>{" "}
              for current prices.
            </P>
            <FeatureList
              rows={[
                [
                  "Starter (free)",
                  "up to 5 clients, 20 invoices/month, branded PDFs",
                ],
                [
                  "Pro",
                  "unlimited clients & invoices, reminders, payment links, analytics, 5 seats",
                ],
                [
                  "Business",
                  "everything in Pro plus roles, approvals, audit log, and priority support",
                ],
              ]}
            />
            <P>
              Subscriptions and tax are handled by Polar.sh; manage or cancel
              your plan anytime from billing settings.
            </P>
          </Section>

          <Section id="api" icon={Code2} title="API reference">
            <P>
              The public REST API lets you manage clients, invoices, and
              payments programmatically. It's versioned at <Code>/api/v1</Code>{" "}
              and authenticated with an API key.
            </P>
            <H3>Authentication</H3>
            <P>
              Create a key in <strong>Settings → API keys</strong> (admins
              only). Send it as a bearer token. The full key is shown once and
              stored hashed.
            </P>
            <Pre>{`Authorization: Bearer ifk_live_xxxxxxxxxxxxxxxxxxxx`}</Pre>
            <H3>Create an invoice</H3>
            <Pre>{`curl https://YOURDOMAIN/api/v1/invoices \\
  -H "Authorization: Bearer ifk_live_..." \\
  -H "Idempotency-Key: <uuid>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_id": "c_123",
    "currency": "GBP",
    "due_date": "2026-07-23",
    "tax_rate": 20,
    "line_items": [
      { "description": "Website design", "quantity": 1, "unit_price": "6500.00" }
    ]
  }'`}</Pre>
            <H3>Endpoints</H3>
            <div className="my-4 overflow-hidden rounded-xl border border-[#23252a]">
              {[
                ["GET", "/v1/clients", "List clients"],
                ["POST", "/v1/clients", "Create a client"],
                ["GET", "/v1/invoices", "List invoices"],
                ["POST", "/v1/invoices", "Create an invoice"],
                ["POST", "/v1/invoices/{id}/send", "Email the invoice"],
                [
                  "POST",
                  "/v1/invoices/{id}/pay-link",
                  "Create a Stripe pay link",
                ],
                ["GET", "/v1/payments", "List payments"],
              ].map(([m, path, desc], i) => (
                <div
                  key={path as string}
                  className={cn(
                    "grid grid-cols-[56px_minmax(0,1fr)] items-center gap-3 px-4 py-2.5 text-[13px] sm:grid-cols-[56px_240px_minmax(0,1fr)]",
                    i > 0 && "border-t border-[#161719]"
                  )}
                >
                  <span className="font-mono text-[11px] font-semibold text-[#7fe0a0]">
                    {m}
                  </span>
                  <span className="truncate font-mono text-[#aab2f5]">
                    {path}
                  </span>
                  <span className="hidden text-[#8a8f98] sm:block">{desc}</span>
                </div>
              ))}
            </div>
            <Note>
              Responses are JSON with cursor pagination, idempotency keys on
              writes, and rate-limit headers. The full contract — including the
              OpenAPI spec — lives in <Code>docs/API.md</Code> in the
              repository.
            </Note>
          </Section>

          <Section id="setup" icon={Server} title="Setup & deploy">
            <P>
              InvoiceFlow is built in TypeScript end to end: React + Vite on the
              front end, a tRPC + REST API, Supabase (Postgres, Auth, Storage),
              and it deploys to Vercel. Run it locally with:
            </P>
            <Pre>{`git clone https://github.com/gafaraleshe/InvoiceFlow.git
cd InvoiceFlow
pnpm install
cp .env.example .env   # fill in your keys
pnpm dev               # http://localhost:3000`}</Pre>
            <P>
              Connecting Supabase, Resend, Polar.sh, and Stripe is documented
              step by step in <Code>docs/SETUP_GUIDE.md</Code>, and the full
              architecture lives in <Code>docs/PRODUCT_PLAN.md</Code>.
            </P>
            <FeatureList
              rows={[
                [
                  "Supabase",
                  "Postgres database, authentication, and file storage",
                ],
                [
                  "Resend",
                  "transactional email — invoices, receipts, reminders",
                ],
                ["Polar.sh", "subscription billing for InvoiceFlow plans"],
                ["Stripe", "online payment of your customers' invoices"],
                ["Vercel", "serverless hosting and scheduled jobs (Cron)"],
              ]}
            />
          </Section>

          <Section id="faq" icon={HelpCircle} title="FAQ">
            <H3>Is there a free plan?</H3>
            <P>
              Yes. Starter is free forever with no card required. Paid plans
              include a 14-day trial.
            </P>
            <H3>Do you charge per invoice?</H3>
            <P>
              No. Paid plans include unlimited invoices, and we never take a cut
              of the payments you collect.
            </P>
            <H3>Can I use the API on any plan?</H3>
            <P>
              The REST API is available on Pro and Business plans. Generate keys
              from Settings → API keys.
            </P>
            <H3>Where do I get help?</H3>
            <P>
              Reach the team from the{" "}
              <Link href="/contact" className="text-[#828fff] hover:underline">
                contact page
              </Link>{" "}
              — we reply within one business day.
            </P>
          </Section>

          {/* footer CTA */}
          <div className="mt-12 rounded-2xl border border-[#23252a] bg-[#0f1011] p-8 text-center">
            <h3 className="mkt-display text-[24px] text-[#f7f8f8]">
              Ready to send your first invoice?
            </h3>
            <p className="mx-auto mt-3 max-w-[44ch] text-[15px] text-[#8a8f98]">
              Create an account free — no card required.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MButton href={getLoginUrl()}>
                Start for free <ArrowRight className="h-4 w-4" />
              </MButton>
              <MButton variant="secondary" href="/pricing">
                View pricing
              </MButton>
            </div>
          </div>
        </article>
      </div>
    </Container>
  );
}
