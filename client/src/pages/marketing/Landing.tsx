import { getLoginUrl } from "@/const";
import {
  Container,
  Eyebrow,
  MButton,
  Pill,
  SectionHeading,
} from "@/marketing/primitives";
import {
  ProductDashboardMock,
  InvoiceComposerMock,
  AutomationMock,
} from "@/marketing/mockups";
import {
  ArrowRight,
  FileText,
  Send,
  CreditCard,
  BarChart3,
  Users,
  ShieldCheck,
  Sparkles,
  Star,
  Check,
  Zap,
  Globe,
  Cloud,
  Wallet,
  Bot,
  KeyRound,
} from "lucide-react";
import { Link } from "wouter";
import { motion, useReducedMotion } from "motion/react";
import { ProductShowcase } from "@/marketing/ProductShowcase";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/marketing/motion";
import BorderGlow from "@/marketing/BorderGlow";

const logos = [
  "Northwind",
  "Atlas",
  "Meridian",
  "Cobalt",
  "Bright & Co.",
  "Helios",
  "Vantage",
  "Lumen",
];

const features = [
  {
    icon: FileText,
    title: "Beautiful invoices",
    body: "Branded, itemized invoices with automatic VAT, discounts, and multi-currency totals — generated as pixel-perfect PDFs.",
  },
  {
    icon: Send,
    title: "Send in one click",
    body: "Email invoices with a hosted payment link, or share a URL. Clients see a clean, trustworthy page on any device.",
  },
  {
    icon: CreditCard,
    title: "Get paid faster",
    body: "Accept card and bank payments, schedule automatic reminders, and watch overdue accounts shrink to near zero.",
  },
  {
    icon: BarChart3,
    title: "Revenue you can see",
    body: "A live dashboard tracks revenue, outstanding balances, and overdue counts so you always know where you stand.",
  },
  {
    icon: Users,
    title: "Clients, organized",
    body: "Every client, contact, and payment term in one place — with a full invoice history and a tidy audit trail.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "Role-based access, OAuth sign-in, and encrypted storage. Your financial data is locked down from day one.",
  },
];

const stats = [
  {
    n: 2.4,
    fmt: (v: number) => `£${v.toFixed(1)}B+`,
    label: "Invoiced through Hermite Flow",
  },
  {
    n: 11,
    fmt: (v: number) => `${Math.round(v)} days`,
    label: "Faster average payment",
  },
  {
    n: 99.99,
    fmt: (v: number) => `${v.toFixed(2)}%`,
    label: "Uptime, every quarter",
  },
  {
    n: 12000,
    fmt: (v: number) => `${Math.round(v).toLocaleString("en-GB")}+`,
    label: "Teams getting paid",
  },
];

const testimonials = [
  {
    quote:
      "We replaced three tools and a spreadsheet with Hermite Flow. Our DSO dropped by two weeks in the first month.",
    name: "Sofia Marchetti",
    role: "Finance Lead, Atlas Logistics",
  },
  {
    quote:
      "The dashboard is the first thing I open every morning. It feels like Linear, but for getting paid.",
    name: "Daniel Okoro",
    role: "Founder, Cobalt Design",
  },
  {
    quote:
      "Automatic reminders alone paid for the plan ten times over. Overdue invoices basically vanished.",
    name: "Priya Nair",
    role: "Ops Director, Meridian Health",
  },
];

