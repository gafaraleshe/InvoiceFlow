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

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mkt-primary-focus)]/60 disabled:opacity-50";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--mkt-primary)] text-white hover:bg-[var(--mkt-primary-hover)] shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
  secondary:
    "bg-[var(--mkt-surface-1)] text-[var(--mkt-ink)] border border-[var(--mkt-hairline-strong)] hover:border-[var(--mkt-mock-faint)] hover:bg-[var(--mkt-surface-2)]",
  ghost:
    "text-[var(--mkt-ink-muted)] hover:text-[var(--mkt-ink)] hover:bg-[var(--mkt-surface-3)]",
  inverse: "bg-white text-black hover:bg-[#f5f6f6]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-4 text-[14px]",
  lg: "h-11 px-5 text-[15px]",
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
