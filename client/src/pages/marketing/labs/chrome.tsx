/*
 * Hermite Labs — shared Composio chrome & primitives.
 *
 * The parent site (hermitelabs.com) commits to the Composio design language
 * from composio/DESIGN.md: a near-black canvas (#0f0f0f), pure black for
 * terminal/code surfaces, a single deep-electric-blue voltage (#0007cd) on
 * CTAs / wordmark / spotlight glows, brightness-step elevation (no drop
 * shadows), 8px CTAs, and JetBrains Mono on every code surface.
 *
 * Unlike the rest of the marketing site (theme-aware via `.mkt` tokens) these
 * screens deliberately commit to a single dark look — that IS the brand — so
 * colours are fixed here rather than flipping with the theme.
 */
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Github, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { FLOW_URL } from "@/lib/host";

// ── Composio palette (composio/DESIGN.md) ──────────────────────────────────
export const LX = {
  canvas: "#0f0f0f",
  canvasDeep: "#000000",
  card: "#181818",
  cardElevated: "#222222",
  surfaceStrong: "#2a2a2a",
  hairline: "#222222",
  hairlineSoft: "#1a1a1a",
  hairlineStrong: "#333333",
  primary: "#0007cd",
  primaryActive: "#0005a3",
  primaryGlow: "#1a26ff",
  ink: "#ffffff",
  body: "#a8a8a8",
  muted: "#888888",
  mutedSoft: "#666666",
  cyan: "#00d4ff",
  success: "#33d17a",
} as const;

export const MONO =
  "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace";

/** Labs-internal links honour the host: real routes on hermitelabs.com, and
 *  `/labs`-prefixed previews everywhere else (localhost, Vercel previews). */
export function useLabsHref() {
  const [location] = useLocation();
  const preview = location.startsWith("/labs");
  return (path: string) => {
    const clean = path === "/" ? "" : path;
    return preview ? `/labs${clean}` : path;
  };
}

// ── Buttons — 8px radius, never full pills (Composio dialect) ───────────────
type BtnVariant = "primary" | "secondary" | "outline";
const btnBase =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-[18px] text-[14px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a26ff]/60";

export function LButton({
  variant = "primary",
  href,
  external,
  children,
  className = "",
}: {
  variant?: BtnVariant;
  href?: string;
  external?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const styles: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: LX.primary, color: LX.ink },
    secondary: { background: LX.cardElevated, color: LX.ink },
    outline: {
      background: "transparent",
      color: LX.ink,
      border: `1px solid ${LX.hairlineStrong}`,
    },
  };
  const cls = `${btnBase} ${className}`;
  const style = styles[variant];
  if (href) {
    if (external || href.startsWith("http")) {
      return (
        <a href={href} className={cls} style={style}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} style={style}>
        {children}
      </Link>
    );
  }
  return (
    <span className={cls} style={style}>
      {children}
    </span>
  );
}

/** Uppercase caption label (composio `caption-uppercase`). */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span
      className="text-[11px] font-semibold uppercase"
      style={{ letterSpacing: "0.16em", color: LX.primaryGlow }}
    >
      {children}
    </span>
  );
}

/** Small uppercase pill (composio `badge-pill`). */
export function BadgePill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "live";
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
      style={{
        letterSpacing: "0.12em",
        background: LX.cardElevated,
        color: tone === "live" ? LX.success : LX.body,
        border: `1px solid ${LX.hairline}`,
      }}
    >
      {tone === "live" ? (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: LX.success }}
        />
      ) : null}
      {children}
    </span>
  );
}

/** Radial electric-blue spotlight — pair with every hero (composio Do's). */
export function Spotlight({
  className = "",
  size = 820,
  opacity = 0.28,
}: {
  className?: string;
  size?: number;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full blur-[130px] ${className}`}
      style={{
        width: size,
        height: size * 0.62,
        opacity,
        background: `radial-gradient(circle, ${LX.primaryGlow}, transparent 70%)`,
      }}
    />
  );
}

/** A macOS-style terminal window with traffic lights (composio `terminal-pane`). */
export function TerminalWindow({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border ${className}`}
      style={{ borderColor: LX.hairlineStrong, background: LX.canvasDeep }}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-2.5"
        style={{ borderColor: LX.hairline }}
      >
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ff5f57" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#febc2e" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#28c840" }} />
        </span>
        <span
          className="ml-2 text-[11px]"
          style={{ fontFamily: MONO, color: LX.muted }}
        >
          {title}
        </span>
      </div>
      <div className="p-4" style={{ fontFamily: MONO }}>
        {children}
      </div>
    </div>
  );
}

