import { getLoginUrl } from "@/const";
import {
  Container,
  Eyebrow,
  MButton,
  SectionHeading,
} from "@/marketing/primitives";
import {
  InvoiceComposerMock,
  ProductDashboardMock,
  AutomationMock,
} from "@/marketing/mockups";
import {
  ArrowRight,
  Check,
  FileText,
  Send,
  CreditCard,
  BarChart3,
  Users,
  ShieldCheck,
  Repeat,
  Globe,
  Bell,
  FileDown,
  KeyRound,
  Workflow,
  Plug,
  Webhook,
  RefreshCw,
  Lock,
} from "lucide-react";

const allFeatures = [
  {
    icon: FileText,
    title: "Smart invoice editor",
    body: "Dynamic line items, automatic numbering, and a live PDF preview that updates as you type.",
  },
  {
    icon: Repeat,
    title: "Recurring billing",
    body: "Set it once and let InvoiceFlow issue and send invoices on whatever cadence you need.",
  },
  {
    icon: Globe,
    title: "Multi-currency & VAT",
    body: "Bill clients in their currency with correct VAT, discounts, and rounding handled for you.",
  },
  {
    icon: Bell,
    title: "Automated reminders",
    body: "Friendly nudges and firm follow-ups go out automatically until the invoice is paid.",
  },
  {
    icon: CreditCard,
    title: "Hosted payments",
    body: "Share a clean payment page so clients can settle by card or bank transfer in seconds.",
  },
  {
    icon: BarChart3,
    title: "Revenue analytics",
    body: "Track revenue, outstanding balances, and overdue counts on a real-time dashboard.",
  },
  {
    icon: Users,
    title: "Client management",
    body: "A complete record for every client: contacts, terms, and full invoice history.",
  },
  {
    icon: FileDown,
    title: "PDF & data export",
    body: "Download polished PDFs or export clean data for your accountant any time.",
  },
  {
    icon: KeyRound,
    title: "Roles & permissions",
    body: "Admin and viewer roles keep sensitive billing actions in the right hands.",
  },
  {
    icon: Workflow,
    title: "Approval workflows",
    body: "Route invoices for review before they go out the door on Business plans.",
  },
  {
    icon: Plug,
    title: "CRM sync",
    body: "Native two-way sync with Salesforce and HubSpot keeps clients and deals aligned automatically.",
  },
  {
    icon: Webhook,
    title: "REST API & webhooks",
    body: "Build any workflow on our API, and subscribe to real-time events the moment an invoice is paid.",
  },
  {
    icon: Lock,
    title: "SSO, SAML & SCIM",
    body: "Single sign-on and automated user provisioning for Enterprise teams that need it.",
  },
  {
    icon: ShieldCheck,
    title: "Security & audit",
    body: "OAuth sign-in, encrypted storage, and a full audit log of every change.",
  },
  {
    icon: Send,
    title: "One-click delivery",
    body: "Send by email with a payment link attached, or share a hosted invoice URL.",
  },
];

const crmConnectors = ["Salesforce", "HubSpot", "Pipedrive", "Zoho"];

const crmPoints = [
  "Two-way sync of clients, contacts, and deals — no copy-paste",
  "Push paid-invoice and revenue events straight into your pipeline",
  "Map InvoiceFlow fields to your CRM's custom objects",
  "Real-time webhooks and a full REST API for anything bespoke",
];

const spotlights = [
  {
    eyebrow: "Dashboard",
    title: "Your whole business at a glance",
    body: "Total revenue, outstanding balances, overdue accounts, and recent activity — all on one fast screen. Open it every morning and know exactly where you stand.",
    points: [
      "Live revenue and outstanding totals",
      "Overdue flagging the moment a date passes",
      "Recent invoices with one-click drill-down",
    ],
    mock: <ProductDashboardMock />,
    reverse: false,
  },
  {
    eyebrow: "Create",
    title: "Invoices that look like you mean business",
    body: "A focused editor with live totals and a real-time PDF preview. Add clients, line items, VAT, and discounts — then send in a single click.",
    points: [
      "Auto-numbered, branded invoices",
      "Live VAT and multi-currency totals",
      "Send by email or hosted link",
    ],
    mock: <InvoiceComposerMock />,
    reverse: true,
  },
  {
    eyebrow: "Automate",
    title: "Stop chasing. Start collecting.",
    body: "Configure a reminder schedule once and InvoiceFlow runs the follow-ups for you — flipping invoices to paid the instant the money arrives.",
    points: [
      "Schedule reminders by due date or status",
      "Automatic overdue notices",
      "Instant paid status on payment",
    ],
    mock: <AutomationMock />,
    reverse: false,
  },
];

