/**
 * Hermite design-system primitives.
 *
 * Rules these encode, from the brand system — none are negotiable:
 *
 *   · Labels are mono, uppercase, 10.5px, 0.16em tracking. They name every
 *     section and category, and are the most recognisable element of the system.
 *   · Depth is a 1px hairline at 9% white plus a one-step background shift.
 *     No drop shadows anywhere, and no glows except the small status dot.
 *   · Buttons are 2px radius with mono uppercase labels. Pills are status-only.
 *   · Accent covers ~5% of a viewport: one CTA, one active state, one focus
 *     ring. Never a background fill, never body text, never two on a page.
 *   · Motion is 150–200ms ease-out — fade plus an 8px rise, once, on scroll-in.
 */
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ElementType, ReactNode } from "react";

/* ─── Layout ──────────────────────────────────────────────────────────────── */

export function Wrap({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[var(--measure)]", className)}
      style={{ paddingInline: "var(--gut)" }}
    >
      {children}
    </div>
  );
}

/** Full-bleed 1px rule. Every section is separated by one. */
export function Rule({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-[var(--border)]", className)} />;
}

/** A page section: top hairline + the standard vertical rhythm. */
export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "border-t border-[var(--border)] py-[clamp(48px,7vw,96px)]",
        className
      )}
    >
      {children}
    </section>
  );
}

/* ─── Type ────────────────────────────────────────────────────────────────── */

/** The signature element. Mono, uppercase, 10.5px, 0.16em. */
export function Label({
  as: Tag = "span",
  bright = false,
  accent = false,
  className,
  children,
}: {
  as?: ElementType;
  bright?: boolean;
  accent?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "font-[family-name:var(--mono)] text-[10.5px] uppercase leading-none tracking-[0.16em]",
        accent
          ? "text-[var(--accent)]"
          : bright
            ? "text-[var(--ink-800)]"
            : "text-[var(--ink-600)]",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/** Display 1 — 56/1.05 at −0.04em. Never weight 700+. */
export function Display({
  as: Tag = "h1",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "text-[clamp(34px,6.4vw,70px)] font-semibold leading-[1.03] tracking-[-0.04em] text-[var(--ink-900)]",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/** Display 2 — section headings, 34/1.1 at −0.03em. */
export function Heading({
  as: Tag = "h2",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "text-[clamp(24px,3.4vw,38px)] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--ink-900)]",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/** Body — 14/1.5, capped at 62ch. INK 700 is the floor for prose. */
export function Body({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "max-w-[62ch] text-[14px] leading-[1.5] text-[var(--ink-700)]",
        className
      )}
    >
      {children}
    </p>
  );
}

/** Numbered section header — `01  Heading`. */
export function SectionHead({
  num,
  title,
  className,
}: {
  num: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-10 flex items-baseline gap-4", className)}>
      <span className="font-[family-name:var(--mono)] text-[10.5px] tracking-[0.16em] text-[var(--ink-500)]">
        {num}
      </span>
      <Heading>{title}</Heading>
    </div>
  );
}

/* ─── Actions ─────────────────────────────────────────────────────────────── */

type BtnVariant = "solid" | "outline" | "ghost" | "accent";

const BTN_BASE =
  "inline-flex items-center gap-[9px] whitespace-nowrap rounded-[var(--radius-action)] border px-5 py-3 " +
  "font-[family-name:var(--mono)] text-[10.5px] uppercase leading-none tracking-[0.14em] " +
  "transition-[background-color,border-color,color] duration-[var(--dur-base)] ease-[var(--ease-out)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-[var(--ink-050)] disabled:opacity-50";

const BTN_VARIANTS: Record<BtnVariant, string> = {
  solid:
    "border-[var(--paper)] bg-[var(--paper)] text-[var(--ink-050)] hover:border-[var(--ink-900)] hover:bg-[var(--ink-900)]",
  outline:
    "border-[var(--border-strong)] bg-transparent text-[var(--paper)] hover:border-white/30 hover:bg-white/[0.06]",
  ghost:
    "border-[var(--border)] bg-transparent text-[var(--ink-700)] hover:border-[var(--border-strong)] hover:text-[var(--paper)]",
  // Product surfaces only. One per page — this is the 5%.
  accent:
    "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-110",
};

export function Btn({
  variant = "outline",
  href,
  external,
  className,
  children,
  ...rest
}: {
  variant?: BtnVariant;
  href?: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "ref">) {
  const cls = cn(BTN_BASE, BTN_VARIANTS[variant], className);

  if (href) {
    return (
      <a
        href={href}
        className={cls}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/* ─── Surfaces ────────────────────────────────────────────────────────────── */

/** Card — INK 100 on INK 050, hairline border. Never a shadow. */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-action)] border border-[var(--border)] bg-[var(--ink-100)] p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Hairline grid: 1px gaps reveal the border colour beneath. */
export function Grid({
  min = 240,
  className,
  children,
}: {
  min?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("grid gap-px border border-[var(--border)]", className)}
      style={{
        background: "var(--border)",
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}

export function Cell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("bg-[var(--ink-050)] p-6", className)}>{children}</div>
  );
}

/** Status pill. Status only — never an action. */
export function Badge({
  live = false,
  className,
  children,
}: {
  live?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border-strong)] px-3 py-[5px]",
        "font-[family-name:var(--mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--ink-700)]",
        className
      )}
    >
      {live && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
          // The one permitted glow in the system.
          style={{ boxShadow: "0 0 10px var(--accent)" }}
        />
      )}
      {children}
    </span>
  );
}

/** The signature layout: numbered feature block with hairline-separated list. */
export function Feature({
  num,
  title,
  blurb,
  points,
}: {
  num: string;
  title: string;
  blurb: string;
  points?: string[];
}) {
  return (
    <div className="grid grid-cols-[44px_1fr] gap-5 border-b border-[var(--border)] py-7 last:border-b-0">
      <span className="pt-[3px] font-[family-name:var(--mono)] text-[10.5px] tracking-[0.1em] text-[var(--ink-500)]">
        {num}
      </span>
      <div>
        <h3 className="mb-2 text-[15px] font-semibold tracking-[-0.01em] text-[var(--ink-900)]">
          {title}
        </h3>
        <Body className="text-[13px]">{blurb}</Body>
        {points && (
          <ul className="mt-3">
            {points.map(p => (
              <li
                key={p}
                className="relative border-t border-[var(--border)] py-1.5 pl-[18px] text-[13px] text-[var(--ink-700)]"
              >
                <span className="absolute left-0 top-[14px] h-px w-[6px] bg-[var(--ink-500)]" />
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** 64px background grid, masked by a radial gradient at section tops. */
export function GridOverlay({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 opacity-55", className)}
      style={{
        backgroundImage:
          "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
        backgroundSize: "var(--grid-cell) var(--grid-cell)",
        maskImage:
          "radial-gradient(ellipse 90% 60% at 50% 0%, #000 10%, transparent 75%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 90% 60% at 50% 0%, #000 10%, transparent 75%)",
      }}
    />
  );
}

/* ─── Motion ──────────────────────────────────────────────────────────────── */

/** Fade + 8px rise, once, on scroll-in. Honours prefers-reduced-motion. */
export function Reveal({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
