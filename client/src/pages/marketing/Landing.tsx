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
} from "lucide-react";
import { Link } from "wouter";

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
  { value: "£2.4B+", label: "Invoiced through InvoiceFlow" },
  { value: "11 days", label: "Faster average payment" },
  { value: "99.99%", label: "Uptime, every quarter" },
  { value: "12,000+", label: "Teams getting paid" },
];

const testimonials = [
  {
    quote:
      "We replaced three tools and a spreadsheet with InvoiceFlow. Our DSO dropped by two weeks in the first month.",
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
          <div className="flex flex-col items-center text-center">
            <Pill className="mb-6">
              <Sparkles className="h-3.5 w-3.5 text-[#828fff]" />
              Now with automated payment reminders
            </Pill>
            <h1 className="mkt-display max-w-[16ch] text-[clamp(40px,7vw,80px)] text-[#f7f8f8]">
              Invoicing that gets you paid
            </h1>
            <p className="mt-6 max-w-[56ch] text-[clamp(17px,2vw,20px)] leading-relaxed text-[#8a8f98]">
              InvoiceFlow is the modern invoicing platform for teams that take
              billing seriously. Create polished invoices, automate follow-ups,
              and track every pound — all from one fast, focused workspace.
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
            <div className="mt-5 flex items-center gap-2 text-[13px] text-[#62666d]">
              <Check className="h-3.5 w-3.5 text-[#27a644]" />
              No credit card required
              <span className="mx-1 h-1 w-1 rounded-full bg-[#34343a]" />
              Free 14-day Pro trial
            </div>
          </div>

          {/* The product screenshot — the protagonist of the hero. */}
          <div className="relative mx-auto mt-16 max-w-[1080px]">
            <div
              className="pointer-events-none absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[32px] opacity-40 blur-[100px]"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 0%, rgba(94,106,210,0.4), transparent 70%)",
              }}
            />
            <ProductDashboardMock />
          </div>
        </Container>
      </section>

      {/* ===== Logo marquee ===== */}
      <section className="border-y border-[#1c1d20] py-12">
        <Container>
          <p className="text-center text-[13px] text-[#62666d]">
            Trusted by finance and operations teams at fast-moving companies
          </p>
          <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="mkt-marquee-track flex w-max items-center gap-14">
              {[...logos, ...logos].map((name, i) => (
                <span
                  key={i}
                  className="whitespace-nowrap text-[18px] font-semibold tracking-tight text-[#5b5f66]"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ===== Feature grid ===== */}
      <section className="py-24">
        <Container>
          <SectionHeading
            eyebrow="Everything you need"
            title="A complete billing workflow, end to end"
            description="From the first draft to the final payment, InvoiceFlow handles the entire lifecycle so you can stop chasing and start collecting."
          />
          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(f => (
              <div
                key={f.title}
                className="mkt-panel group rounded-xl p-6 transition-colors hover:border-[#34343a]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#23252a] bg-[#141516] text-[#828fff] transition-colors group-hover:border-[#5e6ad2]/40">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-[18px] font-medium tracking-tight text-[#f7f8f8]">
                  {f.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#8a8f98]">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ===== Feature spotlight: composer ===== */}
      <section className="py-24">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <Eyebrow>Create</Eyebrow>
              <h2 className="mkt-display mt-4 text-[clamp(28px,4vw,42px)] text-[#f7f8f8]">
                Draft an invoice in seconds, not spreadsheets
              </h2>
              <p className="mt-5 text-[17px] leading-relaxed text-[#8a8f98]">
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
                    className="flex items-center gap-3 text-[15px] text-[#d0d6e0]"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5e6ad2]/15">
                      <Check className="h-3 w-3 text-[#828fff]" />
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
            <InvoiceComposerMock />
          </div>
        </Container>
      </section>

      {/* ===== Feature spotlight: automation ===== */}
      <section className="py-24">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <AutomationMock />
            </div>
            <div className="order-1 lg:order-2">
              <Eyebrow>Automate</Eyebrow>
              <h2 className="mkt-display mt-4 text-[clamp(28px,4vw,42px)] text-[#f7f8f8]">
                Reminders that chase payments so you don't have to
              </h2>
              <p className="mt-5 text-[17px] leading-relaxed text-[#8a8f98]">
                Set a schedule once and InvoiceFlow handles the rest — gentle
                nudges before the due date, firm reminders after, and an instant
                status flip the moment a payment lands.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="mkt-panel rounded-lg p-4">
                  <Zap className="h-5 w-5 text-[#828fff]" />
                  <div className="mt-3 text-[15px] font-medium text-[#f7f8f8]">
                    Smart schedules
                  </div>
                  <div className="mt-1 text-[13px] text-[#8a8f98]">
                    Trigger reminders by due date or status.
                  </div>
                </div>
                <div className="mkt-panel rounded-lg p-4">
                  <Globe className="h-5 w-5 text-[#828fff]" />
                  <div className="mt-3 text-[15px] font-medium text-[#f7f8f8]">
                    Hosted pay pages
                  </div>
                  <div className="mt-1 text-[13px] text-[#8a8f98]">
                    Clients pay in two taps, anywhere.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== Stats band ===== */}
      <section className="border-y border-[#1c1d20] py-16">
        <Container>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="mkt-display text-[clamp(32px,5vw,48px)] text-[#f7f8f8]">
                  {s.value}
                </div>
                <div className="mt-2 text-[14px] text-[#8a8f98]">{s.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ===== Testimonials ===== */}
      <section className="py-24">
        <Container>
          <SectionHeading
            eyebrow="Loved by teams"
            title="Teams that switched never look back"
          />
          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {testimonials.map(t => (
              <figure
                key={t.name}
                className="mkt-panel flex flex-col rounded-xl p-7"
              >
                <div className="flex gap-0.5 text-[#828fff]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[16px] leading-relaxed text-[#d0d6e0]">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#828fff] text-[13px] font-semibold text-white">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-[#f7f8f8]">
                      {t.name}
                    </div>
                    <div className="text-[12px] text-[#62666d]">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* ===== CTA banner ===== */}
      <section className="pb-28">
        <Container>
          <div className="relative overflow-hidden rounded-2xl border border-[#23252a] bg-[#0f1011] px-8 py-16 text-center sm:px-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(60% 120% at 50% 0%, rgba(94,106,210,0.35), transparent 70%)",
              }}
            />
            <div className="relative">
              <h2 className="mkt-display mx-auto max-w-[18ch] text-[clamp(28px,4.5vw,46px)] text-[#f7f8f8]">
                Start getting paid faster today
              </h2>
              <p className="mx-auto mt-4 max-w-[52ch] text-[17px] text-[#8a8f98]">
                Join thousands of teams running their billing on InvoiceFlow.
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
              <p className="mt-6 text-[13px] text-[#62666d]">
                Already have an account?{" "}
                <Link
                  href="/dashboard"
                  className="text-[#828fff] hover:underline"
                >
                  Go to dashboard
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
