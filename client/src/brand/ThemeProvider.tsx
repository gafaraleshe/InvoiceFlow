/**
 * The product theming mechanism.
 *
 * A product surface is the parent surface with ONE variable changed. This
 * component sets `data-product`, which flips `--accent` in tokens.css. That is
 * the entire system — if a product needs CSS beyond this variable, the design
 * has drifted and should be corrected rather than special-cased.
 *
 *   <HermiteTheme>              → Hermite Labs, monochrome (no accent)
 *   <HermiteTheme product="flow"> → HermiteFlow, accent #3ADCC8
 */
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { HermiteProduct } from "./HermiteMark";

export function HermiteTheme({
  product,
  light = false,
  className,
  children,
}: {
  /** Omit for hermitelabs.com. The parent brand carries no accent, ever. */
  product?: HermiteProduct;
  /** Invert the ink ramp. Accents hold, dropping to 88% lightness for fills. */
  light?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-product={product}
      className={cn(
        "hermite min-h-screen bg-[var(--ink-050)] text-[var(--ink-900)] antialiased",
        light && "light-surface",
        className
      )}
    >
      {children}
    </div>
  );
}
