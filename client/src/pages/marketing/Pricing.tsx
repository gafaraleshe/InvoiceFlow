import { useState } from "react";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  Container,
  Eyebrow,
  MButton,
  Pill,
  SectionHeading,
} from "@/marketing/primitives";
import { ArrowRight, Check, Minus, Sparkles } from "lucide-react";

type Billing = "monthly" | "annual";

type Tier = {
  name: string;
  description: string;
  monthly: number | null;
  annual: number | null;
  priceLabel?: string;
  priceNote?: string;
  cta: string;
  ctaHref?: string;
  highlighted: boolean;
  features: string[];
};

const tiers: Tier[] = [
  {
    name: "Starter",
    description:
      "For freelancers and side projects getting their billing in order.",
    monthly: 0,
    annual: 0,
    cta: "Start for free",
    highlighted: false,
    features: [
      "Up to 5 clients",
      "20 invoices / month",
      "Branded PDF invoices",
      "Email delivery",
      "Basic dashboard",
    ],
  },
  {
    name: "Pro",
    description: "For growing teams that need automation and deeper insight.",
    monthly: 19,
    annual: 15,
    cta: "Start 14-day trial",
    highlighted: true,
    features: [
      "Unlimited clients",
      "Unlimited invoices",
      "Automated payment reminders",
      "Hosted payment links",
      "Multi-currency & VAT",
      "Revenue analytics",
      "Up to 5 team members",
    ],
  },
  {
    name: "Business",
    description: "For finance teams that need control, roles, and scale.",
    monthly: 49,
    annual: 39,
    cta: "Start 14-day trial",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Role-based access control",
      "Approval workflows",
      "REST API & webhooks",
      "Audit log & exports",
      "Priority support",
      "Unlimited team members",
    ],
  },
  {
    name: "Enterprise",
    description:
      "For finance and RevOps teams that run billing alongside their CRM.",
    monthly: null,
    annual: null,
    priceLabel: "Custom",
    priceNote: "annual contract",
    cta: "Talk to sales",
    ctaHref: "/contact",
    highlighted: false,
    features: [
      "Everything in Business",
      "Salesforce & HubSpot sync",
      "Two-way contact & deal sync",
      "SSO / SAML & SCIM provisioning",
      "Dedicated success manager",
      "99.9% uptime SLA",
    ],
  },
];

const comparison: {
  group: string;
  rows: { label: string; values: (boolean | string)[] }[];
}[] = [
  {
    group: "Invoicing",
    rows: [
      {
        label: "Invoices per month",
        values: ["20", "Unlimited", "Unlimited", "Unlimited"],
      },
      { label: "Clients", values: ["5", "Unlimited", "Unlimited", "Unlimited"] },
      { label: "Branded PDF invoices", values: [true, true, true, true] },
      { label: "Multi-currency & VAT", values: [false, true, true, true] },
      { label: "Recurring invoices", values: [false, true, true, true] },
    ],
  },
  {
    group: "Payments & automation",
    rows: [
      { label: "Hosted payment links", values: [false, true, true, true] },
      { label: "Automated reminders", values: [false, true, true, true] },
      { label: "Approval workflows", values: [false, false, true, true] },
    ],
  },
  {
    group: "CRM & integrations",
    rows: [
      { label: "REST API access", values: [false, false, true, true] },
      { label: "Webhooks & events", values: [false, false, true, true] },
      {
        label: "Salesforce & HubSpot sync",
        values: [false, false, false, true],
      },
      {
        label: "Two-way contact & deal sync",
        values: [false, false, false, true],
      },
      {
        label: "Pipedrive & Zoho connectors",
        values: [false, false, false, true],
      },
    ],
  },
  {
    group: "Team & security",
    rows: [
      { label: "Team members", values: ["1", "5", "Unlimited", "Unlimited"] },
      { label: "Role-based access", values: [false, false, true, true] },
      { label: "Audit log & exports", values: [false, false, true, true] },
      { label: "SSO / SAML & SCIM", values: [false, false, false, true] },
      {
        label: "Dedicated success manager",
        values: [false, false, false, true],
      },
      { label: "Uptime SLA", values: [false, false, false, "99.9%"] },
    ],
  },
];