export default function Features() {
  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden pt-20 pb-12">
        <div className="mkt-grid-bg pointer-events-none absolute inset-0 opacity-50" />
        <Container className="relative flex flex-col items-center text-center">
          <Eyebrow>Features</Eyebrow>
          <h1 className="mkt-display mt-4 max-w-[20ch] text-[clamp(36px,6vw,64px)] text-[#f7f8f8]">
            Everything you need to bill and get paid
          </h1>
          <p className="mt-5 max-w-[56ch] text-[18px] leading-relaxed text-[#8a8f98]">
            One focused workspace for the entire billing lifecycle — from the
            first draft to the final payment, with automation doing the chasing.
          </p>
          <div className="mt-8">
            <MButton size="lg" href={getLoginUrl()}>
              Start for free
              <ArrowRight className="h-4 w-4" />
            </MButton>
          </div>
        </Container>
      </section>

      {/* Spotlights */}
      {spotlights.map(s => (
        <section key={s.title} className="py-20">
          <Container>
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className={s.reverse ? "lg:order-2" : ""}>
                <Eyebrow>{s.eyebrow}</Eyebrow>
                <h2 className="mkt-display mt-4 text-[clamp(26px,3.6vw,40px)] text-[#f7f8f8]">
                  {s.title}
                </h2>
                <p className="mt-5 text-[17px] leading-relaxed text-[#8a8f98]">
                  {s.body}
                </p>
                <ul className="mt-6 space-y-3">
                  {s.points.map(p => (
                    <li
                      key={p}
                      className="flex items-center gap-3 text-[15px] text-[#d0d6e0]"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5e6ad2]/15">
                        <Check className="h-3 w-3 text-[#828fff]" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={s.reverse ? "lg:order-1" : ""}>{s.mock}</div>
            </div>
          </Container>
        </section>
      ))}

      {/* CRM & integrations */}
      <section className="border-t border-[#1c1d20] py-24">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <Eyebrow>Integrations</Eyebrow>
              <h2 className="mkt-display mt-4 text-[clamp(26px,3.6vw,40px)] text-[#f7f8f8]">
                Connect billing to your CRM
              </h2>
              <p className="mt-5 text-[17px] leading-relaxed text-[#8a8f98]">
                On Enterprise, InvoiceFlow syncs both ways with the CRM your
                revenue team already lives in — so a closed deal becomes an
                invoice, and a paid invoice updates the pipeline, without anyone
                rekeying data.
              </p>
              <ul className="mt-6 space-y-3">
                {crmPoints.map(p => (
                  <li
                    key={p}
                    className="flex items-start gap-3 text-[15px] text-[#d0d6e0]"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5e6ad2]/15">
                      <Check className="h-3 w-3 text-[#828fff]" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <MButton variant="secondary" size="lg" href="/contact">
                  Talk to sales
                  <ArrowRight className="h-4 w-4" />
                </MButton>
              </div>
            </div>

            <div className="mkt-panel rounded-2xl p-8">
              <div className="flex items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#23252a] bg-[#141516] text-[#828fff]">
                  <Plug className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2 text-[#62666d]">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#5e6ad2]/50 bg-[#5e6ad2]/10 text-[#828fff]">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-5 text-center text-[13px] text-[#62666d]">
                Two-way sync with the tools you already use
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {crmConnectors.map(name => (
                  <div
                    key={name}
                    className="flex items-center gap-3 rounded-xl border border-[#23252a] bg-[#0f1011] px-4 py-3"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5e6ad2]/15 text-[12px] font-semibold text-[#828fff]">
                      {name[0]}
                    </span>
                    <span className="text-[14px] font-medium text-[#d0d6e0]">
                      {name}
                    </span>
                    <Check className="ml-auto h-4 w-4 text-[#27a644]" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#23252a] px-4 py-3 text-[13px] text-[#8a8f98]">
                <Webhook className="h-4 w-4 text-[#828fff]" />
                + REST API & webhooks for anything custom
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Full grid */}
      <section className="border-t border-[#1c1d20] py-24">
        <Container>
          <SectionHeading
            eyebrow="And much more"
            title="Built for the way modern teams bill"
          />
          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allFeatures.map(f => (
              <div
                key={f.title}
                className="mkt-panel rounded-xl p-6 transition-colors hover:border-[#34343a]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#23252a] bg-[#141516] text-[#828fff]">
                  <f.icon className="h-[18px] w-[18px]" />
                </div>
                <h3 className="mt-4 text-[16px] font-medium tracking-tight text-[#f7f8f8]">
                  {f.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#8a8f98]">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-28">
        <Container>
          <div className="rounded-2xl border border-[#23252a] bg-[#0f1011] px-8 py-14 text-center">
            <h2 className="mkt-display mx-auto max-w-[20ch] text-[clamp(26px,4vw,40px)] text-[#f7f8f8]">
              See it in action
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-[16px] text-[#8a8f98]">
              Create your first invoice in under two minutes. Free to start.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MButton size="lg" href={getLoginUrl()}>
                Start for free
                <ArrowRight className="h-4 w-4" />
              </MButton>
              <MButton variant="secondary" size="lg" href="/pricing">
                View pricing
              </MButton>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
