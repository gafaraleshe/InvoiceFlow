import { cn } from "@/lib/utils";
import { Link } from "wouter";
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
  return <span className="mkt-eyebrow text-[#828fff]">{children}</span>;
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e69d1]/60 disabled:opacity-50";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#5e6ad2] text-white hover:bg-[#828fff] shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
  secondary:
    "bg-[#0f1011] text-[#f7f8f8] border border-[#34343a] hover:border-[#4a4a52] hover:bg-[#141516]",
  ghost: "text-[#d0d6e0] hover:text-white hover:bg-white/5",
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
        "inline-flex items-center gap-1.5 rounded-full border border-[#23252a] bg-[#141516] px-3 py-1 text-[12px] font-medium text-[#d0d6e0]",
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
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center"
          ? "items-center text-center"
          : "items-start text-left",
        className
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mkt-display text-[clamp(28px,4vw,44px)] text-[#f7f8f8] max-w-[20ch]">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-[17px] leading-relaxed text-[#8a8f98]",
            align === "center" ? "max-w-[58ch]" : "max-w-[52ch]"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function GlowDivider() {
  return (
    <div className="mx-auto h-px max-w-[1180px] bg-gradient-to-r from-transparent via-[#34343a] to-transparent" />
  );
}
