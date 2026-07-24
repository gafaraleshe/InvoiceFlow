/*
 * Hermite Labs — the parent site (hermitelabs.com).
 *
 * The umbrella brand over HermiteFlow and the wider suite. Styled after the
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
import { HermiteMark } from "@/brand/HermiteMark";
import { GridOverlay, Label } from "@/brand/primitives";
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
  /**
   * The product's allocated accent, shown only as a 2px identifying rule.
   * Set this ONLY for accents allocated in the brand system — currently
   * flow (#3ADCC8), cut (#FF7A45) and mind (#9B8AFB). Products without an
   * allocation stay monochrome; do not invent a colour for them.
   */
  tint?: string;
};

const PRODUCTS: Product[] = [
  {
    icon: FileText,
    name: "HermiteFlow",
    category: "CRM + Invoicing",
    domain: "flow.hermitelabs.com",
    href: FLOW_URL,
    blurb:
      "Turn bookings into paid invoices automatically. A CRM and billing engine built for creative studios.",
    live: true,
    tint: "var(--flow)",
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
      className="flex items-center gap-[11px] text-[19px] font-semibold tracking-[-0.035em] text-[var(--mkt-ink)]"
    >
      {/* Parent brand: monochrome. The mark takes no accent here. */}
      <HermiteMark size={22} />
      Hermite<span className="font-medium text-[var(--mkt-ink-tertiary)]"> Labs</span>
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

      {/* Hero — the parent is silent: no accent, no glow, structure only. */}
      <section className="relative overflow-hidden">
        <GridOverlay />
        <Container className="relative pb-[clamp(48px,7vw,90px)] pt-[clamp(64px,11vw,150px)]">
          <Label>Hermite Labs — by Gaffy Studios</Label>
          <h1 className="mkt-display mt-[26px] max-w-[16ch] text-[clamp(34px,6.4vw,70px)] text-[var(--mkt-ink)]">
            The parent is silent.{" "}
            <em className="not-italic text-[var(--mkt-ink-tertiary)]">
              The products speak in color.
            </em>
          </h1>
          <p className="mt-5 max-w-[62ch] text-[14px] leading-[1.5] text-[var(--mkt-ink-subtle)]">
            Hermite Labs builds the tools that run a modern studio — billing,
            AI, auth, cloud, finance, and analytics — under one account and one
            design language. Every product inherits the same grid, type, and
            spacing, and is distinguished by exactly one accent. It starts with
            HermiteFlow.
          </p>
          <div className="mt-[26px] flex flex-wrap gap-[10px]">
            {/* Parent surfaces use the inverse (paper) CTA — accent is a
                product-level privilege and never appears on hermitelabs.com. */}
            <MButton variant="inverse" size="lg" href={FLOW_URL}>
              Start with HermiteFlow
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
                  className="relative flex h-full flex-col border border-[var(--mkt-hairline)] bg-[var(--mkt-surface-1)] p-6 transition-colors hover:border-[var(--mkt-hairline-strong)]"
                  style={{ borderRadius: "var(--radius-action)" }}
                >
                  {/* A product's own colour identifies it, as a 2px top rule.
                      This is the only colour on the parent site, and it names
                      the product rather than decorating the page. */}
                  {p.tint && (
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-0.5"
                      style={{ background: p.tint }}
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center border border-[var(--mkt-hairline)] bg-[var(--mkt-surface-3)] text-[var(--mkt-ink-subtle)]">
                      <p.icon className="h-5 w-5" />
                    </span>
                    <span
                      className="border px-2.5 py-1 font-[family-name:var(--mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--mkt-ink-tertiary)]"
                      style={{
                        borderColor: "var(--mkt-hairline)",
                        borderRadius: "var(--radius-pill)",
                      }}
                    >
                      {p.live ? "Live" : "Coming soon"}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.015em] text-[var(--mkt-ink)]">
                    {p.name}
                  </h3>
                  <p className="mt-1 font-[family-name:var(--mono)] text-[10.5px] uppercase tracking-[0.16em] text-[var(--mkt-ink-tertiary)]">
                    {p.category}
                  </p>
                  <p className="mt-3 flex-1 text-[13px] leading-[1.5] text-[var(--mkt-ink-subtle)]">
                    {p.blurb}
                  </p>
                  <p className="mt-4 flex items-center gap-1 font-[family-name:var(--mono)] text-[11px] text-[var(--mkt-ink-tertiary)]">
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
