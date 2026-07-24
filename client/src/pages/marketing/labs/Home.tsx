/*
 * Hermite Labs — the parent site home (hermitelabs.com).
 *
 * Composio design language (composio/DESIGN.md): near-black canvas, single
 * electric-blue voltage, a spotlight-backed hero anchored by the signature
 * 2×2 terminal-mockup grid, brightness-step product cards, and a spotlight
 * CTA band. Hermite Flow is the one product live today.
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
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { FLOW_URL } from "@/lib/host";
import {
  LX,
  MONO,
  LabsShell,
  LButton,
  BadgePill,
  SectionLabel,
  Spotlight,
  TerminalWindow,
  useLabsHref,
} from "./chrome";

type Product = {
  icon: typeof FileText;
  name: string;
  category: string;
  domain: string;
  blurb: string;
  live?: boolean;
  to?: string;
};

const PRODUCTS: Product[] = [
  {
    icon: FileText,
    name: "Hermite Flow",
    category: "CRM + Invoicing",
    domain: "flow.hermitelabs.com",
    blurb:
      "Turn bookings into paid invoices automatically. A CRM and billing engine built for creative studios.",
    live: true,
    to: "/flow",
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

const PLATFORM = [
  {
    icon: KeyRound,
    title: "One account",
    body: "Sign in once. Every Hermite product shares the same identity, billing, and workspace — no re-onboarding per tool.",
  },
  {
    icon: Layers,
    title: "One design language",
    body: "The suite is built on a single Composio-grade design system, so each product feels like part of the same studio.",
  },
  {
    icon: Zap,
    title: "Built to connect",
    body: "A public REST API and MCP server on every product means your tools — and your AI agents — can talk to each other.",
  },
  {
    icon: ShieldCheck,
    title: "Yours to control",
    body: "Organization-scoped keys and row-level security keep each studio's data isolated and owned by the studio.",
  },
];

/** The brand-signature 2×2 terminal-mockup grid. */
function HeroTerminalGrid() {
  return (
    <div className="relative mx-auto mt-14 max-w-[920px]">
      <Spotlight className="-top-24" size={900} opacity={0.32} />
      <div
        className="relative grid grid-cols-1 gap-4 rounded-2xl border p-4 sm:grid-cols-2 sm:p-5"
        style={{ borderColor: LX.hairlineStrong, background: LX.canvasDeep }}
      >
        {/* Pane 1 — a booking arrives */}
        <TerminalPane title="booking.received">
          <Line tone="comment"># enquiry from shotbygafar.com</Line>
          <Line><K>name</K> "Amara & Tolu"</Line>
          <Line><K>service</K> "Wedding — full day"</Line>
          <Line><K>date</K> "2026-09-12"</Line>
          <Line tone="out">→ status: new</Line>
        </TerminalPane>

        {/* Pane 2 — Flow converts it */}
        <TerminalPane title="flow.convert">
          <Line tone="cmd">$ hermite flow convert bk_9f2</Line>
          <Line tone="out">✓ invoice INV-0421 created</Line>
          <Line tone="out">✓ VAT applied (20%)</Line>
          <Line tone="out">✓ emailed via Resend</Line>
        </TerminalPane>

        {/* Pane 3 — one API */}
        <TerminalPane title="api.request">
          <Line tone="cmd">GET /api/v1/bookings/stats</Line>
          <Line><K>pipeline</K> 12 open</Line>
          <Line><K>confirmed</K> £18,400</Line>
          <Line><K>this_month</K> £6,250</Line>
        </TerminalPane>

        {/* Pane 4 — agents */}
        <TerminalPane title="mcp.tools">
          <Line tone="comment"># @hermitelabs/flow-mcp</Line>
          <Line tone="out">list_bookings</Line>
          <Line tone="out">create_invoice</Line>
          <Line tone="out">convert_booking_to_invoice</Line>
        </TerminalPane>
      </div>
    </div>
  );
}

function TerminalPane({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: LX.hairline, background: LX.card }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: LX.primaryGlow }} />
        <span className="text-[11px]" style={{ fontFamily: MONO, color: LX.muted }}>
          {title}
        </span>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function K({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: LX.cyan }}>
      {children}
      <span style={{ color: LX.mutedSoft }}>: </span>
    </span>
  );
}

function Line({
  children,
  tone = "ink",
}: {
  children: React.ReactNode;
  tone?: "ink" | "out" | "comment" | "cmd";
}) {
  const color =
    tone === "comment"
      ? LX.mutedSoft
      : tone === "out"
        ? LX.success
        : tone === "cmd"
          ? LX.ink
          : LX.body;
  return (
    <div className="text-[12.5px] leading-relaxed" style={{ fontFamily: MONO, color }}>
      {children}
    </div>
  );
}

