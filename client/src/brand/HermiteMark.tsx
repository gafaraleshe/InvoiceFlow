/**
 * The Hermite mark — an `H` built from two rails and a severed crossbar.
 *
 * The gap is a *cut*: a nod to the editing origin of the company, and a visual
 * shorthand for what every Hermite product does — split a process at the right
 * point and rejoin it cleanly.
 *
 * Geometry is fixed on a 48×48 grid and must not be redrawn:
 *
 *   rail L      x=8  y=7  w=6  h=34  r=3
 *   rail R      x=34 y=7  w=6  h=34  r=3
 *   crossbar L  x=8  y=21 w=12 h=6   r=3
 *   crossbar R  x=28 y=21 w=12 h=6   r=3   ← accent applies here, and only here
 */
import { cn } from "@/lib/utils";

export type HermiteProduct = "flow" | "cut" | "mind";

const ACCENT_VAR: Record<HermiteProduct, string> = {
  flow: "var(--flow)",
  cut: "var(--cut)",
  mind: "var(--mind)",
};

export function HermiteMark({
  size = 24,
  product,
  className,
  title = "Hermite Labs",
}: {
  size?: number;
  /** Omit for the parent brand — hermitelabs.com is monochrome by rule. */
  product?: HermiteProduct;
  className?: string;
  title?: string;
}) {
  const fg = "currentColor";
  const accent = product ? ACCENT_VAR[product] : fg;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label={title}
      className={cn("shrink-0", className)}
    >
      <rect x="8" y="7" width="6" height="34" rx="3" fill={fg} />
      <rect x="34" y="7" width="6" height="34" rx="3" fill={fg} />
      <rect x="8" y="21" width="12" height="6" rx="3" fill={fg} />
      {/* The right crossbar segment is the only element that ever takes accent. */}
      <rect x="28" y="21" width="12" height="6" rx="3" fill={accent} />
    </svg>
  );
}

/**
 * Horizontal lockup: mark + wordmark.
 *
 * Product names are one word, capital H, capital product — HermiteFlow. Never
 * "Hermite Flow", "hermiteflow", or "HERMITEFLOW".
 */
export function HermiteLockup({
  product,
  size = 22,
  wordmarkSize = 19,
  className,
}: {
  product?: HermiteProduct;
  size?: number;
  wordmarkSize?: number;
  className?: string;
}) {
  const suffix = product
    ? { flow: "Flow", cut: "Cut", mind: "Mind" }[product]
    : " Labs";

  return (
    <span className={cn("inline-flex items-center gap-[11px]", className)}>
      <HermiteMark
        size={size}
        product={product}
        title={product ? `Hermite${suffix}` : "Hermite Labs"}
      />
      <span
        className="font-semibold tracking-[-0.035em] text-[var(--paper)]"
        style={{ fontSize: wordmarkSize }}
      >
        Hermite
        <span
          className={product ? "" : "font-medium text-[var(--ink-600)]"}
          style={product ? { color: ACCENT_VAR[product] } : undefined}
        >
          {suffix}
        </span>
      </span>
    </span>
  );
}