const faqs = [
  {
    q: "Can I change plans later?",
    a: "Yes — upgrade or downgrade at any time. Changes are prorated automatically and take effect immediately.",
  },
  {
    q: "Is there a free trial?",
    a: "Every paid plan starts with a 14-day free trial. No credit card required to begin, and you keep your data if you decide not to continue.",
  },
  {
    q: "What payment methods do you support?",
    a: "Your clients can pay by card or bank transfer through hosted payment links. You can pay for InvoiceFlow with any major card.",
  },
  {
    q: "Do you charge per invoice?",
    a: "No. Paid plans include unlimited invoices. We never take a percentage of the payments you collect.",
  },
  {
    q: "Which CRMs does the Enterprise plan integrate with?",
    a: "Enterprise includes native two-way sync with Salesforce and HubSpot, plus connectors for Pipedrive and Zoho. Clients, contacts, deals, and paid-invoice events flow both ways automatically. Pro and Business plans can build any custom integration on our REST API and webhooks.",
  },
  {
    q: "How does Enterprise pricing work?",
    a: "Enterprise is a custom annual contract priced on your seat count, integration needs, and support level (dedicated CSM, SSO/SAML, SCIM provisioning, and a 99.9% uptime SLA). Talk to sales for a tailored quote.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel in one click from your billing settings — no emails, no retention calls.",
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-[13px] text-[#d0d6e0]">{value}</span>;
  }
  return value ? (
    <Check className="mx-auto h-4 w-4 text-[#828fff]" />
  ) : (
    <Minus className="mx-auto h-4 w-4 text-[#3e3e44]" />
  );
}

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>("annual");

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden pt-20 pb-10">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[440px] w-[760px] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(94,106,210,0.5), transparent 70%)",
          }}
        />
        <Container className="relative flex flex-col items-center text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="mkt-display mt-4 max-w-[18ch] text-[clamp(36px,6vw,64px)] text-[#f7f8f8]">
            Simple pricing that scales with you
          </h1>
          <p className="mt-5 max-w-[52ch] text-[18px] leading-relaxed text-[#8a8f98]">
            Start free, then pick the plan that fits. No per-invoice fees, no
            surprises — just everything you need to get paid.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-[#23252a] bg-[#0f1011] p-1">
              {(["monthly", "annual"] as Billing[]).map(option => (
                <button
                  key={option}
                  onClick={() => setBilling(option)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[13px] font-medium capitalize transition-colors",
                    billing === option
                      ? "bg-[#141516] text-[#f7f8f8] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                      : "text-[#8a8f98] hover:text-[#d0d6e0]"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <Pill className="border-[#27a644]/30 bg-[#27a644]/10 text-[#7fe0a0]">
              Save 20%
            </Pill>
          </div>
        </Container>
      </section>

      {/* Tiers */}
      <section className="pb-20">
        <Container>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map(tier => {
              const isCustom = tier.monthly === null;
              const price = billing === "monthly" ? tier.monthly : tier.annual;
              return (
                <div
                  key={tier.name}
                  className={cn(
                    "relative flex flex-col rounded-2xl border p-7",
                    tier.highlighted
                      ? "border-[#5e6ad2]/50 bg-[#141516] shadow-[0_0_0_1px_rgba(94,106,210,0.2),0_40px_120px_-60px_rgba(94,106,210,0.6)]"
                      : "border-[#23252a] bg-[#0f1011]"
                  )}
                >
                  {tier.highlighted ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5e6ad2] px-3 py-1 text-[12px] font-medium text-white">
                        <Sparkles className="h-3 w-3" /> Most popular
                      </span>
                    </div>
                  ) : null}

                  <div className="text-[18px] font-semibold tracking-tight text-[#f7f8f8]">
                    {tier.name}
                  </div>
                  <p className="mt-2 min-h-[40px] text-[14px] leading-relaxed text-[#8a8f98]">
                    {tier.description}
                  </p>

                  <div className="mt-5 flex items-end gap-1">
                    {isCustom ? (
                      <span className="mkt-display text-[44px] text-[#f7f8f8]">
                        {tier.priceLabel}
                      </span>
                    ) : (
                      <>
                        <span className="mkt-display text-[44px] text-[#f7f8f8]">
                          £{price}
                        </span>
                        <span className="mb-2 text-[14px] text-[#62666d]">
                          {price === 0 ? "forever" : "/ mo"}
                        </span>
                      </>
                    )}
                  </div>
                  {isCustom ? (
                    <div className="mt-1 text-[12px] text-[#62666d]">
                      {tier.priceNote}
                    </div>
                  ) : price && price > 0 ? (
                    <div className="mt-1 text-[12px] text-[#62666d]">
                      {billing === "annual"
                        ? "billed annually"
                        : "billed monthly"}
                    </div>
                  ) : (
                    <div className="mt-1 text-[12px] text-[#62666d]">
                      no card required
                    </div>
                  )}

                  <MButton
                    variant={tier.highlighted ? "primary" : "secondary"}
                    size="lg"
                    href={tier.ctaHref ?? getLoginUrl()}
                    className="mt-6 w-full"
                  >
                    {tier.cta}
                    <ArrowRight className="h-4 w-4" />
                  </MButton>

                  <ul className="mt-7 space-y-3">
                    {tier.features.map(feature => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-[14px] text-[#d0d6e0]"
                      >
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#5e6ad2]/15">
                          <Check className="h-2.5 w-2.5 text-[#828fff]" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Comparison table */}
      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="Compare plans"
            title="Every detail, side by side"
          />
          <div className="mt-12 overflow-hidden rounded-2xl border border-[#23252a]">
            {/* Sticky header */}
            <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr] border-b border-[#23252a] bg-[#0f1011]">
              <div className="px-5 py-4 text-[13px] font-medium text-[#8a8f98]">
                Features
              </div>
              {tiers.map(t => (
                <div
                  key={t.name}
                  className={cn(
                    "px-3 py-4 text-center text-[14px] font-semibold",
                    t.highlighted ? "text-[#828fff]" : "text-[#f7f8f8]"
                  )}
                >
                  {t.name}
                </div>
              ))}
            </div>

            {comparison.map(section => (
              <div key={section.group}>
                <div className="bg-[#0b0b0c] px-5 py-2.5 text-[12px] font-medium uppercase tracking-wide text-[#62666d]">
                  {section.group}
                </div>
                {section.rows.map(row => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr] items-center border-t border-[#161719]"
                  >
                    <div className="px-5 py-3 text-[14px] text-[#d0d6e0]">
                      {row.label}
                    </div>
                    {row.values.map((v, i) => (
                      <div
                        key={i}
                        className={cn(
                          "px-3 py-3 text-center",
                          tiers[i].highlighted && "bg-[#5e6ad2]/[0.04]"
                        )}
                      >
                        <CellValue value={v} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 pb-28">
        <Container className="max-w-[820px]">
          <SectionHeading eyebrow="FAQ" title="Questions, answered" />
          <div className="mt-12 divide-y divide-[#1c1d20] border-y border-[#1c1d20]">
            {faqs.map(faq => (
              <details key={faq.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[16px] font-medium text-[#f7f8f8] [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="ml-4 text-[#62666d] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-[#8a8f98]">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-14 rounded-2xl border border-[#23252a] bg-[#0f1011] p-8 text-center">
            <h3 className="text-[20px] font-semibold tracking-tight text-[#f7f8f8]">
              Still deciding?
            </h3>
            <p className="mx-auto mt-2 max-w-[48ch] text-[15px] text-[#8a8f98]">
              Talk to our team and we'll help you find the right plan — or just
              start free and upgrade whenever you're ready.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MButton size="lg" href={getLoginUrl()}>
                Start for free
                <ArrowRight className="h-4 w-4" />
              </MButton>
              <MButton variant="secondary" size="lg" href="/contact">
                Talk to sales
              </MButton>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