export default function HermiteLabsHome() {
  const href = useLabsHref();
  useEffect(() => {
    document.title = "Hermite Labs — software for creative businesses";
  }, []);

  return (
    <LabsShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Spotlight className="-top-40" size={1000} opacity={0.22} />
        <div className="relative mx-auto max-w-[1200px] px-5 pt-24 pb-8 text-center sm:px-6 sm:pt-32">
          <div className="mb-6 flex justify-center">
            <BadgePill>By Gaffy Studios</BadgePill>
          </div>
          <h1
            className="mx-auto max-w-[16ch] text-[clamp(40px,7vw,72px)] font-medium"
            style={{ color: LX.ink, letterSpacing: "-0.03em", lineHeight: 1.05 }}
          >
            Software for creative businesses
          </h1>
          <p
            className="mx-auto mt-6 max-w-[56ch] text-[clamp(16px,2vw,19px)] leading-relaxed"
            style={{ color: LX.body }}
          >
            Hermite Labs builds the tools that run a modern studio — billing, AI,
            auth, cloud, finance, and analytics — under one account and one
            design language. It starts with{" "}
            <span style={{ color: LX.ink }}>Hermite Flow</span>.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LButton href={href("/flow")}>
              Explore Hermite Flow
              <ArrowRight className="h-4 w-4" />
            </LButton>
            <LButton variant="outline" href={href("/") + "#products"}>
              See the suite
            </LButton>
          </div>
        </div>
        <HeroTerminalGrid />
      </section>

      {/* Products */}
      <section id="products" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
          <div className="mx-auto max-w-[46ch] text-center">
            <SectionLabel>The suite</SectionLabel>
            <h2
              className="mt-4 text-[clamp(26px,4vw,44px)] font-medium"
              style={{ color: LX.ink, letterSpacing: "-0.03em", lineHeight: 1.1 }}
            >
              One suite, every part of the business
            </h2>
            <p className="mt-3 text-[16px]" style={{ color: LX.body }}>
              Flow is live today. The rest of the suite is on the way.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map(p => {
              const inner = (
                <div
                  className="flex h-full flex-col rounded-2xl border p-6 transition-colors"
                  style={{
                    borderColor: p.live ? LX.primary : LX.hairline,
                    background: LX.card,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{
                        background: p.live
                          ? "rgba(0,7,205,0.18)"
                          : LX.cardElevated,
                        color: p.live ? LX.primaryGlow : LX.muted,
                      }}
                    >
                      <p.icon className="h-5 w-5" />
                    </span>
                    <BadgePill tone={p.live ? "live" : "default"}>
                      {p.live ? "Live" : "Soon"}
                    </BadgePill>
                  </div>
                  <h3 className="mt-4 text-[18px] font-semibold" style={{ color: LX.ink }}>
                    {p.name}
                  </h3>
                  <p
                    className="text-[12px] font-medium uppercase"
                    style={{ letterSpacing: "0.06em", color: LX.primaryGlow }}
                  >
                    {p.category}
                  </p>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed" style={{ color: LX.body }}>
                    {p.blurb}
                  </p>
                  <p
                    className="mt-4 flex items-center gap-1 text-[12px]"
                    style={{ fontFamily: MONO, color: LX.muted }}
                  >
                    {p.domain}
                    {p.to ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
                  </p>
                </div>
              );
              return p.to ? (
                <a key={p.name} href={href(p.to)} className="block">
                  {inner}
                </a>
              ) : (
                <div key={p.name}>{inner}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform */}
      <section id="platform" className="scroll-mt-20 border-t py-24" style={{ borderColor: LX.hairline }}>
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionLabel>The platform</SectionLabel>
              <h2
                className="mt-4 text-[clamp(26px,4vw,40px)] font-medium"
                style={{ color: LX.ink, letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                Not a bundle of apps. One platform.
              </h2>
              <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed" style={{ color: LX.body }}>
                Every Hermite product sits on shared identity, billing, and an
                open API. Adopt one, and the next one already knows your studio.
              </p>
              <div className="mt-8">
                <LButton href={FLOW_URL} external>
                  Start with Flow
                  <ArrowUpRight className="h-4 w-4" />
                </LButton>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {PLATFORM.map(f => (
                <div
                  key={f.title}
                  className="rounded-xl border p-6"
                  style={{ borderColor: LX.hairline, background: LX.card }}
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: LX.cardElevated, color: LX.primaryGlow }}
                  >
                    <f.icon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="mt-4 text-[16px] font-semibold" style={{ color: LX.ink }}>
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: LX.body }}>
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="relative overflow-hidden border-t py-24" style={{ borderColor: LX.hairline }}>
        <Spotlight className="top-0" size={900} opacity={0.24} />
        <div className="relative mx-auto max-w-[720px] px-5 text-center sm:px-6">
          <h2
            className="text-[clamp(30px,5vw,48px)] font-medium"
            style={{ color: LX.ink, letterSpacing: "-0.03em", lineHeight: 1.08 }}
          >
            Run your studio on Hermite
          </h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-[17px]" style={{ color: LX.body }}>
            Start with Hermite Flow — bookings to paid invoices, automatically —
            and grow into the rest of the suite as it ships.
          </p>
          <div className="mt-8 flex justify-center">
            <LButton href={FLOW_URL} external>
              Open Hermite Flow
              <ArrowRight className="h-4 w-4" />
            </LButton>
          </div>
        </div>
      </section>
    </LabsShell>
  );
}
