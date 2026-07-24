/*
 * Hermite Labs — the parent site (hermitelabs.com).
 *
 * The umbrella brand over Hermite Flow and the wider suite. Styled after the
 * Composio design reference (composio/DESIGN.md): electric-blue voltage, a
 * central spotlight, terminal-adjacent panels. Theme-aware via the `.mkt`
 * token scope, so light and dark both work; the accent stays electric blue.
 */
import { useEffect } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  Bot,
  KeyRound,
  Cloud,
  Wallet,
  BarChart3,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Container, MButton } from "@/marketing/primitives";
import { FLOW_URL } from "@/lib/host";

const toggleMkt =
  "text-[var(--mkt-ink-subtle)] hover:text-[var(--mkt-ink)] hover:bg-[var(--mkt-surface-3)]";

type Product = {
  icon: typeof FileText;
  name: string;
  category: string;
  domain: string;
  href?: string;
  blurb: string;
  live?: boolean;
};

const PRODUCTS: Product[] = [
  {
    icon: FileText,
    name: "Hermite Flow",
    category: "CRM + Invoicing",
    domain: "flow.hermitelabs.com",
    href: FLOW_URL,
    blurb:
      "Turn bookings into paid invoices automatically. A CRM and billing engine built for creative studios.",
    live: true,
  },
  {
    icon: Bot,
    name: "Hermite AI",
    category: "AI tools",
    domain: "ai.hermitelabs.com",
    blurb: "Copywriting, replies, and agents that plug into everything you do.",
  },
  {
    icon: KeyRound,
    name: "Hermite Auth",
    category: "Authentication",
    domain: "auth.hermitelabs.com",
    blurb: "One secure sign-in across the whole Hermite Labs suite. SSO-ready.",
  },
  {
    icon: Cloud,
    name: "Hermite Cloud",
    category: "Cloud services",
    domain: "cloud.hermitelabs.com",
    blurb: "Storage, delivery, and hosting for your files, galleries, and sites.",
  },
  {
    icon: Wallet,
    name: "Hermite Finance",
    category: "Smart budgeting",
    domain: "finance.hermitelabs.com",
    blurb: "AI budgeting and money tips built for an irregular creative income.",
  },
  {
    icon: BarChart3,
    name: "Hermite Analytics",
    category: "Business intelligence",
    domain: "analytics.hermitelabs.com",
    blurb: "Product and revenue analytics — a PostHog for your studio.",
  },
];

function Wordmark() {
  return (
    <a
      href="/"
      className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-[var(--mkt-ink)]"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--mkt-primary)] text-[13px] font-bold text-white">
        H
      </span>
      Hermite Labs
    </a>
  );
}

export default function HermiteLabs() {
  useEffect(() => {
    document.title = "Hermite Labs — software for creative businesses";
  }, []);

  return (
    <div className="mkt min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--mkt-hairline-soft)] bg-[var(--mkt-canvas)]/80 backdrop-blur-xl">
        <Container className="flex h-14 items-center justify-between gap-4">
          <Wordmark />
          <div className="flex items-center gap-2">
            <ThemeToggle className={toggleMkt} />
            <MButton variant="primary" size="sm" href={FLOW_URL}>
              Open Flow
              <ArrowUpRight className="h-4 w-4" />
            </MButton>
          </div>
        </Container>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-30 blur-[130px]"
          style={{
            background:
              "radial-gradient(circle, var(--mkt-primary-soft), transparent 70%)",
          }}
        />
        <Container className="relative pt-24 pb-16 text-center sm:pt-32">
          <span className="inline-block rounded-full border border-[var(--mkt-hairline)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--mkt-primary-hover)]">
            By Gaffy Studios
          </span>
          <h1 className="mkt-display mx-auto mt-6 max-w-[18ch] text-[clamp(40px,7vw,80px)] text-[var(--mkt-ink)]">
            Software for creative businesses
          </h1>
          <p className="mx-auto mt-6 max-w-[58ch] text-[clamp(17px,2vw,20px)] leading-relaxed text-[var(--mkt-ink-subtle)]">
            Hermite Labs builds the tools that run a modern studio — billing,
            AI, auth, cloud, finance, and analytics — under one account and one
            design language. It starts with Hermite Flow.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <MButton size="lg" href={FLOW_URL}>
              Start with Hermite Flow
              <ArrowRight className="h-4 w-4" />
            </MButton>
            <MButton variant="secondary" size="lg" href="#products">
              Explore the suite
            </MButton>
          </div>
        </Container>
      </section>

      {/* Products */}
      <section id="products" className="py-16 sm:py-24">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="mkt-display text-[clamp(26px,4vw,40px)] text-[var(--mkt-ink)]">
              One suite, every part of the business
            </h2>
            <p className="mx-auto mt-3 max-w-[52ch] text-[16px] text-[var(--mkt-ink-subtle)]">
              Flow is live today. The rest of the suite is on the way.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map(p => {
              const Card = (
                <div
                  className="flex h-full flex-col rounded-2xl border p-6 transition-colors"
                  style={{
                    borderColor: p.live
                      ? "var(--mkt-primary)"
                      : "var(--mkt-hairline)",
                    background: "var(--mkt-surface-1)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        background: p.live
                          ? "color-mix(in oklab, var(--mkt-primary) 16%, transparent)"
                          : "var(--mkt-surface-3)",
                        color: p.live
                          ? "var(--mkt-primary-hover)"
                          : "var(--mkt-ink-subtle)",
                      }}
                    >
                      <p.icon className="h-5 w-5" />
                    </span>
                    <span
                      className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest"
                      style={{
                        borderColor: "var(--mkt-hairline)",
                        color: p.live
                          ? "var(--mkt-success)"
                          : "var(--mkt-ink-tertiary)",
                      }}
                    >
                      {p.live ? "Live" : "Coming soon"}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[18px] font-semibold text-[var(--mkt-ink)]">
                    {p.name}
                  </h3>
                  <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--mkt-primary-hover)]">
                    {p.category}
                  </p>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[var(--mkt-ink-subtle)]">
                    {p.blurb}
                  </p>
                  <p className="mt-4 flex items-center gap-1 font-mono text-[12px] text-[var(--mkt-ink-tertiary)]">
                    {p.domain}
                    {p.href ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
                  </p>
                </div>
              );
              return p.href ? (
                <a
                  key={p.name}
                  href={p.href}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mkt-primary)]"
                >
                  {Card}
                </a>
              ) : (
                <div key={p.name}>{Card}</div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--mkt-hairline-soft)] py-10">
        <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Wordmark />
          <span className="text-[12px] text-[var(--mkt-ink-tertiary)]">
            © {new Date().getFullYear()} Hermite Labs · Gaffy Studios
          </span>
        </Container>
      </footer>
    </div>
  );
}
