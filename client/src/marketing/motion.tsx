import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Shared marketing motion system (Mobbin-inspired): smooth, spring-eased
 * entrances, staggered content, and in-view triggers. Everything respects
 * `prefers-reduced-motion` — when set, content renders in its final state with
 * no animation.
 */

// easeOutExpo-ish — the calm, confident curve Mobbin leans on.
export const EASE = [0.22, 1, 0.36, 1] as const;

export const SPRING = { type: "spring", stiffness: 130, damping: 20, mass: 0.9 } as const;

type DivProps = {
  children: ReactNode;
  className?: string;
};

/** Fade + rise as the element scrolls into view (once). */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
}: DivProps & { delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const parentVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/** Container that staggers its <StaggerItem> children into view. */
export function Stagger({ children, className }: DivProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={parentVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: DivProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={childVariants}>
      {children}
    </motion.div>
  );
}

/** Gentle idle float — used to make the hero product feel alive. */
export function Floating({
  children,
  className,
  distance = 8,
  duration = 6,
}: DivProps & { distance?: number; duration?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, ease: "easeInOut", repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}

/** Animates a number from 0 → `to` the first time it scrolls into view. */
export function CountUp({
  to,
  format,
  className,
  duration = 1.2,
}: {
  to: number;
  format: (v: number) => string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (reduce) {
      setValue(to);
      return;
    }
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: v => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
