import { ClerkProvider } from "@clerk/clerk-react";
import { Link } from "wouter";
import { clerkConfigured, clerkPublishableKey } from "@/lib/auth";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Wraps the authenticated app (and the /login page) with Clerk. Marketing pages
 * render outside this, so the public site keeps working even if Clerk env vars
 * aren't set. When unconfigured we show a friendly notice instead of throwing.
 */
export function ClerkGate({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
        // NOTE: Clerk parses these into color scales, so they must be real
        // color values — CSS var() references break the widget.
        variables: {
          colorPrimary: "#5e6ad2",
          colorBackground: isDark ? "#0f1011" : "#ffffff",
          colorInputBackground: isDark ? "#0f1011" : "#ffffff",
          colorText: isDark ? "#f7f8f8" : "#0c0d10",
          colorTextSecondary: isDark ? "#8a8f98" : "#5a5f68",
          colorInputText: isDark ? "#f7f8f8" : "#0c0d10",
          colorNeutral: isDark ? "#f7f8f8" : "#0c0d10",
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
