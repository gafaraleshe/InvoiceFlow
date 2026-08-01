/*
 * Hermite Flow — the product page on the Hermite Labs parent site
 * (hermitelabs.com/flow). A full standalone product page in the Composio
 * design language, linking out to the live app at flow.hermitelabs.com.
 */
import { useEffect } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Receipt,
  Zap,
  Plug,
  Check,
  CircleDot,
  Sparkles,
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
} from "./chrome";

const PIPELINE = [
  { label: "New", value: 5, tone: LX.cyan },
  { label: "Contacted", value: 3, tone: LX.primaryGlow },
  { label: "Quoted", value: 2, tone: LX.primaryGlow },
  { label: "Confirmed", value: 4, tone: LX.success },
];

const FEATURES = [
  {
    id: "crm",
    icon: CalendarCheck,
    label: "Bookings & CRM",
    title: "Every enquiry, one pipeline",
    body: "Capture enquiries from your booking site straight into a CRM pipeline — new, contacted, quoted, confirmed, completed. Filter, search, and move a booking forward in a click.",
    points: [
      "Enquiries land automatically from your site",
      "Six-stage pipeline with per-stage stats",
      "Owner-scoped API keys for your own sites",
    ],
  },
  {
    id: "invoicing",
    icon: Receipt,
    label: "Invoicing",
    title: "Branded invoices that get paid",
    body: "Generate clean, branded PDF invoices with correct UK VAT and sequential numbering. Send them over email and track what's paid — without leaving Flow.",
    points: [
      "Automatic VAT calculation & invoice numbers",
      "Branded PDF generation",
      "Email delivery via Resend",
    ],
  },
  {
    id: "automation",
    icon: Zap,
    label: "Automation",
    title: "Booking → invoice, automatically",
    body: "Confirm a booking and Flow turns it into an invoice — priced, VAT-applied, and optionally emailed — in one step. The busywork between 'yes' and 'paid' disappears.",
    points: [
      "One-click convert booking to invoice",
      "Optional auto-send on confirmation",
      "Status syncs back to the pipeline",
    ],
  },
  {
    id: "api",
    icon: Plug,
    label: "API & MCP",
    title: "Open API, built for agents",
    body: "Everything in the UI is in the public REST API at /api/v1, with an OpenAPI spec and a Model Context Protocol server so AI agents can run your studio as tools.",
    points: [
      "REST API at /api/v1 with OpenAPI spec",
      "@hermitelabs/flow-mcp for AI agents",
      "Organization-scoped keys & RLS",
    ],
  },
];

const STEPS = [
  {
    n: "01",
    title: "Connect your booking site",
    body: "Point your site at Flow with one owner-scoped API key. Enquiries start flowing into your pipeline immediately.",
  },
  {
    n: "02",
    title: "Work the pipeline",
    body: "Track each enquiry from new to confirmed. Quote, follow up, and see your open and confirmed value at a glance.",
  },
  {
    n: "03",
    title: "Convert & get paid",
    body: "Turn a confirmed booking into a branded, VAT-correct invoice and email it — automatically, if you want.",
  },
];

function Mono({ children, color = LX.body }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="text-[12.5px] leading-relaxed" style={{ fontFamily: MONO, color }}>
      {children}
    </div>
  );
}