export default function Landing() {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.6,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };
  return (
    <>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="mkt-grid-bg pointer-events-none absolute inset-0 opacity-60" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-30 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(94,106,210,0.55), transparent 70%)",
          }}
        />
        <Container className="relative pt-20 pb-16 sm:pt-28">
          <motion.div
            className="flex flex-col items-center text-center"
            {...rise(0)}
          >
            <Pill className="mb-6">
              <Sparkles className="h-3.5 w-3.5 text-[var(--mkt-primary-hover)]" />
              From booking to paid — automatically
            </Pill>
            <h1 className="mkt-display max-w-[16ch] text-[clamp(40px,7vw,80px)] text-[var(--mkt-ink)]">
              Invoicing for creatives
            </h1>
            <p className="mt-6 max-w-[56ch] text-[clamp(17px,2vw,20px)] leading-relaxed text-[var(--mkt-ink-subtle)]">
              Hermite Flow turns bookings into paid invoices for photographers,
              filmmakers, designers and studios. Connect your booking site and
              every enquiry becomes a client, a branded invoice, and an email —
              on its own. By Gaffy Studios.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <MButton size="lg" href={getLoginUrl()}>
                Start for free
                <ArrowRight className="h-4 w-4" />
              </MButton>
              <MButton variant="secondary" size="lg" href="/pricing">
                View pricing
              </MButton>
            </div>
            <div className="mt-5 flex items-center gap-2 text-[13px] text-[var(--mkt-ink-tertiary)]">
              <Check className="h-3.5 w-3.5 text-[var(--mkt-success)]" />
              No credit card required
              <span className="mx-1 h-1 w-1 rounded-full bg-[var(--mkt-hairline-strong)]" />
              Free 14-day Pro trial
            </div>
          </motion.div>

          {/* The product screenshot — the protagonist of the hero. */}
          <motion.div
            className="relative mx-auto mt-16 max-w-[1080px]"
            {...rise(0.15)}
          >
            <div
              className="pointer-events-none absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[32px] opacity-40 blur-[100px]"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 0%, rgba(94,106,210,0.4), transparent 70%)",
              }}
            />
            <ProductDashboardMock />
          </motion.div>
        </Container>
      </section>

      {/* ===== Logo marquee ===== */}
      <section className="border-y border-[var(--mkt-hairline-soft)] py-12">
        <Container>
          <p className="text-center text-[13px] text-[var(--mkt-ink-tertiary)]">
            Trusted by finance and operations teams at fast-moving companies
          </p>
          <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="mkt-marquee-track flex w-max items-center gap-14">
              {[...logos, ...logos].map((name, i) => (
                <span
                  key={i}
                  className="whitespace-nowrap text-[18px] font-semibold tracking-tight text-[var(--mkt-mock-ink-3)]"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ===== Product in action ===== */}
      <ProductShowcase />

      {/* ===== Feature grid ===== */}
      <section className="py-24">
        <Container>
          <SectionHeading
            eyebrow="Everything you need"
            title="A complete billing workflow, end to end"
            description="From the first draft to the final payment, Hermite Flow handles the entire lifecycle so you can stop chasing and start collecting."
          />
          <Stagger className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(f => (
              <StaggerItem
                key={f.title}
                className="mkt-panel group rounded-xl p-6 transition-[colors,transform] duration-300 hover:-translate-y-1 hover:border-[var(--mkt-hairline-strong)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--mkt-hairline)] bg-[var(--mkt-surface-2)] text-[var(--mkt-primary-hover)] transition-colors group-hover:border-[var(--mkt-primary)]/40">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-[18px] font-medium tracking-tight text-[var(--mkt-ink)]">
                  {f.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--mkt-ink-subtle)]">
                  {f.body}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ===== Feature spotlight: composer ===== */}
      <section className="py-24">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <Eyebrow>Create</Eyebrow>
              <h2 className="mkt-display mt-4 text-[clamp(28px,4vw,42px)] text-[var(--mkt-ink)]">
                Draft an invoice in seconds, not spreadsheets
              </h2>
              <p className="mt-5 text-[17px] leading-relaxed text-[var(--mkt-ink-subtle)]">
                Pick a client, add line items, and watch totals, VAT, and the
                live PDF preview update as you type. Auto-numbered, brand-ready,
                and correct every time.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Automatic VAT and multi-currency totals",
                  "Reusable line items and saved clients",
                  "Live PDF preview with your branding",
                ].map(item => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-[15px] text-[var(--mkt-ink-muted)]"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--mkt-primary)]/15">
                      <Check className="h-3 w-3 text-[var(--mkt-primary-hover)]" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <MButton variant="secondary" href="/features">
                  Explore the editor
                  <ArrowRight className="h-4 w-4" />
                </MButton>
              </div>
            </div>
            <Reveal delay={0.05}>
              <InvoiceComposerMock />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ===== Feature spotlight: automation ===== */}
      <section className="py-24">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <Reveal className="order-2 lg:order-1">
              <AutomationMock />
            </Reveal>
            <div className="order-1 lg:order-2">
              <Eyebrow>Automate</Eyebrow>
              <h2 className="mkt-display mt-4 text-[clamp(28px,4vw,42px)] text-[var(--mkt-ink)]">
                Reminders that chase payments so you don't have to
              </h2>
              <p className="mt-5 text-[17px] leading-relaxed text-[var(--mkt-ink-subtle)]">
                Set a schedule once and Hermite Flow handles the rest — gentle
                nudges before the due date, firm reminders after, and an instant
                status flip the moment a payment lands.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="mkt-panel rounded-lg p-4">
                  <Zap className="h-5 w-5 text-[var(--mkt-primary-hover)]" />
                  <div className="mt-3 text-[15px] font-medium text-[var(--mkt-ink)]">
                    Smart schedules
                  </div>
                  <div className="mt-1 text-[13px] text-[var(--mkt-ink-subtle)]">
                    Trigger reminders by due date or status.
                  </div>
                </div>
                <div className="mkt-panel rounded-lg p-4">
                  <Globe className="h-5 w-5 text-[var(--mkt-primary-hover)]" />
                  <div className="mt-3 text-[15px] font-medium text-[var(--mkt-ink)]">
                    Hosted pay pages
                  </div>
                  <div className="mt-1 text-[13px] text-[var(--mkt-ink-subtle)]">
                    Clients pay in two taps, anywhere.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== Stats band ===== */}
      <section className="border-y border-[var(--mkt-hairline-soft)] py-16">
        <Container>
          <Stagger className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map(s => (
              <StaggerItem key={s.label} className="text-center">
                <CountUp
                  to={s.n}
                  format={s.fmt}
                  className="mkt-display block text-[clamp(32px,5vw,48px)] text-[var(--mkt-ink)]"
                />
                <div className="mt-2 text-[14px] text-[var(--mkt-ink-subtle)]">{s.label}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ===== Testimonials ===== */}
      <section className="py-24">
        <Container>
          <SectionHeading
            eyebrow="Loved by teams"
            title="Teams that switched never look back"
          />
          <Stagger className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {testimonials.map(t => (
              <StaggerItem
                key={t.name}
                className="mkt-panel flex flex-col rounded-xl p-7"
              >
                <div className="flex gap-0.5 text-[var(--mkt-primary-hover)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[16px] leading-relaxed text-[var(--mkt-ink-muted)]">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--mkt-primary)] to-[var(--mkt-primary-hover)] text-[13px] font-semibold text-white">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-[var(--mkt-ink)]">
                      {t.name}
                    </div>
                    <div className="text-[12px] text-[var(--mkt-ink-tertiary)]">{t.role}</div>
                  </div>
                </figcaption>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ===== Hermite Labs ecosystem ===== */}
      <HermiteLabsSection />

      {/* ===== CTA banner ===== */}
      <section className="pb-28">
        <Container>
          <BorderGlow
            className="px-8 py-16 text-center sm:px-16"
            backgroundColor="var(--mkt-surface-1)"
            borderRadius={24}
            glowColor="232 60 68"
            colors={["#5e6ad2", "#828fff", "#38bdf8"]}
            glowRadius={48}
            glowIntensity={1}
            edgeSensitivity={34}
            coneSpread={26}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(60% 120% at 50% 0%, rgba(94,106,210,0.35), transparent 70%)",
              }}
            />
            <div className="relative">
              <h2 className="mkt-display mx-auto max-w-[18ch] text-[clamp(28px,4.5vw,46px)] text-[var(--mkt-ink)]">
                Start getting paid faster today
              </h2>
              <p className="mx-auto mt-4 max-w-[52ch] text-[17px] text-[var(--mkt-ink-subtle)]">
                Join thousands of teams running their billing on Hermite Flow.
                Free to start — no credit card, no setup calls.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <MButton size="lg" href={getLoginUrl()}>
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </MButton>
                <MButton variant="secondary" size="lg" href="/contact">
                  Talk to sales
                </MButton>
              </div>
              <p className="mt-6 text-[13px] text-[var(--mkt-ink-tertiary)]">
                Already have an account?{" "}
                <Link
                  href="/dashboard"
                  className="text-[var(--mkt-primary-hover)] hover:underline"
                >
                  Go to dashboard
                </Link>
              </p>
            </div>
          </BorderGlow>
        </Container>
      </section>
    </>
  );
}

