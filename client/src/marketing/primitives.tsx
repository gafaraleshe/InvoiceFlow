import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

/**
 * Shared marketing primitives styled to the Linear-inspired system in
 * DESIGN.md. Everything here assumes it renders inside a `.mkt` scope so the
 * dark canvas + token CSS variables are available.
 */

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1180px] px-5 sm:px-6", className)}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="mkt-eyebrow text-[var(--mkt-primary-hover)]">{children}</span>;
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse";
type ButtonSize = "sm" | "md" | "lg";

/**
 * Brand system, § Components: all button labels are mono, uppercase, 0.14em
 * tracking, radius 2px. Never rounded pills for actions, and no drop shadows —
 * depth comes from hairlines and a background shift.
 */
const buttonBase =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-action)] border " +
  "font-[family-name:var(--mono)] uppercase leading-none tracking-[0.14em] " +
  "transition-[background-color,border-color,color] duration-[var(--dur-base)] ease-[var(--ease-out)] " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-[var(--mkt-canvas)] disabled:opacity-50";

const buttonVariants: Record<ButtonVariant, string> = {
  // The accent CTA. One per page — this is the ~5%.
  primary:
    "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-110",
  secondary:
    "border-[var(--mkt-hairline-strong)] bg-transparent text-[var(--mkt-ink)] hover:border-[var(--mkt-mock-faint)] hover:bg-[var(--mkt-surface-2)]",
  ghost:
    "border-[var(--mkt-hairline)] bg-transparent text-[var(--mkt-ink-subtle)] hover:border-[var(--mkt-hairline-strong)] hover:text-[var(--mkt-ink)]",
  inverse:
    "border-[var(--paper)] bg-[var(--paper)] text-[var(--mkt-canvas)] hover:border-[var(--mkt-ink-muted)] hover:bg-[var(--mkt-ink-muted)]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-4 text-[10px]",
  md: "h-10 px-5 text-[10.5px]",
  lg: "h-12 px-6 text-[10.5px]",
};

export function MButton({
  variant = "primary",
  size = "md",
  className,
  href,
  external,
  children,
  ...props
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  external?: boolean;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "ref">) {
  const classes = cn(
    buttonBase,
    buttonVariants[variant],
    buttonSizes[size],
    className
  );

  if (href) {
    if (external || href.startsWith("http") || href.startsWith("/api")) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export function Pill({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--mkt-hairline)] bg-[var(--mkt-surface-2)] px-3 py-1 text-[12px] font-medium text-[var(--mkt-ink-muted)]",
        className
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex flex-col gap-4",
        align === "center"
          ? "items-center text-center"
          : "items-start text-left",
        className
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mkt-display text-[clamp(28px,4vw,44px)] text-[var(--mkt-ink)] max-w-[20ch]">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-[17px] leading-relaxed text-[var(--mkt-ink-subtle)]",
            align === "center" ? "max-w-[58ch]" : "max-w-[52ch]"
          )}
        >
          {description}
        </p>
      ) : null}
    </motion.div>
  );
}

export function GlowDivider() {
  return (
    <div className="mx-auto h-px max-w-[1180px] bg-gradient-to-r from-transparent via-[var(--mkt-hairline-strong)] to-transparent" />
  );
}
