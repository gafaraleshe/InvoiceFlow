import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

type Mode = "signin" | "signup";

export default function Login() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // If already signed in, go straight to the dashboard.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setLocation("/dashboard");
    });
  }, [setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseConfigured) {
      toast.error(
        "Authentication isn't configured yet (missing Supabase keys)."
      );
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        toast.success(
          "Account created. Check your email to confirm, then sign in."
        );
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setLocation("/dashboard");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!supabaseConfigured) {
      toast.error(
        "Authentication isn't configured yet (missing Supabase keys)."
      );
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
  };

  const input =
    "w-full rounded-lg border border-[#23252a] bg-[#0f1011] px-3.5 py-2.5 text-[14px] text-[#f7f8f8] placeholder:text-[#62666d] transition-colors focus:border-[#5e6ad2] focus:outline-none focus:ring-2 focus:ring-[#5e69d1]/30";

  return (
    <div className="mkt flex min-h-screen items-center justify-center px-5 py-12">
      <div className="mkt-grid-bg pointer-events-none fixed inset-0 opacity-40" />
      <div className="relative w-full max-w-[400px]">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-[16px] font-semibold tracking-tight text-[#f7f8f8]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#5e6ad2] text-[14px] font-bold text-white">
            I
          </span>
          InvoiceFlow
        </Link>

        <div className="mkt-panel rounded-2xl p-7">
          <h1 className="mkt-display text-[24px] text-[#f7f8f8]">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-[14px] text-[#8a8f98]">
            {mode === "signin"
              ? "Sign in to your InvoiceFlow workspace."
              : "Start invoicing in under two minutes."}
          </p>

          <button
            onClick={handleGoogle}
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-lg border border-[#34343a] bg-[#0f1011] py-2.5 text-[14px] font-medium text-[#f7f8f8] transition-colors hover:bg-[#141516]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#23252a]" />
            <span className="text-[12px] text-[#62666d]">or</span>
            <div className="h-px flex-1 bg-[#23252a]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <input
                className={input}
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            )}
            <input
              className={input}
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              className={input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5e6ad2] py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#828fff] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign in" : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-[#8a8f98]">
            {mode === "signin"
              ? "New to InvoiceFlow?"
              : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-[#828fff] hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-[12px] text-[#62666d]">
          <Link href="/" className="hover:text-[#d0d6e0]">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