// ── Hermite Labs ecosystem ──────────────────────────────────────────────────
// A Composio-styled dark band (electric-blue voltage) that showcases the wider
// Hermite Labs suite. Deliberately dark in both site themes — a spotlight band.

const LABS = {
  canvas: "#0f0f0f",
  card: "#181818",
  hairline: "#2a2a2a",
  primary: "#0007cd",
  glow: "#1a26ff",
  ink: "#ffffff",
  body: "#a8a8a8",
  cyan: "#00d4ff",
  success: "#33d17a",
};

const HERMITE_PRODUCTS = [
  {
    icon: FileText,
    name: "Hermite Flow",
    category: "CRM + Invoicing",
    domain: "flow.hermitelabs.com",
    blurb: "Bookings to paid invoices, on autopilot. The one you're looking at.",
    live: true,
  },
  {
    icon: Bot,
    name: "Hermite AI",
    category: "AI tools",
    domain: "ai.hermitelabs.com",
    blurb: "Copywriting, replies and agents that plug into your workflow.",
    live: false,
  },
  {
    icon: KeyRound,
    name: "Hermite Auth",
    category: "Authentication",
    domain: "auth.hermitelabs.com",
    blurb: "One sign-in across every Hermite Labs product. SSO-ready.",
    live: false,
  },
  {
    icon: Cloud,
    name: "Hermite Cloud",
    category: "Cloud services",
    domain: "cloud.hermitelabs.com",
    blurb: "Storage, delivery and hosting for your files and galleries.",
    live: false,
  },
  {
    icon: Wallet,
    name: "Hermite Finance",
    category: "Smart budgeting",
    domain: "finance.hermitelabs.com",
    blurb: "AI budgeting and money tips built for a creative income.",
    live: false,
  },
  {
    icon: BarChart3,
    name: "Hermite Analytics",
    category: "Business intelligence",
    domain: "analytics.hermitelabs.com",
    blurb: "Product and revenue analytics — a PostHog for your studio.",
    live: false,
  },
];