function Wordmark() {
  const href = useLabsHref();
  return (
    <Link
      href={href("/")}
      className="flex items-center gap-2 text-[15px] font-semibold tracking-tight"
      style={{ color: LX.ink }}
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-md text-[13px] font-bold"
        style={{ background: LX.primary, color: LX.ink }}
      >
        H
      </span>
      Hermite Labs
    </Link>
  );
}

const NAV = [
  { label: "Products", path: "/#products" },
  { label: "Hermite Flow", path: "/flow" },
  { label: "Platform", path: "/#platform" },
];

export function LabsShell({ children }: { children: ReactNode }) {
  const href = useLabsHref();
  const [open, setOpen] = useState(false);
  return (
    <div
      className="min-h-screen"
      style={{ background: LX.canvas, color: LX.body, fontFamily: "var(--font-sans)" }}
    >
      {/* Nav — 64px, dark canvas */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          borderColor: LX.hairline,
          background: "rgba(15,15,15,0.8)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-6">
          <Wordmark />
          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map(n => (
              <Link
                key={n.label}
                href={n.path.startsWith("/#") ? href("/") + n.path.slice(1) : href(n.path)}
                className="text-[14px] font-medium transition-colors hover:text-white"
                style={{ color: LX.body }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/gafaraleshe/hermite"
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[#222] sm:flex"
              style={{ color: LX.body }}
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <LButton variant="primary" href={FLOW_URL} external className="hidden sm:inline-flex">
              Open Flow
              <ArrowUpRight className="h-4 w-4" />
            </LButton>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
              style={{ color: LX.ink }}
              onClick={() => setOpen(v => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open ? (
          <div className="border-t md:hidden" style={{ borderColor: LX.hairline }}>
            <div className="mx-auto flex max-w-[1200px] flex-col gap-1 px-5 py-3">
              {NAV.map(n => (
                <Link
                  key={n.label}
                  href={n.path.startsWith("/#") ? href("/") + n.path.slice(1) : href(n.path)}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[15px] font-medium"
                  style={{ color: LX.body }}
                >
                  {n.label}
                </Link>
              ))}
              <a
                href={FLOW_URL}
                className="mt-1 rounded-lg px-3 py-2.5 text-[15px] font-medium"
                style={{ color: LX.ink, background: LX.primary }}
              >
                Open Flow →
              </a>
            </div>
          </div>
        ) : null}
      </header>

      {children}

      {/* Footer — dark, multi-column */}
      <footer className="border-t" style={{ borderColor: LX.hairline }}>
        <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <Wordmark />
              <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed" style={{ color: LX.muted }}>
                Software for creative businesses, by Gaffy Studios. One account,
                one design language, across the whole studio.
              </p>
            </div>
            <FooterCol
              title="Products"
              links={[
                { label: "Hermite Flow", href: href("/flow") },
                { label: "Hermite AI", href: "#" },
                { label: "Hermite Auth", href: "#" },
                { label: "Hermite Analytics", href: "#" },
              ]}
            />
            <FooterCol
              title="Hermite Flow"
              links={[
                { label: "Open the app", href: FLOW_URL, external: true },
                { label: "Bookings & CRM", href: href("/flow") + "#crm" },
                { label: "Invoicing", href: href("/flow") + "#invoicing" },
                { label: "API & MCP", href: href("/flow") + "#api" },
              ]}
            />
            <FooterCol
              title="Company"
              links={[
                { label: "GitHub", href: "https://github.com/gafaraleshe/hermite", external: true },
                { label: "Gaffy Studios", href: "https://www.gafaraleshe.com", external: true },
              ]}
            />
          </div>
          <div
            className="mt-12 flex flex-col items-start justify-between gap-3 border-t pt-6 sm:flex-row sm:items-center"
            style={{ borderColor: LX.hairline }}
          >
            <span className="text-[12px]" style={{ color: LX.mutedSoft }}>
              © {new Date().getFullYear()} Hermite Labs · Gaffy Studios
            </span>
            <span className="text-[12px]" style={{ fontFamily: MONO, color: LX.mutedSoft }}>
              hermitelabs.com
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <div
        className="text-[11px] font-semibold uppercase"
        style={{ letterSpacing: "0.14em", color: LX.muted }}
      >
        {title}
      </div>
      <ul className="mt-4 space-y-2.5">
        {links.map(l => (
          <li key={l.label}>
            {l.external || l.href.startsWith("http") || l.href.startsWith("#") ? (
              <a
                href={l.href}
                className="text-[14px] transition-colors hover:text-white"
                style={{ color: LX.body }}
                {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {l.label}
              </a>
            ) : (
              <Link
                href={l.href}
                className="text-[14px] transition-colors hover:text-white"
                style={{ color: LX.body }}
              >
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
