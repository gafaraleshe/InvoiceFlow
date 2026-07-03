import { ClerkProvider } from "@clerk/clerk-react";
import { Link } from "wouter";
import { clerkConfigured, clerkPublishableKey } from "@/lib/auth";

/**
 * Wraps the authenticated app (and the /login page) with Clerk. Marketing pages
 * render outside this, so the public site keeps working even if Clerk env vars
 * aren't set. When unconfigured we show a friendly notice instead of throwing.
 */
export function ClerkGate({ children }: { children: React.ReactNode }) {
  if (!clerkConfigured) {
    return (
      <div className="mkt flex min-h-screen items-center justify-center px-5 py-12 text-center">
        <div className="mkt-panel max-w-[420px] rounded-2xl p-8">
          <h1 className="mkt-display text-[22px] text-[var(--mkt-ink)]">
            Authentication isn&apos;t configured
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--mkt-ink-subtle)]">
            Set <code className="text-[var(--mkt-primary-soft)]">VITE_CLERK_PUBLISHABLE_KEY</code>{" "}
            (and the server&apos;s{" "}
            <code className="text-[var(--mkt-primary-soft)]">CLERK_SECRET_KEY</code>) to enable
            sign-in. See <code className="text-[var(--mkt-primary-soft)]">docs/SETUP_GUIDE.md</code>.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-[13px] font-medium text-[var(--mkt-primary-hover)] hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey!}
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: "var(--mkt-primary)",
          colorBackground: "var(--mkt-surface-1)",
          colorInputBackground: "var(--mkt-surface-1)",
          colorText: "var(--mkt-ink)",
          colorTextSecondary: "var(--mkt-ink-subtle)",
          colorInputText: "var(--mkt-ink)",
          colorNeutral: "var(--mkt-ink)",
          borderRadius: "0.625rem",
        },
        elements: {
          card: "bg-transparent shadow-none",
          rootBox: "w-full",
          headerTitle: "hidden",
          headerSubtitle: "hidden",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