function HermiteLabsSection() {
  return (
    <section className="pb-24">
      <Container>
        <div
          className="relative overflow-hidden rounded-[28px] border px-6 py-14 sm:px-12"
          style={{ borderColor: LABS.hairline, background: LABS.canvas }}
        >
          {/* central electric-blue spotlight — the Composio signature */}
          <div
            className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
            style={{ background: LABS.glow }}
          />
          <div className="relative text-center">
            <span
              className="inline-block rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ borderColor: LABS.hairline, color: LABS.cyan }}
            >
              Hermite Labs
            </span>
            <h2
              className="mkt-display mx-auto mt-5 max-w-[20ch] text-[clamp(28px,4.5vw,46px)]"
              style={{ color: LABS.ink }}
            >
              One platform for your whole creative business
            </h2>
            <p
              className="mx-auto mt-4 max-w-[56ch] text-[16px] leading-relaxed"
              style={{ color: LABS.body }}
            >
              Hermite Flow is the first of a growing suite by Gaffy Studios.
              One account, one design language, everything that runs a studio.
            </p>
          </div>

          <div className="relative mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HERMITE_PRODUCTS.map(p => (
              <div
                key={p.name}
                className="flex flex-col rounded-2xl border p-6 transition-colors"
                style={{
                  borderColor: p.live ? "rgba(0,7,205,0.5)" : LABS.hairline,
                  background: LABS.card,
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: p.live ? "rgba(0,7,205,0.18)" : "#222",
                      color: p.live ? LABS.cyan : LABS.body,
                    }}
                  >
                    <p.icon className="h-5 w-5" />
                  </span>
                  <span
                    className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest"
                    style={{
                      borderColor: LABS.hairline,
                      color: p.live ? LABS.success : LABS.body,
                    }}
                  >
                    {p.live ? "Live" : "Coming soon"}
                  </span>
                </div>
                <h3 className="mt-4 text-[17px] font-semibold" style={{ color: LABS.ink }}>
                  {p.name}
                </h3>
                <p
                  className="text-[12px] font-medium uppercase tracking-wider"
                  style={{ color: LABS.cyan }}
                >
                  {p.category}
                </p>
                <p className="mt-2 flex-1 text-[14px] leading-relaxed" style={{ color: LABS.body }}>
                  {p.blurb}
                </p>
                <p
                  className="mt-4 font-mono text-[12px]"
                  style={{ color: p.live ? LABS.cyan : "#666" }}
                >
                  {p.domain}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