/** The hero showpiece — a booking pipeline board + convert terminal. */
function FlowShowpiece() {
  return (
    <div className="relative mx-auto mt-14 max-w-[960px]">
      <Spotlight className="-top-24" size={920} opacity={0.3} />
      <div
        className="relative grid grid-cols-1 gap-4 rounded-2xl border p-4 sm:p-5 lg:grid-cols-[1.3fr_1fr]"
        style={{ borderColor: LX.hairlineStrong, background: LX.canvasDeep }}
      >
        {/* Pipeline board */}
        <div className="rounded-xl border p-5" style={{ borderColor: LX.hairline, background: LX.card }}>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[13px] font-semibold" style={{ color: LX.ink }}>
              Bookings
            </span>
            <span className="text-[11px]" style={{ fontFamily: MONO, color: LX.muted }}>
              14 open · £18,400 confirmed
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {PIPELINE.map(col => (
              <div key={col.label}>
                <div className="mb-2 flex items-center gap-1.5">
                  <CircleDot className="h-3 w-3" style={{ color: col.tone }} />
                  <span className="text-[10.5px] font-medium uppercase" style={{ letterSpacing: "0.05em", color: LX.muted }}>
                    {col.label}
                  </span>
                </div>
                <div className="space-y-2">
                  {Array.from({ length: col.value }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-md border px-2 py-2"
                      style={{ borderColor: LX.hairline, background: LX.cardElevated }}
                    >
                      <div className="h-1.5 w-3/4 rounded-full" style={{ background: LX.surfaceStrong }} />
                      <div className="mt-1.5 h-1.5 w-1/2 rounded-full" style={{ background: LX.hairlineStrong }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Convert terminal */}
        <div className="rounded-xl border p-5" style={{ borderColor: LX.hairline, background: LX.card }}>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: LX.primaryGlow }} />
            <span className="text-[11px]" style={{ fontFamily: MONO, color: LX.muted }}>
              flow.convert
            </span>
          </div>
          <div className="space-y-1.5">
            <Mono color={LX.ink}>$ convert bk_9f2 --send</Mono>
            <Mono color={LX.success}>✓ invoice INV-0421</Mono>
            <Mono color={LX.success}>✓ VAT applied (20%)</Mono>
            <Mono color={LX.success}>✓ emailed to client</Mono>
            <Mono color={LX.mutedSoft}># booking → confirmed → paid</Mono>
          </div>
          <div className="mt-4 rounded-lg border p-3" style={{ borderColor: LX.hairline, background: LX.canvasDeep }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px]" style={{ fontFamily: MONO, color: LX.muted }}>
                INV-0421
              </span>
              <BadgePill tone="live">Sent</BadgePill>
            </div>
            <div className="mt-2 text-[20px] font-semibold" style={{ color: LX.ink }}>
              £2,400.00
            </div>
            <div className="text-[11px]" style={{ fontFamily: MONO, color: LX.muted }}>
              incl. £400 VAT · due in 30 days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HermiteFlowProduct() {
  useEffect(() => {
    document.title = "Hermite Flow — CRM + invoicing for creative studios";
  }, []);

  return (
    <LabsShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Spotlight className="-top-40" size={1000} opacity={0.2} />
        <div className="relative mx-auto max-w-[1200px] px-5 pt-24 pb-8 text-center sm:px-6 sm:pt-32">
          <div className="mb-6 flex items-center justify-center gap-2">
            <BadgePill tone="live">Live now</BadgePill>
            <BadgePill>A Hermite Labs product</BadgePill>
          </div>
          <h1
            className="mx-auto max-w-[16ch] text-[clamp(38px,6.5vw,68px)] font-medium"
            style={{ color: LX.ink, letterSpacing: "-0.03em", lineHeight: 1.05 }}
          >
            From booking to paid, automatically
          </h1>
          <p
            className="mx-auto mt-6 max-w-[56ch] text-[clamp(16px,2vw,19px)] leading-relaxed"
            style={{ color: LX.body }}
          >
            Hermite Flow is the CRM and invoicing engine for creative studios. It
            captures your enquiries, runs your pipeline, and turns confirmed
            bookings into branded, VAT-correct invoices — sent in a click.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LButton href={FLOW_URL} external>
              Open Hermite Flow
              <ArrowUpRight className="h-4 w-4" />
            </LButton>
            <LButton variant="outline" href="#crm">
              See how it works
            </LButton>
          </div>
        </div>
        <FlowShowpiece />
      </section>

      {/* Feature sections */}
      <section className="py-24">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
          <div className="mx-auto max-w-[46ch] text-center">
            <SectionLabel>What Flow does</SectionLabel>
            <h2
              className="mt-4 text-[clamp(26px,4vw,44px)] font-medium"
              style={{ color: LX.ink, letterSpacing: "-0.03em", lineHeight: 1.1 }}
            >
              The whole path from enquiry to income
            </h2>
          </div>

          <div className="mt-16 space-y-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.id}
                id={f.id}
                className="grid scroll-mt-20 items-center gap-8 rounded-2xl border p-7 lg:grid-cols-2 lg:p-10"
                style={{ borderColor: LX.hairline, background: LX.card }}
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: "rgba(0,7,205,0.18)", color: LX.primaryGlow }}
                  >
                    <f.icon className="h-5 w-5" />
                  </span>
                  <div className="mt-4">
                    <SectionLabel>{f.label}</SectionLabel>
                  </div>
                  <h3
                    className="mt-2 text-[clamp(22px,3vw,30px)] font-medium"
                    style={{ color: LX.ink, letterSpacing: "-0.02em", lineHeight: 1.15 }}
                  >
                    {f.title}
                  </h3>
                  <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed" style={{ color: LX.body }}>
                    {f.body}
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {f.points.map(pt => (
                      <li key={pt} className="flex items-start gap-2.5 text-[14px]" style={{ color: LX.body }}>
                        <span
                          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                          style={{ background: "rgba(51,209,122,0.16)" }}
                        >
                          <Check className="h-2.5 w-2.5" style={{ color: LX.success }} />
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual */}
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <div
                    className="rounded-xl border p-5"
                    style={{ borderColor: LX.hairline, background: LX.canvasDeep }}
                  >
                    <FeatureVisual id={f.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t py-24" style={{ borderColor: LX.hairline }}>
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
          <div className="mx-auto max-w-[46ch] text-center">
            <SectionLabel>How it works</SectionLabel>
            <h2
              className="mt-4 text-[clamp(26px,4vw,40px)] font-medium"
              style={{ color: LX.ink, letterSpacing: "-0.03em", lineHeight: 1.1 }}
            >
              Live in three steps
            </h2>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {STEPS.map(s => (
              <div
                key={s.n}
                className="rounded-2xl border p-7"
                style={{ borderColor: LX.hairline, background: LX.card }}
              >
                <span className="text-[13px] font-semibold" style={{ fontFamily: MONO, color: LX.primaryGlow }}>
                  {s.n}
                </span>
                <h3 className="mt-3 text-[18px] font-semibold" style={{ color: LX.ink }}>
                  {s.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: LX.body }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="relative overflow-hidden border-t py-24" style={{ borderColor: LX.hairline }}>
        <Spotlight className="top-0" size={900} opacity={0.24} />
        <div className="relative mx-auto max-w-[720px] px-5 text-center sm:px-6">
          <div className="mb-5 flex justify-center">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: "rgba(0,7,205,0.2)", color: LX.primaryGlow }}
            >
              <Sparkles className="h-5 w-5" />
            </span>
          </div>
          <h2
            className="text-[clamp(30px,5vw,48px)] font-medium"
            style={{ color: LX.ink, letterSpacing: "-0.03em", lineHeight: 1.08 }}
          >
            Stop chasing, start billing
          </h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-[17px]" style={{ color: LX.body }}>
            Hermite Flow is live at flow.hermitelabs.com. Connect your booking
            site and turn your next enquiry into a paid invoice.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LButton href={FLOW_URL} external>
              Open Hermite Flow
              <ArrowRight className="h-4 w-4" />
            </LButton>
            <LButton variant="outline" href={`${FLOW_URL}/docs`} external>
              Read the docs
            </LButton>
          </div>
        </div>
      </section>
    </LabsShell>
  );
}

function FeatureVisual({ id }: { id: string }) {
  if (id === "crm") {
    return (
      <div className="space-y-2.5">
        {[
          { name: "Amara & Tolu", svc: "Wedding — full day", stage: "Confirmed", tone: LX.success },
          { name: "Studio session", svc: "Brand shoot", stage: "Quoted", tone: LX.primaryGlow },
          { name: "Ade O.", svc: "Portrait", stage: "New", tone: LX.cyan },
        ].map(r => (
          <div
            key={r.name}
            className="flex items-center justify-between rounded-lg border px-3 py-2.5"
            style={{ borderColor: LX.hairline, background: LX.card }}
          >
            <div>
              <div className="text-[13px] font-medium" style={{ color: LX.ink }}>{r.name}</div>
              <div className="text-[11px]" style={{ fontFamily: MONO, color: LX.muted }}>{r.svc}</div>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
              style={{ letterSpacing: "0.08em", background: LX.cardElevated, color: r.tone }}
            >
              {r.stage}
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (id === "invoicing") {
    return (
      <div>
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: LX.hairline }}>
          <span className="text-[13px] font-semibold" style={{ color: LX.ink }}>INV-0421</span>
          <BadgePill tone="live">Paid</BadgePill>
        </div>
        <div className="space-y-2 py-3">
          {[
            ["Full-day coverage", "£1,600.00"],
            ["Edited gallery", "£400.00"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-[13px]" style={{ color: LX.body }}>
              <span>{k}</span>
              <span style={{ fontFamily: MONO, color: LX.ink }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t pt-3 text-[13px]" style={{ borderColor: LX.hairline }}>
          <span style={{ color: LX.muted }}>VAT (20%)</span>
          <span style={{ fontFamily: MONO, color: LX.body }}>£400.00</span>
        </div>
        <div className="mt-2 flex justify-between">
          <span className="text-[14px] font-semibold" style={{ color: LX.ink }}>Total</span>
          <span className="text-[16px] font-semibold" style={{ fontFamily: MONO, color: LX.ink }}>£2,400.00</span>
        </div>
      </div>
    );
  }
  if (id === "automation") {
    return (
      <div className="space-y-2">
        {[
          { t: "Booking confirmed", tone: LX.body, mark: "→" },
          { t: "Invoice generated", tone: LX.success, mark: "✓" },
          { t: "VAT applied (20%)", tone: LX.success, mark: "✓" },
          { t: "Emailed to client", tone: LX.success, mark: "✓" },
          { t: "Pipeline updated", tone: LX.success, mark: "✓" },
        ].map(s => (
          <div key={s.t} className="flex items-center gap-2.5 text-[13px]" style={{ fontFamily: MONO, color: s.tone }}>
            <span className="w-3">{s.mark}</span>
            {s.t}
          </div>
        ))}
      </div>
    );
  }
  // api
  return (
    <div className="space-y-1.5">
      <Mono color={LX.ink}>$ curl flow.hermitelabs.com/api/v1/bookings</Mono>
      <Mono color={LX.mutedSoft}>  -H "Authorization: Bearer ifk_live_…"</Mono>
      <Mono color={LX.success}>{"{"}</Mono>
      <Mono color={LX.body}>{"  \"data\": [ … 14 bookings ],"}</Mono>
      <Mono color={LX.body}>{"  \"total\": 14, \"page\": 1"}</Mono>
      <Mono color={LX.success}>{"}"}</Mono>
      <div className="mt-3 border-t pt-3" style={{ borderColor: LX.hairline }}>
        <Mono color={LX.muted}># from an AI agent, via MCP</Mono>
        <Mono color={LX.primaryGlow}>convert_booking_to_invoice(bk_9f2)</Mono>
      </div>
    </div>
  );
}
