import { getLoginUrl } from "@/const";
import {
  Container,
  Eyebrow,
  MButton,
  SectionHeading,
} from "@/marketing/primitives";
import { ArrowRight, Target, Heart, Zap, ShieldCheck } from "lucide-react";

const values = [
  {
    icon: Zap,
    title: "Speed is a feature",
    body: "Billing software should feel instant. We obsess over fast load times, keyboard-friendly flows, and zero busywork.",
  },
  {
    icon: Heart,
    title: "Craft over clutter",
    body: "Every screen earns its place. We ship fewer, sharper features instead of a sprawling settings maze.",
  },
  {
    icon: ShieldCheck,
    title: "Trust by default",
    body: "Your financial data is sacred. Security, privacy, and reliability are non-negotiable foundations, not add-ons.",
  },
  {
    icon: Target,
    title: "Outcome obsessed",
    body: "We measure success in days-to-payment for our customers, not vanity metrics on a slide.",
  },
];

const milestones = [
  {
    year: "2023",
    title: "Founded",
    body: "Started as a tool to scratch our own invoicing itch.",
  },
  {
    year: "2024",
    title: "Launched Pro",
    body: "Automated reminders and hosted payments shipped.",
  },
  {
    year: "2025",
    title: "10,000 teams",
    body: "Crossed ten thousand teams billing on InvoiceFlow.",
  },
  {
    year: "2026",
    title: "£2.4B invoiced",
    body: "Processed billions in invoices across 40+ countries.",
  },
];

const team = [
  { name: "Avery Klein", role: "Co-founder & CEO" },
  { name: "Marcus Lindqvist", role: "Co-founder & CTO" },
  { name: "Priya Nair", role: "Head of Product" },
  { name: "Daniel Okoro", role: "Head of Design" },
  { name: "Sofia Marchetti", role: "Head of Customer" },
  { name: "Jonas Weber", role: "Head of Engineering" },
];

export default function About() {
  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden pt-20 pb-12">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(94,106,210,0.5), transparent 70%)",
          }}
        />
        <Container className="relative flex flex-col items-center text-center">
          <Eyebrow>Our story</Eyebrow>
          <h1 className="mkt-display mt-4 max-w-[20ch] text-[clamp(36px,6vw,64px)] text-[#f7f8f8]">
            We're building the billing tool we always wanted
          </h1>
          <p className="mt-5 max-w-[58ch] text-[18px] leading-relaxed text-[#8a8f98]">
            InvoiceFlow started with a simple frustration: getting paid was
            harder than doing the work. So we built a focused, fast platform
            that makes invoicing effortless — and getting paid inevitable.
          </p>
        </Container>
      </section>

      {/* Mission statement */}
      <section className="py-16">
        <Container className="max-w-[900px]">
          <div className="rounded-2xl border border-[#23252a] bg-[#0f1011] p-10 text-center">
            <p className="mkt-display text-[clamp(22px,3vw,32px)] leading-snug text-[#f7f8f8]">
              "Every business deserves to be paid for the work it does —{" "}
              <span className="text-[#828fff]">on time, every time.</span>"
            </p>
            <p className="mt-6 text-[14px] text-[#62666d]">
              — The InvoiceFlow team
            </p>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="What we believe"
            title="The principles behind every decision"
          />
          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {values.map(v => (
              <div key={v.title} className="mkt-panel rounded-xl p-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#23252a] bg-[#141516] text-[#828fff]">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-[18px] font-medium tracking-tight text-[#f7f8f8]">
                  {v.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#8a8f98]">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <Container>
          <SectionHeading eyebrow="Milestones" title="The road so far" />
          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map(m => (
              <div key={m.year} className="mkt-panel rounded-xl p-6">
                <div className="font-mono text-[13px] text-[#828fff]">
                  {m.year}
                </div>
                <div className="mt-3 text-[18px] font-medium tracking-tight text-[#f7f8f8]">
                  {m.title}
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[#8a8f98]">
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Team */}
      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="The team"
            title="A small team with a big obsession"
          />
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {team.map(person => (
              <div
                key={person.name}
                className="mkt-panel flex flex-col items-center rounded-xl p-7 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#828fff] text-[20px] font-semibold text-white">
                  {person.name.charAt(0)}
                </div>
                <div className="mt-4 text-[15px] font-medium text-[#f7f8f8]">
                  {person.name}
                </div>
                <div className="mt-1 text-[12px] text-[#62666d]">
                  {person.role}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 pb-28">
        <Container>
          <div className="rounded-2xl border border-[#23252a] bg-[#0f1011] px-8 py-14 text-center">
            <h2 className="mkt-display mx-auto max-w-[22ch] text-[clamp(26px,4vw,40px)] text-[#f7f8f8]">
              Come get paid with us
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-[16px] text-[#8a8f98]">
              Join thousands of teams who've made invoicing the easiest part of
              running their business.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MButton size="lg" href={getLoginUrl()}>
                Start for free
                <ArrowRight className="h-4 w-4" />
              </MButton>
              <MButton variant="secondary" size="lg" href="/contact">
                Get in touch
              </MButton>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
