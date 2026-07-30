import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { devAuthEnabled } from "@/lib/auth";
import { DevSignIn } from "@/_core/DevSignIn";

type Mode = "signin" | "signup";

/** Shared chrome so both sign-in paths look identical. */
function LoginShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mkt flex min-h-screen items-center justify-center px-5 py-12">
      <div className="mkt-grid-bg pointer-events-none fixed inset-0 opacity-40" />
      <div className="relative w-full max-w-[400px]">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-[16px] font-semibold tracking-tight text-[var(--mkt-ink)]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--mkt-primary)] text-[14px] font-bold text-white">
            I
          </span>
          HermiteFlow
        </Link>

        <div className="mkt-panel rounded-2xl p-7">
          <h1 className="mkt-display text-[24px] text-[var(--mkt-ink)]">
            {title}
          </h1>
          <p className="mt-1.5 text-[14px] text-[var(--mkt-ink-subtle)]">
            {subtitle}
          </p>

          <div className="mt-6">{children}</div>

          {footer}
        </div>

        <p className="mt-6 text-center text-[12px] text-[var(--mkt-ink-tertiary)]">
          <Link href="/" className="hover:text-[var(--mkt-ink-muted)]">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

function ClerkLogin() {
  const [, setLocation] = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");

  // If already signed in, go straight to the dashboard.
  useEffect(() => {
    if (isLoaded && isSignedIn) setLocation("/dashboard");
  }, [isLoaded, isSignedIn, setLocation]);

  return (
    <LoginShell
      title={mode === "signin" ? "Welcome back" : "Create your account"}
      subtitle={
        mode === "signin"
          ? "Sign in to your HermiteFlow workspace."
          : "Start invoicing in under two minutes."
      }
      footer={
        <p className="mt-5 text-center text-[13px] text-[var(--mkt-ink-subtle)]">
          {mode === "signin"
            ? "New to HermiteFlow?"
            : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-medium text-[var(--mkt-primary-hover)] hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      }
    >
      {mode === "signin" ? (
        <SignIn
          routing="virtual"
          signUpUrl="/login"
          fallbackRedirectUrl="/dashboard"
        />
      ) : (
        <SignUp
          routing="virtual"
          signInUrl="/login"
          fallbackRedirectUrl="/dashboard"
        />
      )}
    </LoginShell>
  );
}

function DevLogin() {
  return (
    <LoginShell
      title="Welcome back"
      subtitle="Sign in to your HermiteFlow workspace."
    >
      <DevSignIn />
    </LoginShell>
  );
}

/**
 * Which sign-in to render is decided by build-time env and never changes at
 * runtime. ClerkLogin calls Clerk hooks and so must not mount when Clerk has no
 * provider (see ClerkGate) — hence two components rather than one with a branch.
 */
export default function Login() {
  return devAuthEnabled ? <DevLogin /> : <ClerkLogin />;
}
