import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LayoutDashboard, PenLine, Bell } from "lucide-react";
import { Container, Eyebrow } from "./primitives";
import { EASE, Reveal } from "./motion";
import {
  ProductDashboardMock,
  InvoiceComposerMock,
  AutomationMock,
} from "./mockups";

const steps = [
  {
    key: "track",
    icon: LayoutDashboard,
    label: "Track",
    title: "Know exactly where you stand",
    body: "Revenue, outstanding, and overdue update live. Open the dashboard and your whole business is right there.",
    render: () => <ProductDashboardMock />,
  },
  {
    key: "create",
    icon: PenLine,
    label: "Create",
    title: "Draft and send in seconds",
    body: "Add line items, watch VAT and totals compute, and preview the branded PDF — then send with one click.",
    render: () => <InvoiceComposerMock />,
  },
  {
    key: "automate",
    icon: Bell,
    label: "Automate",
    title: "Reminders chase for you",
    body: "Set a schedule once. Sigma nudges clients, escalates overdue notices, and flips to paid on its own.",
    render: () => (
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-[420px]">
          <AutomationMock />
        </div>
      </div>
    ),
  },
];

const DURATION_MS = 5200;

export function ProductShowcase() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(
      () => setActive(a => (a + 1) % steps.length),
      DURATION_MS
    );
    return () => clearTimeout(t);
  }, [active, paused]);

  const step = steps[active];

  return (
    <section className="py-24">
      <Container>
        <Reveal className="flex flex-col items-center text-center">
          <Eyebrow>See it in action</Eyebrow>
          <h2 className="mkt-display mt-4 max-w-[20ch] text-[clamp(28px,4vw,44px)] text-[var(--mkt-ink)]">
            One workspace, the whole billing loop
          </h2>
          <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-[var(--mkt-ink-subtle)]">
            Watch a payment move from draft to paid — create, send, automate,
            and track without ever leaving Sigma.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.4fr] lg:gap-12">
          {/* Step selector */}
          <div
            className="flex flex-col gap-3"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {steps.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.key}
                  onClick={() => setActive(i)}
                  className={
                    "group relative overflow-hidden rounded-xl border p-4 text-left transition-colors " +
                    (on
                      ? "border-[var(--mkt-primary)]/40 bg-[var(--mkt-surface-1)]"
                      : "border-[var(--mkt-hairline)] bg-transparent hover:bg-[var(--mkt-surface-1)]")
                  }
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors " +
                        (on
                          ? "border-[var(--mkt-primary)]/40 bg-[var(--mkt-primary)]/15 text-[var(--mkt-primary-hover)]"
                          : "border-[var(--mkt-hairline)] bg-[var(--mkt-surface-2)] text-[var(--mkt-ink-subtle)]")
                      }
                    >
                      <s.icon className="h-[18px] w-[18px]" />
                    </span>
                    <span
                      className={
                        "text-[15px] font-medium tracking-tight " +
                        (on ? "text-[var(--mkt-ink)]" : "text-[var(--mkt-ink-muted)]")
                      }
                    >
                      {s.title}
                    </span>
                  </div>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.p
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduce ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden text-[13.5px] leading-relaxed text-[var(--mkt-ink-subtle)]"
                      >
                        <span className="mt-2 block pl-12">{s.body}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* auto-advance progress bar */}
                  {on && !reduce && (
                    <motion.span
                      key={active + (paused ? "-paused" : "-run")}
                      className="absolute bottom-0 left-0 h-0.5 bg-[var(--mkt-primary)]"
                      initial={{ width: "0%" }}
                      animate={{ width: paused ? "0%" : "100%" }}
                      transition={{
                        duration: paused ? 0 : DURATION_MS / 1000,
                        ease: "linear",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Stage */}
          <div
            className="relative min-h-[440px]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              className="pointer-events-none absolute -inset-x-8 -top-8 bottom-0 -z-10 rounded-[32px] opacity-40 blur-[90px]"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 0%, rgba(94,106,210,0.35), transparent 70%)",
              }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={step.key}
                initial={reduce ? false : { opacity: 0, y: 24, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: -16, scale: 0.985 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="h-full"
              >
                {step.render()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}
