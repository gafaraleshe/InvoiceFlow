import { useState } from "react";
import { setDevIdentity } from "@/lib/auth";

/**
 * Sign-in form for local development, used in place of Clerk's widget when
 * VITE_DEV_AUTH=1 (see lib/auth.ts). There is no password: you state who you
 * are and the server takes your word for it, which is why the server refuses
 * this mode in production builds.
 *
 * The same email always resolves to the same user id, so signing in again
 * returns you to the same workspace and data. A first-time email gets a fresh
 * workspace provisioned automatically.
 */
export function DevSignIn() {
  const [email, setEmail] = useState("dev@example.com");
  const [name, setName] = useState("Dev User");
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setDevIdentity({ email: trimmed, name: name.trim() || null });
    // Full navigation: session state is read from localStorage at load, so a
    // reload is the simplest way to get every consumer onto the new identity.
    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-lg border border-[var(--mkt-primary-soft)]/30 bg-[var(--mkt-primary)]/10 px-3 py-2.5 text-[12px] leading-relaxed text-[var(--mkt-ink-subtle)]">
        <b className="text-[var(--mkt-ink)]">Development sign-in.</b> No
        password is checked — any email signs in. Set Clerk keys for real
        authentication.
      </div>

      <label className="block">
        <span className="text-[13px] font-medium text-[var(--mkt-ink-subtle)]">
          Email
        </span>
        <input
          type="email"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            setError(null);
          }}
          autoComplete="email"
          className="mt-1.5 w-full rounded-lg border border-[var(--mkt-hairline)] bg-[var(--mkt-surface-1)] px-3 py-2 text-[14px] text-[var(--mkt-ink)] outline-none focus:border-[var(--mkt-primary)]"
        />
      </label>

      <label className="block">
        <span className="text-[13px] font-medium text-[var(--mkt-ink-subtle)]">
          Name
        </span>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          autoComplete="name"
          className="mt-1.5 w-full rounded-lg border border-[var(--mkt-hairline)] bg-[var(--mkt-surface-1)] px-3 py-2 text-[14px] text-[var(--mkt-ink)] outline-none focus:border-[var(--mkt-primary)]"
        />
      </label>

      {error && <p className="text-[13px] text-red-400">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-lg bg-[var(--mkt-primary)] px-4 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
      >
        Sign in
      </button>
    </form>
  );
}
